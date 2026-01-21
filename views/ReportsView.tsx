
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Download, 
  Printer, 
  Calendar,
  FileBarChart,
  Filter,
  RefreshCcw,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Building2,
  User as UserIcon,
  Truck,
  ChevronDown,
  Tag,
  Search
} from 'lucide-react';
import { UserRole } from '../types';

const ReportsView: React.FC<{ user: any }> = ({ user }) => {
  const [startDate, setStartDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  const mockProjects = [
    { id: '1', name: 'برج التجارة العالمي' },
    { id: '2', name: 'مجمع واحة العلوم' },
    { id: '3', name: 'فيلا حي النخيل' },
  ];

  const data = [
    { name: 'مشروع البرج', budget: 1000000, actual: 850000 },
    { name: 'مشروع المجمع', budget: 1500000, actual: 1200000 },
    { name: 'مشروع الفيلا', budget: 500000, actual: 550000 },
  ];

  const savingsData = [
    { month: 'يناير', value: 12000 },
    { month: 'فبراير', value: 18000 },
    { month: 'مارس', value: 15000 },
    { month: 'أبريل', value: 25000 },
    { month: 'مايو', value: 32000 },
  ];

  // بيانات تفصيلية بالأصناف للتقرير
  const itemLevelReport = [
    { name: 'أسمنت بورتلاندي', category: 'مواد إنشائية', totalQty: 5000, avgPrice: 22.5, minPrice: 21, maxPrice: 24, totalSpent: 112500 },
    { name: 'حديد تسليح 12مم', category: 'مواد إنشائية', totalQty: 250, avgPrice: 2850, minPrice: 2700, maxPrice: 3100, totalSpent: 712500 },
    { name: 'كيابل كهربائية', category: 'كهرباء', totalQty: 1200, avgPrice: 45, minPrice: 40, maxPrice: 55, totalSpent: 54000 },
    { name: 'طلاء جدران داخلي', category: 'تشطيبات', totalQty: 450, avgPrice: 180, minPrice: 165, maxPrice: 210, totalSpent: 81000 },
  ].filter(item => !itemSearch || item.name.includes(itemSearch) || item.category.includes(itemSearch));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">التقارير التحليلية التفصيلية</h2>
          <p className="text-slate-500">تحليل الأداء المالي على مستوى الأصناف والمشاريع والموردين.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="bg-white border border-slate-200 text-emerald-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm">
            <FileSpreadsheet size={18} /> تصدير إحصائيات الأصناف
          </button>
          <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">
            <FileText size={18} /> تقرير المصروفات الشامل
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building2 size={12} /> تصفية بالمشروع
            </label>
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">كافة المشاريع</option>
              {mockProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} /> الفترة من
            </label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} /> الفترة إلى
            </label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" />
          </div>
          <button onClick={handleRefresh} className="bg-slate-900 text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
            {isRefreshing ? <RefreshCcw size={16} className="animate-spin" /> : <Filter size={16} />}
            تطبيق الفلاتر
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-8">
              <div>
                 <h3 className="text-xl font-black text-slate-800">تحليل المصروفات بالأصناف</h3>
                 <p className="text-xs text-slate-400 font-bold mt-1">تتبع إجمالي الكميات الموردة ومتوسط أسعار السوق.</p>
              </div>
              <div className="relative w-64">
                 <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                 <input 
                    type="text" 
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                    placeholder="ابحث عن صنف أو تصنيف..." 
                    className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                 />
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                   <tr>
                      <th className="p-4 px-6">الصنف / التصنيف</th>
                      <th className="p-4">إجمالي الكمية</th>
                      <th className="p-4">متوسط السعر</th>
                      <th className="p-4">أدنى / أعلى سعر</th>
                      <th className="p-4 text-left">إجمالي الإنفاق</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {itemLevelReport.map((item, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4 px-6">
                           <p className="font-black text-slate-800 group-hover:text-emerald-700 transition-colors">{item.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</p>
                        </td>
                        <td className="p-4 font-bold text-slate-600">{item.totalQty.toLocaleString()}</td>
                        <td className="p-4 font-black text-slate-800">{item.avgPrice.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ر.س</span></td>
                        <td className="p-4">
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-black">{item.minPrice}</span>
                              <div className="w-12 h-1 bg-slate-100 rounded-full relative">
                                 <div className="absolute top-0 bottom-0 bg-emerald-500 rounded-full" style={{ left: '20%', right: '20%' }}></div>
                              </div>
                              <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-black">{item.maxPrice}</span>
                           </div>
                        </td>
                        <td className="p-4 text-left font-black text-slate-800">
                           {item.totalSpent.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">ر.س</span>
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                 <h3 className="text-lg font-black mb-6">أعلى 3 أصناف استهلاكاً للميزانية</h3>
                 <div className="space-y-6">
                    {itemLevelReport.slice(0, 3).map((item, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                             <span className="text-slate-400">{item.name}</span>
                             <span className="text-emerald-400">{Math.round((item.totalSpent / 960000) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                                style={{ width: `${(item.totalSpent / 960000) * 100}%` }}
                             ></div>
                          </div>
                       </div>
                    ))}
                 </div>
                 <button className="w-full mt-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black hover:bg-white/10 transition-all">مشاهدة التحليل الكامل للأصناف</button>
              </div>
           </div>

           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
                 <TrendingUp className="text-emerald-500" size={18} />
                 مؤشر تذبذب أسعار التوريد (شهري)
              </h3>
              <div className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={savingsData}>
                       <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="month" hide />
                       <YAxis hide />
                       <Tooltip />
                       <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fill="url(#colorVal)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-4 text-center">يوضح هذا الرسم البياني مدى استقرار أسعار البنود الرئيسية الموردة خلال الـ 5 أشهر الماضية.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
