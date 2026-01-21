
import React, { useState, useMemo } from 'react';
import { 
  ArrowRightLeft, 
  Trophy, 
  FileSearch, 
  FileText,
  ArrowRight,
  Plus,
  CheckCircle2,
  X,
  Truck,
  CalendarDays,
  Table as TableIcon,
  TrendingDown,
  Zap,
  ShoppingCart,
  DollarSign,
  Edit,
  ShieldAlert,
  Save
} from 'lucide-react';
import { User, POStatus, UserRole, Supplier } from '../types';
import { DEFAULT_PROCUREMENT_LIMIT } from '../constants';

const ProcurementView: React.FC<{ user: User }> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'approved_requests' | 'active_rfqs' | 'pos'>('approved_requests');
  const [showComparison, setShowComparison] = useState(false);
  const [showAddQuoteModal, setShowAddQuoteModal] = useState(false);
  const [showDirectPOModal, setShowDirectPOModal] = useState(false);
  const [showEditPOModal, setShowEditPOModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  // الموردين المعتمدين
  const suppliers: Supplier[] = [
    { id: '1', name: 'مصنع الشرق للاسمنت', contact: 'خالد بن محمد', email: 'sales@east-cement.sa', rating: 4.5 },
    { id: '2', name: 'حديد اليمامة', contact: 'صالح الغامدي', email: 'orders@yamama-steel.com', rating: 4.8 },
    { id: '3', name: 'الخريف للكهرباء', contact: 'عبدالله الخريف', email: 'supply@alkhorayef.sa', rating: 4.2 },
    { id: '4', name: 'نوريد للتجارة', contact: 'محمد نور', email: 'info@norid.sa', rating: 3.9 },
  ];

  const approvedRequests = [
    { id: 'MR-1002', project: 'مجمع واحة العلوم', projectId: '2', date: '2024-05-19' },
    { id: 'MR-1004', project: 'برج التجارة العالمي', projectId: '1', date: '2024-05-21' },
  ];

  // محاكاة أوامر شراء موجودة للتجربة
  const [mockPOs, setMockPOs] = useState([
    { 
      id: 'PO-2024-001', 
      supplierName: 'مصنع الشرق للاسمنت', 
      project: 'مجمع واحة العلوم', 
      totalAmount: 1500, 
      status: POStatus.APPROVED,
      items: [
        { id: 'it-1', name: 'أسمنت بورتلاندي', unit: 'كيس', quantity: 100, price: 15 },
      ]
    }
  ]);

  const mockRequestItems = [
    { id: 'it-1', name: 'أسمنت بورتلاندي', unit: 'كيس', quantity: 100 },
    { id: 'it-2', name: 'رمل أحمر', unit: 'م3', quantity: 20 },
  ];

  const [allQuotes, setAllQuotes] = useState<Record<string, any[]>>({});
  const [quoteItemPrices, setQuoteItemPrices] = useState<Record<string, number>>({});
  const [quoteSupplierId, setQuoteSupplierId] = useState('');
  const [quoteDeliveryDays, setQuoteDeliveryDays] = useState('');

  // Fix: Defined handleCreateRFQ to resolve the reference error and enable the RFQ workflow
  const handleCreateRFQ = (req: any) => {
    setActiveSubTab('active_rfqs');
    alert(`تم البدء في طلب عروض الأسعار لـ ${req.id}. يمكنك الآن إضافة العروض المستلمة من الموردين في تبويب "عروض الأسعار".`);
  };

  const handleDirectPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteSupplierId) return;
    const supplier = suppliers.find(s => s.id === quoteSupplierId);
    const items = selectedRequest.items.map((it: any) => ({
      ...it,
      price: quoteItemPrices[it.id] || 0
    }));
    const total = items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0);

    const newPO = {
      id: `PO-${selectedRequest.id}`,
      supplierName: supplier?.name || 'مورد غير معروف',
      project: selectedRequest.project,
      totalAmount: total,
      status: POStatus.PENDING_APPROVAL,
      items: items
    };

    setMockPOs([...mockPOs, newPO]);
    setShowDirectPOModal(false);
    setActiveSubTab('pos');
    alert(`تم إصدار أمر الشراء رقم ${newPO.id}`);
  };

  const handleEditPOClick = (po: any) => {
    setSelectedPO(po);
    const initialPrices: Record<string, number> = {};
    po.items.forEach((it: any) => {
      initialPrices[it.id] = it.price;
    });
    setQuoteItemPrices(initialPrices);
    setShowEditPOModal(true);
  };

  const handleUpdatePOPrices = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedItems = selectedPO.items.map((it: any) => ({
      ...it,
      price: quoteItemPrices[it.id] || 0
    }));
    const newTotal = updatedItems.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0);

    setMockPOs(mockPOs.map(p => p.id === selectedPO.id ? { ...p, items: updatedItems, totalAmount: newTotal } : p));
    setShowEditPOModal(false);
    alert("تم تحديث أسعار أمر الشراء وإجمالي القيمة بنجاح.");
  };

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteSupplierId) return;
    const supplier = suppliers.find(s => s.id === quoteSupplierId);
    const itemsData = selectedRequest.items.map((it: any) => ({
      itemId: it.id,
      price: quoteItemPrices[it.id] || 0
    }));
    const total = itemsData.reduce((sum: number, it: any) => {
      const originalItem = selectedRequest.items.find((orig: any) => orig.id === it.itemId);
      return sum + (it.price * (originalItem?.quantity || 0));
    }, 0);

    const quoteEntry = {
      id: `Q-${Math.random().toString(36).substr(2, 5)}`,
      supplierId: quoteSupplierId,
      supplierName: supplier?.name,
      deliveryDays: Number(quoteDeliveryDays),
      rating: supplier?.rating || 0,
      items: itemsData,
      totalAmount: total
    };

    setAllQuotes(prev => ({
      ...prev,
      [selectedRequest.id]: [...(prev[selectedRequest.id] || []), quoteEntry]
    }));
    setShowAddQuoteModal(false);
    setQuoteSupplierId('');
    setQuoteItemPrices({});
    alert("تم إضافة عرض السعر.");
  };

  const handleSelectWinner = (quote: any) => {
    const isOverLimit = quote.totalAmount > (user.approvalLimit || DEFAULT_PROCUREMENT_LIMIT);
    alert(isOverLimit ? "تم تحويل الترسية للتعميد النهائي بسبب تجاوز المبلغ الصلاحية." : "تمت الترسية وإصدار أمر الشراء.");
    setActiveSubTab('pos');
    setShowComparison(false);
  };

  const currentQuotes = selectedRequest ? (allQuotes[selectedRequest.id] || []) : [];

  if (showComparison) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <button onClick={() => setShowComparison(false)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-all">
          <ArrowRight size={20} /> العودة للعروض
        </button>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><TableIcon className="text-emerald-600" />مقارنة وترسية العروض</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-6 border-b border-l min-w-[250px]">الصنف / الكمية</th>
                  {currentQuotes.map(q => (
                    <th key={q.id} className="p-6 border-b text-center min-w-[200px]">
                      <div className="mb-1 text-slate-800 text-sm font-black">{q.supplierName}</div>
                      <div className="flex justify-center gap-1 text-amber-500">★ {q.rating}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedRequest?.items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 border-l font-bold text-slate-700">{item.name} ({item.quantity} {item.unit})</td>
                    {currentQuotes.map(q => {
                      const itemQuote = q.items.find((i: any) => i.itemId === item.id);
                      return (
                        <td key={q.id} className="p-6 text-center font-black text-slate-800">
                          {itemQuote?.price.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ر.س</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-slate-50/80 font-black">
                  <td className="p-6 border-l">إجمالي العرض</td>
                  {currentQuotes.map(q => (
                    <td key={q.id} className="p-6 text-center text-emerald-600 text-xl">{q.totalAmount.toLocaleString()} <span className="text-xs">ر.س</span></td>
                  ))}
                </tr>
                <tr className="bg-slate-50/30">
                  <td className="p-6 border-l"></td>
                  {currentQuotes.map(q => (
                    <td key={q.id} className="p-6 text-center">
                      <button onClick={() => handleSelectWinner(q)} className="px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 mx-auto">
                        <Trophy size={14} /> ترسية العرض
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة المشتريات</h2>
          <p className="text-slate-500 font-medium tracking-tight">إصدار أوامر الشراء المباشرة أو إدارة مناقصات عروض الأسعار.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'approved_requests', label: 'الطلبات المعتمدة' },
          { id: 'active_rfqs', label: 'عروض الأسعار' },
          { id: 'pos', label: 'أوامر الشراء' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-8 py-2.5 rounded-xl font-black transition-all text-sm ${activeSubTab === tab.id ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'approved_requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {approvedRequests.map(req => (
            <div key={req.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-2">
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded">معتمد فنياً</span>
                <h3 className="text-xl font-black text-slate-800">{req.id}</h3>
                <p className="text-sm font-bold text-slate-500">{req.project}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                 <button onClick={() => { setSelectedRequest({ ...req, items: mockRequestItems }); setShowDirectPOModal(true); }} className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50">
                    <Zap size={18} /> تعميد مباشر (PO)
                 </button>
                 <button onClick={() => handleCreateRFQ(req)} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                    <ArrowRightLeft size={18} /> طلب عروض
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'active_rfqs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedRequests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded">بانتظار العروض</span>
                <span className="text-emerald-600 font-black text-xs">{allQuotes[req.id]?.length || 0} عروض</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-1">{req.id}</h3>
              <p className="text-sm font-bold text-slate-500 mb-6">{req.project}</p>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => { setSelectedRequest({ ...req, items: mockRequestItems }); setShowAddQuoteModal(true); }} className="py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                    <Plus size={16} /> إضافة عرض
                 </button>
                 <button onClick={() => { setSelectedRequest({ ...req, items: mockRequestItems }); setShowComparison(true); }} className="py-3 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    <FileSearch size={16} /> مقارنة وترسية
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'pos' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPOs.map(po => (
              <div key={po.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all">
                 <div className="flex justify-between mb-4">
                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded">أمر شراء مصدر</span>
                    <span className="text-slate-400 font-bold text-xs">{po.id}</span>
                 </div>
                 <h4 className="text-lg font-black text-slate-800 mb-1">{po.supplierName}</h4>
                 <p className="text-xs font-bold text-slate-500 mb-4">{po.project}</p>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">القيمة الإجمالية</p>
                    <p className="text-xl font-black text-slate-800">{po.totalAmount.toLocaleString()} ر.س</p>
                 </div>
                 {user.canEditPOPrices && (
                    <button 
                      onClick={() => handleEditPOClick(po)}
                      className="w-full py-3 bg-white border border-slate-200 text-emerald-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
                    >
                       <Edit size={16} /> تعديل أسعار البنود
                    </button>
                 )}
                 {!user.canEditPOPrices && (
                   <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 font-black uppercase">
                      <ShieldAlert size={14} /> التعديل مغلق من قبل المدير العام
                   </div>
                 )}
              </div>
            ))}
         </div>
      )}

      {/* Modal: Shared for Direct PO and Editing PO */}
      {(showDirectPOModal || showAddQuoteModal || showEditPOModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="text-2xl font-black text-slate-800">
                  {showEditPOModal ? `تعديل أسعار ${selectedPO?.id}` : (showDirectPOModal ? 'إصدار أمر شراء مباشر' : 'تفريغ عرض السعر')}
               </h3>
               <button onClick={() => { setShowDirectPOModal(false); setShowAddQuoteModal(false); setShowEditPOModal(false); }} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400"><X size={24} /></button>
            </div>
            <form onSubmit={showEditPOModal ? handleUpdatePOPrices : (showDirectPOModal ? handleDirectPO : handleAddQuote)} className="p-8 overflow-y-auto space-y-6">
               {!showEditPOModal && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase mr-1">المورد</label>
                      <select required value={quoteSupplierId} onChange={(e) => setQuoteSupplierId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold">
                        <option value="">اختر المورد...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase mr-1">مدة التوريد (أيام)</label>
                      <input required type="number" value={quoteDeliveryDays} onChange={(e) => setQuoteDeliveryDays(e.target.value)} placeholder="3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black" />
                    </div>
                 </div>
               )}

               {showEditPOModal && (
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-4 flex items-center gap-4">
                     <ShieldAlert className="text-emerald-600" size={24} />
                     <p className="text-sm font-black text-emerald-900 leading-relaxed">أنت تقوم الآن بتحديث الأسعار الحالية لأمر الشراء. سيتم إعادة حساب إجمالي الفاتورة تلقائياً عند الحفظ.</p>
                  </div>
               )}

               <div className="space-y-4">
                  <h4 className="font-black text-slate-800 flex items-center gap-2"><DollarSign className="text-emerald-500" size={18} /> تسعير البنود</h4>
                  {(showEditPOModal ? selectedPO?.items : selectedRequest?.items)?.map((item: any) => (
                    <div key={item.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-6 hover:border-emerald-200 transition-all">
                       <div className="flex-1">
                          <p className="font-black text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.quantity} {item.unit}</p>
                       </div>
                       <div className="w-40 relative">
                          <input 
                            required 
                            type="number" 
                            step="0.01" 
                            value={quoteItemPrices[item.id] || ''} 
                            onChange={(e) => setQuoteItemPrices({ ...quoteItemPrices, [item.id]: Number(e.target.value) })} 
                            placeholder="0.00" 
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-center font-black focus:ring-2 focus:ring-emerald-500 outline-none" 
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 font-bold">ر.س</span>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase">الإجمالي النهائي</p>
                    <p className="text-2xl font-black text-emerald-600">
                      {(showEditPOModal ? selectedPO?.items : selectedRequest?.items)?.reduce((sum: number, it: any) => sum + ((quoteItemPrices[it.id] || 0) * it.quantity), 0).toLocaleString()} ر.س
                    </p>
                  </div>
                  <button type="submit" className={`px-12 py-4 text-white rounded-3xl font-black text-lg transition-all shadow-2xl flex items-center gap-3 ${showEditPOModal ? 'bg-emerald-600 hover:bg-emerald-700' : (showDirectPOModal ? 'bg-slate-900 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700')}`}>
                    {showEditPOModal ? <><Save size={20}/> حفظ التغييرات</> : (showDirectPOModal ? 'إصدار أمر الشراء' : 'إدراج في المقارنة')}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementView;
