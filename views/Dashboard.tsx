
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  ShoppingBag,
  Zap,
  Calendar,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { User } from '../types';
import { getProcurementInsight } from '../services/geminiService';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [insight, setInsight] = useState<string>('جاري تحليل البيانات...');
  
  const stats = [
    { label: 'طلبات معلقة', value: '12', icon: Clock, color: 'text-amber-400', gradient: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-100' },
    { label: 'أوامر شراء نشطة', value: '8', icon: ShoppingBag, color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-100' },
    { label: 'تجاوز ميزانية', value: '3', icon: AlertCircle, color: 'text-red-400', gradient: 'from-red-500/20 to-red-600/5', border: 'border-red-100' },
    { label: 'توفير التكاليف', value: '14.5%', icon: TrendingUp, color: 'text-blue-400', gradient: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-100' },
  ];

  const data = [
    { name: 'يناير', requests: 40, po: 24, amt: 2400 },
    { name: 'فبراير', requests: 30, po: 13, amt: 2210 },
    { name: 'مارس', requests: 20, po: 98, amt: 2290 },
    { name: 'أبريل', requests: 27, po: 39, amt: 2000 },
    { name: 'مايو', requests: 18, po: 48, amt: 2181 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  useEffect(() => {
    const fetchInsight = async () => {
      const res = await getProcurementInsight({
        currentStats: stats,
        monthData: data
      });
      setInsight(res || 'لا تتوفر رؤى حالياً.');
    };
    fetchInsight();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-1">مرحباً، {user.name} 👋</h2>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded font-black">v2.0</span>
            <p className="text-slate-500 text-sm font-medium">لوحة المعلومات المركزية للمشتريات</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600">
          <Calendar size={18} className="text-emerald-600" />
          <span className="text-sm font-black">20 مايو 2024</span>
        </div>
      </div>

      {/* AI Insight Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                <Zap className="text-emerald-400" size={32} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-black text-white">تحليل Gemini الذكي</h3>
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium text-sm md:text-base max-w-4xl">
                    {insight}
                </p>
            </div>
            <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-sm hover:bg-emerald-50 transition-colors">
                عرض التقرير الكامل <ArrowUpRight size={16} />
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-[28px] shadow-sm border ${stat.border} hover:shadow-lg transition-all group relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient.replace('/20', '').replace('/5', '')}`}></div>
            <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient}`}>
                 <stat.icon className={stat.color.replace('400', '600')} size={24} />
               </div>
               <span className="flex items-center gap-1 text-[10px] font-black bg-slate-50 px-2 py-1 rounded text-slate-400">+2.5%</span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 mb-1 group-hover:translate-x-1 transition-transform">{stat.value}</p>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
             <div>
                <h3 className="text-xl font-black text-slate-800">نشاط المشتريات</h3>
                <p className="text-sm text-slate-400 font-medium">مقارنة الطلبات بأوامر الشراء الفعلية</p>
             </div>
             <div className="flex gap-2">
                 <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Activity size={20}/></button>
             </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="requests" name="الطلبات" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
                <Area type="monotone" dataKey="po" name="أوامر الشراء" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPo)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-xl font-black text-slate-800 mb-2">الميزانية</h3>
          <p className="text-sm text-slate-400 font-medium mb-6">توزيع المصروفات حسب المشروع</p>
          
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'مشروع البرج', value: 400 },
                    { name: 'مشروع المجمع', value: 300 },
                    { name: 'مشروع فيلا', value: 200 },
                  ]}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  cornerRadius={8}
                >
                  {[1, 2, 3].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800">90%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">إجمالي الصرف</span>
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
             {[
               { name: 'مشروع البرج', val: '45%', col: 'bg-emerald-500' },
               { name: 'مشروع المجمع', val: '35%', col: 'bg-amber-500' },
               { name: 'مشروع فيلا', val: '20%', col: 'bg-red-500' },
             ].map((item, i) => (
               <div key={i} className="flex justify-between items-center text-xs font-bold p-3 bg-slate-50/50 rounded-2xl border border-slate-50">
                 <span className="flex items-center"><span className={`w-2.5 h-2.5 ${item.col} rounded-full ml-3 shadow-sm`}></span>{item.name}</span>
                 <span className="text-slate-700 font-black bg-white px-2 py-1 rounded-lg shadow-sm">{item.val}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
