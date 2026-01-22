
import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, AlertTriangle, FileText, UserCheck, XCircle, Eye } from 'lucide-react';
import { User, PurchaseOrder, UserRole } from '../types';
import { dbService } from '../services/databaseService';
import { BusinessRules } from '../services/businessRules';
import { DEFAULT_PROCUREMENT_LIMIT } from '../constants';

const ApprovalsView: React.FC<{ user: User }> = ({ user }) => {
  const [pendingApprovals, setPendingApprovals] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // getPendingPOs is now defined in dbService
      const pos = await dbService.getPendingPOs();
      setPendingApprovals(pos);
    };
    loadData();
  }, []);

  const handleApprove = async (po: PurchaseOrder) => {
    // Apply BL-001 Rule
    const check = BusinessRules.canApprovePO(user, po);
    
    if (!check.allowed) {
      alert(`عذراً، لا يمكنك إتمام العملية.\nالسبب: ${check.reason}`);
      return;
    }

    if (confirm(`هل أنت متأكد من تعميد أمر الشراء بقيمة ${po.totalAmount.toLocaleString()} ر.س؟`)) {
       // approvePO expects 1 argument (poId)
       const success = await dbService.approvePO(po.id);
       if (success) {
         alert("تم التعميد بنجاح!");
         setPendingApprovals(prev => prev.filter(p => p.id !== po.id));
       }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">مركز التعميد</h2>
          <p className="text-slate-500 font-medium">عرض الطلبات الخاضعة لقواعد الصلاحيات (BL-001).</p>
        </div>
        <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
          <ShieldCheck className="text-emerald-600" size={24} />
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">سقف الصلاحية</p>
            <p className="text-sm font-black text-slate-800">
              {user.role === UserRole.GENERAL_MANAGER || user.role === UserRole.ADMIN ? 'غير محدود' : `${(user.approvalLimit || DEFAULT_PROCUREMENT_LIMIT).toLocaleString()} ر.س`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {pendingApprovals.map((po) => {
          // Check permission just for UI indication (Warning Banner)
          const permissionCheck = BusinessRules.canApprovePO(user, po);
          
          return (
            <div key={po.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-3 bg-amber-500"></div>
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase bg-amber-50 text-amber-600 border border-amber-100">
                          بانتظار الموافقة
                        </span>
                        <h3 className="text-xl font-black text-slate-800">{po.id}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 font-bold">
                         <FileText size={16} className="text-slate-300" />
                         {po.projectName} - {po.supplierName}
                      </div>
                    </div>
                    <div className="text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[160px]">
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1">القيمة الإجمالية</p>
                      <p className="text-2xl font-black text-slate-800">{po.totalAmount.toLocaleString()} <span className="text-xs text-slate-400 font-medium">ر.س</span></p>
                    </div>
                  </div>

                  {!permissionCheck.allowed && (
                     <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4 text-red-700 animate-pulse">
                        <AlertTriangle size={24} className="shrink-0" />
                        <p className="text-sm font-black leading-relaxed">{permissionCheck.reason}</p>
                     </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-50 justify-end">
                    <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2">
                      <Eye size={18} /> تفاصيل
                    </button>
                    <button className="px-6 py-3 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100">
                      <XCircle size={18} /> رفض
                    </button>
                    <button 
                      onClick={() => handleApprove(po)}
                      disabled={!permissionCheck.allowed}
                      className={`px-10 py-3 text-white font-black rounded-2xl shadow-xl flex items-center gap-2 transition-all ${
                        !permissionCheck.allowed 
                        ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                      تعميد نهائي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {pendingApprovals.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400">
            <UserCheck size={80} className="mb-4 opacity-20" />
            <p className="text-xl font-black">لا توجد طلبات معلقة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsView;