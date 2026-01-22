
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Clock, AlertCircle, ShoppingBag, Zap, Calendar, Activity, 
  ArrowUpRight, History, User as UserIcon, ShieldCheck
} from 'lucide-react';
import { User, AuditLog } from '../types';
import { getProcurementInsight } from '../services/geminiService';
import { dbService } from '../services/databaseService';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [insight, setInsight] = useState<string>('جاري تحليل البيانات...');
  const [stats, setStats] = useState<any[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
       const allPOs = (await dbService.getAllPOs()) || [];
       const allReqs = (await dbService.getAllMaterialRequests()) || [];
       const allLogs = (await dbService.getSystemLogs()) || [];
       
       setLogs(allLogs.slice(0, 5)); // عرض آخر 5 عمليات فقط

       const pendingApprovals = allPOs.filter(p => p.status === 'PENDING_APPROVAL').length;
       const activePOs = allPOs.filter(p => p.status === 'APPROVED' || p.status === 'SENT_TO_SUPPLIER').length;

       const dynamicStats = [
        { label: 'اعتمادات معلقة', value: pendingApprovals.toString(), icon: Clock, color: 'text-amber-500', gradient: 'from-amber-500/10 to-transparent' },
        { label: 'أوامر شراء نشطة', value: activePOs.toString(), icon: ShoppingBag, color: 'text-emerald-500', gradient: 'from-emerald-500/10 to-transparent' },
        { label: 'إجمالي الطلبات', value: allReqs.length.toString(), icon: Activity, color: 'text-blue-500', gradient: 'from-blue-500/10 to-transparent' },
        { label: 'نسبة التوفير', value: '12.8%', icon: TrendingUp, color: 'text-purple-500', gradient: 'from-purple-500/10 to-transparent' },
      ];
      setStats(dynamicStats);

      const res = await getProcurementInsight({
        currentStats: dynamicStats,
        lastLogs: allLogs.slice(0, 3)
      });
      setInsight(res || 'النظام يعمل بكفاءة حالياً.');
    };
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-1">لوحة القيادة المؤسسية</h2>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Enterprise Access</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-black text-sm">
          <Calendar size={18} className="text-emerald-600" />
          {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* AI Intelligence Block */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="p-4 bg-emerald-500/20 rounded-3xl border border-emerald-500/30">
               <Zap className="text-emerald-400 animate-pulse" size={40} />
            </div>
            <div className="flex-1">
               <h3 className="text-xl font-black mb-3 flex items-center gap-3">تحليل Gemini الذكي للمنظومة <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-bounce">LIVE</span></h3>
               <p className="text-slate-300 leading-relaxed font-medium text-lg max-w-4xl">{insight}</p>
            </div>
        </div>
      </div>

      {/* Corporate KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden hover:shadow-xl transition-all group`}>
            <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-full -mb-10 -mr-10 group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="flex justify-between items-start mb-6">
               <div className={`p-3 rounded-2xl bg-slate-50 ${stat.color}`}>
                  <stat.icon size={28} />
               </div>
            </div>
            <p className="text-4xl font-black text-slate-900 mb-1">{stat.value}</p>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Operational Flow (Placeholder for charts) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-900">سجل النشاطات المؤسسية</h3>
              <button className="text-xs font-black text-emerald-600 hover:underline">مشاهدة الكل</button>
           </div>
           <div className="space-y-6">
              {logs && logs.length > 0 ? logs.map(log => (
                <div key={log.id} className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border-r-4 border-slate-100 hover:border-emerald-500">
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <UserIcon size={20} className="text-slate-400" />
                   </div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                         <p className="font-black text-slate-800 text-sm">{log.userName}</p>
                         <span className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString('ar-SA')}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-500">{log.action}: <span className="text-slate-700">{log.details}</span></p>
                   </div>
                </div>
              )) : <p className="text-center text-slate-400 py-10 font-bold">لا توجد سجلات نشاط حديثة.</p>}
           </div>
        </div>

        {/* System Integrity */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-between">
           <div>
              <h3 className="text-xl font-black mb-2">سلامة الميزانية</h3>
              <p className="text-slate-400 text-xs font-bold mb-8">مراقبة الانحرافات المالية في المشاريع</p>
              
              <div className="space-y-8">
                 {[
                   { label: 'برج التجارة', val: 85, color: 'bg-emerald-500' },
                   { label: 'مجمع واحة العلوم', val: 42, color: 'bg-blue-500' },
                   { label: 'فيلا حي النرجس', val: 98, color: 'bg-red-500' }
                 ].map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-300">
                         <span>{item.label}</span>
                         <span>{item.val}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full ${item.color} shadow-lg shadow-white/5`} style={{ width: `${item.val}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <History size={16} /> استخراج تقرير الانحرافات المالي
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
