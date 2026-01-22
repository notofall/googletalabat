
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Download, FileBarChart, Filter, RefreshCcw, FileSpreadsheet, FileText, 
  TrendingUp, Building2, User as UserIcon, ShieldCheck, History, Search, SearchCheck, Clock, Star
} from 'lucide-react';
import { UserRole, Project, AuditLog, ReportConfig, SystemSettings } from '../types';
import { dbService } from '../services/databaseService';

const ReportsView: React.FC<{ user: any }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'audit'>('analytics');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setProjects(await dbService.getProjects());
      setLogs(await dbService.getSystemLogs());
      setReportConfig(await dbService.getReportConfig());
      setSettings(await dbService.getSystemSettings());
    };
    fetchData();
  }, [activeTab]);

  const filteredLogs = logs.filter(log => 
    !searchTerm || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">مركز الرقابة والتقارير</h2>
          <p className="text-slate-500 font-medium">{settings?.companyName || 'المؤسسة'} - إدارة الامتثال والتحليل.</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <button onClick={() => setActiveTab('analytics')} className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
             <FileBarChart size={18} /> التحليلات
           </button>
           <button onClick={() => setActiveTab('audit')} className={`px-8 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'audit' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
             <ShieldCheck size={18} /> سجل التدقيق
           </button>
        </div>
      </div>

      {activeTab === 'analytics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
              {reportConfig?.showAuditStamp && (
                <div className="absolute top-4 left-4 opacity-10 rotate-[-15deg] pointer-events-none">
                   <div className="border-4 border-emerald-600 rounded-full p-4 flex flex-col items-center">
                      <ShieldCheck size={48} className="text-emerald-600" />
                      <span className="font-black text-emerald-600 text-[10px] uppercase">Verified Report</span>
                   </div>
                </div>
              )}
              <h3 className="text-xl font-black text-slate-800 mb-8">سلامة الميزانية بالمشاريع ({settings?.currency || 'ر.س'})</h3>
              <div className="space-y-12">
                 {projects.slice(0, 4).map((p) => (
                    <div key={p.id} className="space-y-3">
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="font-black text-slate-800 text-lg">{p.name}</p>
                             {reportConfig?.showBudgetVariance && (
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">المصروف: {p.spent.toLocaleString()} / الميزانية: {p.budget.toLocaleString()}</p>
                             )}
                          </div>
                          <p className={`font-black text-xl ${p.spent > p.budget ? 'text-red-500' : 'text-emerald-600'}`}>
                             {Math.round((p.spent / (p.budget || 1)) * 100)}%
                          </p>
                       </div>
                       <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                             className={`h-full transition-all duration-1000 ${p.spent > p.budget ? 'bg-red-500' : 'bg-emerald-500 shadow-lg shadow-emerald-100'}`} 
                             style={{ width: `${Math.min((p.spent / (p.budget || 1)) * 100, 100)}%` }}
                          ></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl flex flex-col justify-between">
              <div>
                 <h3 className="text-xl font-black mb-1">بيانات الهوية</h3>
                 <p className="text-slate-400 text-xs font-bold mb-8 uppercase tracking-widest">{settings?.taxNumber || 'No VAT'}</p>
                 
                 <div className="space-y-6">
                    {reportConfig?.showSupplierRating && (
                      <div className="p-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl"><Star size={24} /></div>
                            <div>
                               <p className="font-black text-lg">94%</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">متوسط رضا الموردين</p>
                            </div>
                         </div>
                      </div>
                    )}
                    <div className="p-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl"><ShieldCheck size={24} /></div>
                          <div>
                             <p className="font-black text-lg">امتثال 100%</p>
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">حالة المنظومة الحالية</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <button className="w-full mt-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                 <Download size={18} /> تصدير تقرير الإدارة العليا
              </button>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden animate-fadeIn">
           <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                 <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="البحث في سجل التدقيق..." 
                    className="w-full pr-12 pl-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 bg-white transition-all font-bold text-sm"
                 />
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                 <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <tr><th className="p-6">التاريخ</th><th className="p-6">المستخدم</th><th className="p-6">الإجراء</th><th className="p-6">التفاصيل</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredLogs.map((log) => (
                       <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-6 text-xs font-bold text-slate-500">{new Date(log.timestamp).toLocaleDateString('ar-SA')}</td>
                          <td className="p-6 font-black text-slate-800 text-sm">{log.userName}</td>
                          <td className="p-6 font-black text-slate-700 text-sm">{log.action}</td>
                          <td className="p-6 text-slate-500 font-bold text-xs">{log.details}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
