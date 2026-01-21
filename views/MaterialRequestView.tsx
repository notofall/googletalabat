
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Tag, 
  SearchCheck, 
  ChevronRight, 
  ChevronLeft,
  Building2,
  ChevronDown
} from 'lucide-react';
import { User, RequestStatus, Item, UserRole } from '../types';
import { REQUEST_STATUS_LABELS } from '../constants';

const MaterialRequestView: React.FC<{ user: User }> = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [requestItems, setRequestItems] = useState<any[]>([]);
  const itemsPerPage = 5;

  // Mock projects with assignments
  const allProjects = [
    { id: '1', name: 'برج التجارة العالمي', assignedUserIds: ['1', '2', '5', '6'] },
    { id: '2', name: 'مجمع واحة العلوم', assignedUserIds: ['3', '4', '5'] },
    { id: '3', name: 'فيلا حي النخيل', assignedUserIds: ['1', '5'] },
  ];

  // Projects linked to current user
  const myProjects = allProjects.filter(prj => 
    user.role === UserRole.ADMIN || 
    user.role === UserRole.GENERAL_MANAGER || 
    user.role === UserRole.PROCUREMENT_MANAGER ||
    prj.assignedUserIds.includes(user.id)
  );
  
  const catalogItems: Item[] = [
    { id: '1', name: 'أسمنت بورتلاندي 50كجم', sku: 'CM-001', unit: 'كيس', categoryId: '1', basePrice: 22, aliases: ['أسمنت عادي', 'أسمنت سعودي', 'أكياس خلط'] },
    { id: '2', name: 'حديد تسليح 12 مم', sku: 'ST-012', unit: 'طن', categoryId: '2', basePrice: 2800, aliases: ['حديد سابك', 'حديد 12', 'حديد تسليح'] },
    { id: '3', name: 'رمل أحمر مغسول', sku: 'SN-002', unit: 'م3', categoryId: '3', basePrice: 45, aliases: ['رمل بناء', 'رمل ناعم'] },
  ];

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    
    return catalogItems.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.aliases.some(alias => alias.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  const [requests] = useState([
    { id: 'MR-1001', project: 'برج التجارة العالمي', projectId: '1', date: '2024-05-18', status: RequestStatus.PENDING_TECHNICAL, totalItems: 5 },
    { id: 'MR-1002', project: 'مجمع واحة العلوم', projectId: '2', date: '2024-05-19', status: RequestStatus.APPROVED_TECHNICAL, totalItems: 3 },
    { id: 'MR-1003', project: 'فيلا حي النخيل', projectId: '3', date: '2024-05-20', status: RequestStatus.DRAFT, totalItems: 12 },
  ]);

  const visibleRequests = useMemo(() => {
    const query = tableSearchQuery.trim().toLowerCase();
    return requests
      .filter(req => myProjects.some(p => p.id === req.projectId))
      .filter(req => selectedProjectFilter === 'all' || req.projectId === selectedProjectFilter)
      .filter(req => !query || req.id.toLowerCase().includes(query) || req.project.toLowerCase().includes(query));
  }, [requests, myProjects, tableSearchQuery, selectedProjectFilter]);

  const currentRequests = visibleRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const addItemToRequest = (item: Item) => {
    if (requestItems.find(i => i.id === item.id)) return;
    setRequestItems([...requestItems, { ...item, quantity: 1 }]);
    setSearchTerm('');
  };

  const handleSendForApproval = () => {
    if (requestItems.length === 0) {
      alert("يرجى إضافة أصناف للطلب أولاً");
      return;
    }
    alert("تم إرسال الطلب للمهندس المسؤول للتعميد الفني.");
    setShowForm(false);
    setRequestItems([]);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? <span key={i} className="bg-emerald-100 text-emerald-900 px-0.5 rounded font-black">{part}</span> : part)}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">طلبات المواد</h2>
          <p className="text-slate-500 font-medium">إدارة وإنشاء طلبات توريد المواد للمشاريع الموكلة إليك.</p>
        </div>
        <div className="flex gap-2">
          <button 
            disabled={myProjects.length === 0}
            onClick={() => { setShowForm(true); setRequestItems([]); }}
            className={`bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-100 ${myProjects.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700 active:scale-95'}`}
          >
            <Plus size={20} />
            <span>طلب جديد</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              placeholder="البحث برقم الطلب أو اسم المشروع..." 
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white transition-all font-bold text-sm"
            />
          </div>
          <div className="relative min-w-[200px]">
              <select 
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="w-full pl-8 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm appearance-none cursor-pointer"
              >
                <option value="all">كافة المشاريع</option>
                {myProjects.map(prj => <option key={prj.id} value={prj.id}>{prj.name}</option>)}
              </select>
              <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">المشروع</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-black text-emerald-600">{req.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{req.project}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-bold">{req.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      req.status === RequestStatus.APPROVED_TECHNICAL ? 'bg-emerald-100 text-emerald-700' :
                      req.status === RequestStatus.PENDING_TECHNICAL ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {REQUEST_STATUS_LABELS[req.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-slate-400 hover:text-emerald-600"><FileText size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scaleUp">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">إنشاء طلب مواد جديد</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">المشروع المستهدف</label>
                <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-slate-700">
                  {myProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-slate-800 border-b pb-2">البحث في الكتالوج المعتمد</h4>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث باسم الصنف أو الاسم البديل (مثلاً: حديد سابك)..."
                    className="w-full pr-10 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
                  />
                  {filteredItems.length > 0 && (
                     <div className="absolute top-full right-0 left-0 bg-white border border-slate-200 rounded-2xl mt-2 shadow-2xl z-20 max-h-60 overflow-y-auto">
                        {filteredItems.map(item => (
                          <button key={item.id} onClick={() => addItemToRequest(item)} className="w-full p-4 text-right hover:bg-slate-50 flex justify-between items-center group border-b last:border-0 border-slate-50">
                             <div className="flex-1">
                                <p className="font-black text-slate-800">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">SKU: {item.sku}</p>
                             </div>
                             <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all"><Plus size={18} /></div>
                          </button>
                        ))}
                     </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                 <h4 className="font-black text-slate-800 text-sm">بنود الطلب الحالية:</h4>
                 {requestItems.map((it, idx) => (
                   <div key={idx} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200 group">
                      <div className="flex-1">
                         <p className="font-black text-slate-800">{it.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">{it.unit}</p>
                      </div>
                      <div className="w-24">
                         <input 
                            type="number" 
                            value={it.quantity} 
                            onChange={(e) => setRequestItems(requestItems.map((r, i) => i === idx ? { ...r, quantity: e.target.value } : r))}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-black" 
                         />
                      </div>
                      <button onClick={() => setRequestItems(requestItems.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                   </div>
                 ))}
                 {requestItems.length === 0 && <div className="py-10 text-center text-slate-400 border-2 border-dashed rounded-3xl font-bold">لا توجد أصناف مضافة بعد</div>}
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-6 py-3 font-black text-slate-500 hover:bg-white rounded-2xl transition-all">إلغاء</button>
              <button onClick={handleSendForApproval} className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">إرسال للتعميد الفني</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequestView;
