
import React, { useState, useEffect } from 'react';
import { 
  PackageOpen, Camera, QrCode, ClipboardCheck, History, CheckCircle2,
  Building2, Truck, Filter, ArrowLeftRight, Archive, CalendarCheck
} from 'lucide-react';
import { User, PurchaseOrder, POItem } from '../types';
import { dbService } from '../services/databaseService';
import { BusinessRules } from '../services/businessRules';

const ReceiptsView: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [poNumber, setPoNumber] = useState('');
  const [receiptSuccess, setReceiptSuccess] = useState(false);
  
  // State linked to Database Tables
  const [pendingPOs, setPendingPOs] = useState<PurchaseOrder[]>([]);
  const [historyReceipts, setHistoryReceipts] = useState<any[]>([]);
  
  // Selected PO State
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [inputQuantities, setInputQuantities] = useState<Record<string, number>>({});

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      const pos = await dbService.getPendingPOs();
      // Filter only Approved POs for reception (System Logic)
      setPendingPOs(pos.filter(p => p.status === 'APPROVED' || p.status === 'PARTIALLY_RECEIVED' || p.status === 'SENT_TO_SUPPLIER'));
      
      const hist = await dbService.getReceiptsHistory();
      setHistoryReceipts(hist);
    };
    loadData();
  }, [receiptSuccess]);

  const handleSelectPO = (po: PurchaseOrder) => {
    setPoNumber(po.id);
    setSelectedPO(po);
    // Reset inputs
    const initialInputs: Record<string, number> = {};
    po.items.forEach(item => initialInputs[item.itemId] = 0);
    setInputQuantities(initialInputs);
  };

  const handleInputChange = (itemId: string, val: string) => {
    setInputQuantities(prev => ({ ...prev, [itemId]: Number(val) }));
  };

  const handleConfirmReceipt = async () => {
    if (!selectedPO) return;

    // 1. Validation Phase (Business Logic Layer)
    const itemsToReceive = [];
    
    for (const item of selectedPO.items) {
      const inputQty = inputQuantities[item.itemId] || 0;
      if (inputQty > 0) {
        // BL-002 Rule Check
        const validation = BusinessRules.validateReceiptQuantity(item, inputQty);
        if (!validation.valid) {
          alert(`خطأ في البند "${item.name}": ${validation.message}`);
          return;
        }

        // BL-003 Rule Check (Optional Warning)
        const boqList = await dbService.getProjectBOQ(selectedPO.projectId);
        const boqItem = boqList.find(b => b.itemId === item.itemId);
        if (boqItem) {
           const boqCheck = BusinessRules.checkBOQStatus(boqItem, inputQty);
           if (boqCheck.status === 'CRITICAL') {
             if(!confirm(`تحذير حرج! ${boqCheck.message} هل تريد المتابعة رغم ذلك؟`)) return;
           } else if (boqCheck.status === 'WARNING') {
             alert(boqCheck.message);
           }
        }

        itemsToReceive.push({ itemId: item.itemId, quantity: inputQty });
      }
    }

    if (itemsToReceive.length === 0) {
      alert("يجب إدخال كمية مستلمة لبند واحد على الأقل.");
      return;
    }

    // 2. Execution Phase (Database Layer)
    const success = await dbService.createReceipt({
      id: `REC-${Date.now()}`,
      poId: selectedPO.id,
      projectId: selectedPO.projectId,
      receivedDate: new Date().toISOString().split('T')[0],
      receivedBy: user.name,
      items: itemsToReceive
    });

    if (success) {
      setReceiptSuccess(true);
      setPoNumber('');
      setSelectedPO(null);
      setTimeout(() => setReceiptSuccess(false), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة المخزون والاستلام</h2>
          <p className="text-slate-500">تطبيق قواعد العمل (Business Rules) على التوريدات الواردة.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto overflow-x-auto">
           <button onClick={() => setActiveTab('pending')} className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'pending' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
             <PackageOpen size={18} /> استلام جديد
           </button>
           <button onClick={() => setActiveTab('history')} className={`px-4 md:px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
             <History size={18} /> السجل
           </button>
        </div>
      </div>

      {receiptSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 animate-bounce">
          <CheckCircle2 size={24} className="shrink-0" />
          <p className="font-black">تم الاستلام وتحديث الجداول (PO & BOQ) بنجاح!</p>
        </div>
      )}

      {activeTab === 'pending' ? (
        <>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
             <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><Filter size={16}/> أوامر الشراء الجاهزة للاستلام</h3>
             <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {pendingPOs.map(po => (
                   <button 
                      key={po.id}
                      onClick={() => handleSelectPO(po)}
                      className={`min-w-[240px] p-4 rounded-2xl border text-right transition-all shrink-0 ${selectedPO?.id === po.id ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'}`}
                   >
                      <div className="flex justify-between items-start mb-2">
                         <span className="font-black text-slate-800 text-sm">{po.id}</span>
                         <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-slate-500">{po.createdAt}</span>
                      </div>
                      <p className="text-xs font-bold text-emerald-700 mb-0.5 truncate">{po.supplierName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{po.projectName}</p>
                   </button>
                ))}
                {pendingPOs.length === 0 && <p className="text-sm text-slate-400 font-bold p-4">لا توجد أوامر شراء معتمدة بانتظار الاستلام.</p>}
             </div>
          </div>

          {selectedPO && (
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 animate-slideUp">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ClipboardCheck className="text-emerald-600" /> نموذج استلام: {selectedPO.id}
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-black text-slate-800 text-sm">بنود الطلب (تطبيق القاعدة BL-002)</h4>
                </div>
                
                <div className="space-y-3">
                  {selectedPO.items.map((item) => {
                    const remaining = item.quantity - item.receivedQuantity;
                    // Skip fully received items
                    if (remaining <= 0) return null;

                    const currentInput = inputQuantities[item.itemId] || 0;
                    const isOverLimit = currentInput > remaining;

                    return (
                      <div key={item.id} className={`p-4 bg-white border rounded-2xl space-y-3 transition-all ${isOverLimit ? 'border-red-200 bg-red-50/20' : 'border-slate-200'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-black text-slate-800 text-sm">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">المطلوب كلياً: {item.quantity} | تم استلام: {item.receivedQuantity} | <span className="text-emerald-600">المتبقي: {remaining} {item.unit}</span></p>
                          </div>
                          <div className="relative self-end sm:self-auto">
                            <input 
                              type="number" 
                              min="0"
                              max={remaining}
                              value={currentInput || ''}
                              onChange={(e) => handleInputChange(item.itemId, e.target.value)}
                              className={`w-28 p-2 border rounded-xl text-center font-black focus:ring-2 outline-none transition-all ${isOverLimit ? 'border-red-500 bg-red-50 text-red-600' : 'bg-slate-50 border-slate-200 focus:ring-emerald-500'}`}
                              placeholder="الكمية"
                            />
                            {isOverLimit && <div className="absolute top-full right-0 text-[9px] text-red-600 font-black mt-1">تجاوز الحد!</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={handleConfirmReceipt}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all mt-6"
                >
                  تأكيد الاستلام وترحيل للجرد
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center text-slate-500 font-bold">
           هذه الواجهة تعرض البيانات من جدول "Receipts" (غير مفعلة في العرض التجريبي الحالي بشكل كامل).
        </div>
      )}
    </div>
  );
};

export default ReceiptsView;
