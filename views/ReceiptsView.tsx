
import React, { useState } from 'react';
import { PackageOpen, Camera, QrCode, ClipboardCheck, History, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

const ReceiptsView: React.FC<{ user: User }> = ({ user }) => {
  const [poNumber, setPoNumber] = useState('');
  const [receiptSuccess, setReceiptSuccess] = useState(false);
  
  // محاكاة بنود جدول الكميات للمشروع المرتبط بـ PO
  const [receiptItems, setReceiptItems] = useState([
    { id: 'it-1', name: 'أسمنت بورتلاندي', unit: 'كيس', scheduledTotal: 1000, alreadyReceived: 450, poExpected: 100, currentInput: 0 },
    { id: 'it-2', name: 'حديد تسليح 12مم', unit: 'طن', scheduledTotal: 10, alreadyReceived: 8, poExpected: 1, currentInput: 0 },
  ]);

  const handleConfirmReceipt = () => {
    if (!poNumber) {
      alert("يرجى إدخال رقم أمر الشراء أولاً");
      return;
    }
    
    // محاكاة عملية الخصم من الـ BOQ
    const updated = receiptItems.map(item => ({
      ...item,
      alreadyReceived: item.alreadyReceived + (Number(item.currentInput) || 0)
    }));
    
    setReceiptItems(updated);
    setReceiptSuccess(true);
    setTimeout(() => setReceiptSuccess(false), 5000);
    alert("تم تأكيد الاستلام وتحديث جدول كميات المشروع بنجاح.");
  };

  const handleInputChange = (id: string, val: string) => {
    setReceiptItems(receiptItems.map(it => it.id === id ? { ...it, currentInput: Number(val) } : it));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">استلام المواد</h2>
          <p className="text-slate-500">تسجيل دخول المواد للموقع وتحديث كميات المشروع المجدولة (BOQ).</p>
        </div>
        <button className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 transition-all shadow-md">
          <History size={20} />
          <span className="hidden sm:inline">سجل الاستلامات</span>
        </button>
      </div>

      {receiptSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 animate-bounce">
          <CheckCircle2 size={24} />
          <p className="font-black">تمت العملية بنجاح! تم تحديث رصيد المخزن وجدول الكميات للمشروع.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ClipboardCheck className="text-emerald-600" />
            نموذج استلام مستندي
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">رقم أمر الشراء (PO)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="أدخل رقم PO (مثلاً: PO-2024-001)" 
                  className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all"
                />
                <button className="bg-emerald-100 text-emerald-700 p-3.5 rounded-2xl hover:bg-emerald-200 transition-colors">
                  <QrCode size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center space-y-3 py-8 cursor-pointer hover:bg-slate-100 transition-all group">
               <Camera size={40} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
               <p className="text-sm font-bold text-slate-500">إرفاق صورة سند الاستلام / البضاعة</p>
               <input type="file" className="hidden" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="font-black text-slate-800 text-sm">الأصناف الموردة في هذا الأمر</h4>
                <div className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-black uppercase">
                  <Info size={12} /> تفعيل التتبع التلقائي للـ BOQ
                </div>
              </div>
              
              <div className="space-y-3">
                {receiptItems.map((item) => (
                  <div key={item.id} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 hover:border-emerald-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">الكمية المتوقعة في PO: {item.poExpected} {item.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={item.currentInput || ''}
                          onChange={(e) => handleInputChange(item.id, e.target.value)}
                          placeholder="0" 
                          className="w-24 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-black focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <span className="text-xs text-slate-400 font-bold">{item.unit}</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-50">
                       <div className="flex justify-between items-center text-[10px] mb-2 font-black uppercase tracking-tight">
                          <span className="text-slate-400">حالة استهلاك الكمية المجدولة للمشروع:</span>
                          <span className="text-emerald-600">{item.alreadyReceived + (Number(item.currentInput) || 0)} / {item.scheduledTotal} {item.unit}</span>
                       </div>
                       <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full transition-all duration-700 ${((item.alreadyReceived + (Number(item.currentInput) || 0)) / item.scheduledTotal) > 0.9 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(100, ((item.alreadyReceived + (Number(item.currentInput) || 0)) / item.scheduledTotal) * 100)}%` }}
                          ></div>
                       </div>
                       {(item.alreadyReceived + (Number(item.currentInput) || 0)) >= item.scheduledTotal && (
                         <div className="mt-3 flex items-center gap-1 text-[10px] text-red-600 font-black bg-red-50 p-2 rounded-lg border border-red-100">
                            <AlertTriangle size={14} /> تنبيه: الكمية المستلمة ستتجاوز المجدول لهذا المشروع!
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleConfirmReceipt}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]"
            >
              تأكيد الاستلام وخصم الكميات
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group border border-slate-800">
            <PackageOpen className="absolute -right-6 -bottom-6 text-white/10 w-48 h-48 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2 flex items-center gap-2">تتبع ميزانية الكميات <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/20">LIVE BOQ</span></h3>
              <p className="text-slate-400 text-sm mb-8 font-bold tracking-tight">المشروع: برج التجارة العالمي - المرحلة الإنشائية</p>
              
              <div className="space-y-6">
                 {receiptItems.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-2 font-black uppercase tracking-widest">
                        <span className="flex items-center gap-2 text-slate-300">{item.name} <span className="text-slate-500 font-medium">({item.alreadyReceived} / {item.scheduledTotal})</span></span>
                        <span className={((item.alreadyReceived / item.scheduledTotal) > 0.8) ? 'text-red-400' : 'text-emerald-400'}>
                          {Math.round((item.alreadyReceived / item.scheduledTotal) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.3)] ${((item.alreadyReceived / item.scheduledTotal) > 0.8) ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${(item.alreadyReceived / item.scheduledTotal) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                 <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mb-1">إجمالي البنود</p>
                    <p className="text-2xl font-black">24</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mb-1">نسبة الإنجاز</p>
                    <p className="text-2xl font-black text-emerald-400">58%</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter mb-1">طلبات قيد التوريد</p>
                    <p className="text-2xl font-black text-amber-400">7</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-slate-800">
              <History className="text-slate-400" size={20} />
              آخر عمليات الخصم من ميزانية الكميات
            </h3>
            <div className="space-y-4">
               {[
                 { id: 'RC-991', desc: 'استلام دفعة أسمنت', qty: '100 كيس', time: 'قبل قليل' },
                 { id: 'RC-989', desc: 'توريد حديد سابك', qty: '2 طن', time: 'أمس' },
                 { id: 'RC-985', desc: 'استلام رمل أحمر', qty: '20 م3', time: 'قبل يومين' },
               ].map((log, i) => (
                 <div key={i} className="flex gap-4 p-4 hover:bg-slate-50 border border-slate-50 rounded-2xl transition-all group cursor-default">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300">
                     <PackageOpen size={24} />
                   </div>
                   <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <p className="font-black text-sm text-slate-800">{log.desc}</p>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{log.time}</span>
                     </div>
                     <p className="text-[11px] text-slate-500 mt-1">تم خصم <span className="font-black text-emerald-600">{log.qty}</span> من جدول كميات المشروع. كود العملية: <span className="font-mono">{log.id}</span></p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptsView;
