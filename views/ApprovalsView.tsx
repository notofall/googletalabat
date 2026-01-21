
import React, { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, Eye, ShieldCheck, AlertTriangle, FileText, UserCheck } from 'lucide-react';
import { User, RequestStatus, UserRole } from '../types';
import { REQUEST_STATUS_LABELS, DEFAULT_PROCUREMENT_LIMIT } from '../constants';

const ApprovalsView: React.FC<{ user: User }> = ({ user }) => {
  const [pendingApprovals, setPendingApprovals] = useState([
    { 
      id: 'MR-1001', 
      requester: 'أحمد علي', 
      project: 'برج التجارة العالمي', 
      date: '2024-05-18', 
      type: 'TECHNICAL', // تعميد فني
      totalEstimated: 45000,
      items: 5
    },
    { 
      id: 'PO-5002', 
      requester: 'ياسر (المشتريات)', 
      project: 'مجمع واحة العلوم', 
      date: '2024-05-20', 
      type: 'PURCHASE_ORDER', // تعميد مالي
      totalEstimated: 125000,
      items: 8
    },
    { 
      id: 'PO-5003', 
      requester: 'ياسر (المشتريات)', 
      project: 'فيلا النخيل', 
      date: '2024-05-21', 
      type: 'PURCHASE_ORDER',
      totalEstimated: 12000,
      items: 2
    }
  ]);

  // منطق تصفية الطلبات حسب الصلاحية
  const visibleApprovals = useMemo(() => {
    return pendingApprovals.filter(item => {
      // المهندس يرى فقط التعميد الفني
      if (user.role === UserRole.ENGINEER) return item.type === 'TECHNICAL';
      
      // المدير العام يرى التعميد المالي (خاصة ما يتجاوز صلاحية المشتريات)
      if (user.role === UserRole.GENERAL_MANAGER) return item.type === 'PURCHASE_ORDER';
      
      // مدير النظام يرى الكل
      if (user.role === UserRole.ADMIN) return true;
      
      return false;
    });
  }, [pendingApprovals, user.role]);

  const handleApprove = (id: string) => {
    alert(`تم تعميد الطلب ${id} بنجاح وتحويله للمرحلة التالية.`);
    setPendingApprovals(pendingApprovals.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">مركز التعميد والموافقات</h2>
          <p className="text-slate-500 font-medium">عرض الطلبات التي تقع ضمن نطاق صلاحياتك بصفتك: <span className="text-emerald-600 font-black">{user.role}</span></p>
        </div>
        <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
          <ShieldCheck className="text-emerald-600" size={24} />
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">سقف الصلاحية المالية</p>
            <p className="text-sm font-black text-slate-800">
              {user.role === UserRole.GENERAL_MANAGER || user.role === UserRole.ADMIN ? 'مفتوح - تعميد نهائي' : `${(user.approvalLimit || DEFAULT_PROCUREMENT_LIMIT).toLocaleString()} ر.س`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {visibleApprovals.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all group">
            <div className="flex flex-col md:flex-row">
              <div className={`w-full md:w-3 ${item.type === 'TECHNICAL' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
              <div className="flex-1 p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${item.type === 'TECHNICAL' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {item.type === 'TECHNICAL' ? 'مراجعة فنية' : 'مراجعة مالية (PO)'}
                      </span>
                      <h3 className="text-xl font-black text-slate-800">{item.id}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                       <FileText size={16} className="text-slate-300" />
                       {item.project}
                    </div>
                  </div>
                  <div className="text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[160px]">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">القيمة الإجمالية</p>
                    <p className="text-2xl font-black text-slate-800">{item.totalEstimated.toLocaleString()} <span className="text-xs text-slate-400 font-medium">ر.س</span></p>
                  </div>
                </div>

                {item.type === 'PURCHASE_ORDER' && item.totalEstimated > (user.approvalLimit || DEFAULT_PROCUREMENT_LIMIT) && user.role !== UserRole.GENERAL_MANAGER && (
                   <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4 text-red-700 animate-pulse">
                      <AlertTriangle size={24} className="shrink-0" />
                      <p className="text-sm font-black leading-relaxed">تنبيه: هذا الطلب يتجاوز سقف صلاحيتك المالي. يمكنك المراجعة فقط، والتعميد الفعلي من اختصاص المدير العام.</p>
                   </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-6 border-t border-slate-50">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1">مقدم الطلب</p>
                      <p className="font-black text-slate-700">{item.requester}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1">تاريخ الإنشاء</p>
                      <p className="font-black text-slate-700">{item.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1">عدد البنود</p>
                      <p className="font-black text-slate-700">{item.items} بنود</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                      <Eye size={18} /> تفاصيل
                    </button>
                    <button className="flex-1 sm:flex-none px-6 py-3 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100">
                      <XCircle size={18} /> رفض
                    </button>
                    <button 
                      onClick={() => handleApprove(item.id)}
                      disabled={item.type === 'PURCHASE_ORDER' && item.totalEstimated > (user.approvalLimit || DEFAULT_PROCUREMENT_LIMIT) && user.role !== UserRole.GENERAL_MANAGER && user.role !== UserRole.ADMIN}
                      className={`flex-1 sm:flex-none px-10 py-3 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        item.type === 'PURCHASE_ORDER' && item.totalEstimated > (user.approvalLimit || DEFAULT_PROCUREMENT_LIMIT) && user.role !== UserRole.GENERAL_MANAGER && user.role !== UserRole.ADMIN 
                        ? 'opacity-30 cursor-not-allowed' : 'hover:bg-emerald-700'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                      تعميد نهائي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {visibleApprovals.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400">
            <div className="bg-slate-100 p-8 rounded-full mb-6 opacity-40">
              <UserCheck size={80} />
            </div>
            <p className="text-xl font-black">سجل التعميد فارغ حالياً</p>
            <p className="font-bold text-slate-400">لا توجد طلبات معلقة تتطلب إجراءً منك بصلاحية {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsView;
