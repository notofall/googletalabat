
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
  
  const [pendingPOs, setPendingPOs] = useState<PurchaseOrder[]>([]);
  const [historyReceipts, setHistoryReceipts] = useState<any[]>([]);
  
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [inputQuantities, setInputQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      const pos = await dbService.getPendingPOs();
      // Only Approved/Partially Received POs
      setPendingPOs(pos.filter(p => p.status === 'APPROVED' || p.status === 'PARTIALLY_RECEIVED' || p.status === 'SENT_TO_SUPPLIER'));
      
      const hist = await dbService.getReceiptsHistory();
      setHistoryReceipts(hist);
    };
    loadData();
  }, [receiptSuccess, activeTab]);

  const handleSelectPO = (po: PurchaseOrder) => {
    setPoNumber(po.id);
    setSelectedPO(po);
    const initialInputs: Record<string, number> = {};
    po.items.forEach(item => initialInputs[item.itemId] = 0);
    setInputQuantities(initialInputs);
  };

  const handleInputChange = (itemId: string, val: string) => {
    setInputQuantities(prev => ({ ...prev, [itemId]: Number(val) }));
  };

  const handleConfirmReceipt = async () => {
    if (!selectedPO) return;

    const itemsToReceive = [];
    
    for (const item of selectedPO.items) {
      const inputQty = inputQuantities[item.itemId] || 0;
      if (inputQty > 0) {
        // UI Logic validation
        const validation = BusinessRules.validateReceiptQuantity(item, inputQty);
        if (!validation.valid) {
          alert(`خطأ في البند "${item.name}": ${validation.message}`);
          return;
        }
        itemsToReceive.push({ itemId: item.itemId, quantity: inputQty });
      }
    }

    if (itemsToReceive.length === 0) {
      alert("يجب إدخال كمية مستلمة لبند واحد على الأقل.");
      return;
    }

    try {
      await dbService.createReceipt({
        // NO ID GENERATION HERE
        poId: selectedPO.id,
        items: itemsToReceive
      });

      setReceiptSuccess(true);
      setPoNumber('');
      setSelectedPO(null);
      setTimeout(() => setReceiptSuccess(false), 5000);
    } catch (e: any) {
      alert(`فشل الاستلام: ${e.message}`);
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
                         <span className="font-black text-slate-800 text-sm">{po.id.slice(0,8)}</span>
                         <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs font-bold text-emerald-700 mb-0.5 truncate">{po.supplierName || po.supplierId}</p>
                      <p className="text-[10px] text-slate-500 truncate">{po.projectName}</p>
                   </button>
                ))}
                {pendingPOs.length === 0 && <p className="text-sm text-slate-400 font-bold p-4">لا توجد أوامر شراء معتمدة بانتظار الاستلام.</p>}
             </div>
          </div>

          {selectedPO && (
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 animate-slideUp">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ClipboardCheck className="text-emerald-600" /> نموذج استلام: {selectedPO.id.slice(0,8)}
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-black text-slate-800 text-sm">بنود الطلب (تطبيق القاعدة BL-002)</h4>
                </div>
                
                <div className="space-y-3">
                  {selectedPO.items.map((item) => {
                    const remaining = item.quantity - item.receivedQuantity;
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
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
           <table className="w-full text-left">
              <thead><tr><th className="p-4">Receipt ID</th><th className="p-4">PO Ref</th><th className="p-4">Date</th><th className="p-4">Received By</th></tr></thead>
              <tbody>
                {historyReceipts.map(rec => (
                   <tr key={rec.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 font-bold">{rec.id.slice(0,8)}</td>
                      <td className="p-4">{rec.po_id.slice(0,8)}</td>
                      <td className="p-4">{new Date(rec.received_date).toLocaleDateString()}</td>
                      <td className="p-4 text-xs">{rec.received_by}</td>
                   </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default ReceiptsView;
