
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  ShoppingBag,
  Zap,
  Calendar
} from 'lucide-react';
import { User } from '../types';
import { getProcurementInsight } from '../services/geminiService';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [insight, setInsight] = useState<string>('جاري تحليل البيانات...');
  
  const stats = [
    { label: 'طلبات معلقة', value: '12', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'أوامر شراء نشطة', value: '8', icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'تجاوز ميزانية', value: '3', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'توفير التكاليف', value: '14.5%', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const data = [
    { name: 'يناير', requests: 40, po: 24 },
    { name: 'فبراير', requests: 30, po: 13 },
    { name: 'مارس', requests: 20, po: 98 },
    { name: 'أبريل', requests: 27, po: 39 },
    { name: 'مايو', requests: 18, po: 48 },
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
    <div className="space-y-6 animate-fadeIn pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">مرحباً، {user.name}</h2>
          <p className="text-slate-500 text-sm font-medium">إليك لمحة عامة عن نظام المشتريات اليوم.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-slate-500">
          <Calendar size={18} />
          <span className="text-sm font-bold">20 مايو 2024</span>
        </div>
      </div>

      {/* AI Insight Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden group border border-slate-700">
        <Zap className="absolute -right-8 -top-8 text-emerald-500/10 w-48 h-48 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
          <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20 shrink-0">
            <Zap className="text-white fill-white" size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black mb-2 flex items-center gap-2">
              تحليل الذكاء الاصطناعي (Gemini)
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase font-black">AI Active</span>
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base font-medium">
              {insight}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Responsive Column Count */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start text-center md:text-right gap-3 md:gap-4 hover:shadow-md transition-shadow">
            <div className={`${stat.bg} p-3 md:p-4 rounded-xl shrink-0`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-slate-400 font-black uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg md:text-2xl font-black text-slate-800 leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6">تحليل الطلبات مقابل أوامر الشراء</h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="requests" name="الطلبات" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="po" name="أوامر الشراء" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6">توزيع ميزانية المشاريع</h3>
          <div className="h-[200px] md:h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'مشروع البرج', value: 400 },
                    { name: 'مشروع المجمع', value: 300 },
                    { name: 'مشروع فيلا', value: 200 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[1, 2, 3].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
             {[
               { name: 'مشروع البرج', val: '45%', col: 'bg-emerald-500' },
               { name: 'مشروع المجمع', val: '35%', col: 'bg-amber-500' },
               { name: 'مشروع فيلا', val: '20%', col: 'bg-red-500' },
             ].map((item, i) => (
               <div key={i} className="flex justify-between items-center text-sm font-bold p-2 bg-slate-50 rounded-xl">
                 <span className="flex items-center"><span className={`w-3 h-3 ${item.col} rounded-full ml-2 shadow-sm`}></span>{item.name}</span>
                 <span className="text-slate-700">{item.val}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
