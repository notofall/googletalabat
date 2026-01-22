
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Trash2, Search, Filter, FileSpreadsheet, FileText, 
  Download, Tag, SearchCheck, ChevronRight, ChevronLeft, 
  Building2, ChevronDown, CheckCircle2
} from 'lucide-react';
import { User, RequestStatus, Item, UserRole, MaterialRequest } from '../types';
import { REQUEST_STATUS_LABELS } from '../constants';
import { dbService } from '../services/databaseService';

const MaterialRequestView: React.FC<{ user: User }> = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [requestItems, setRequestItems] = useState<any[]>([]);
  const [selectedProjectIdForNewReq, setSelectedProjectIdForNewReq] = useState('');
  
  // Real Data State
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<Item[]>([]);

  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      // 1. Load Projects - getProjects expects no arguments
      const allPrj = await dbService.getProjects();
      const userProjects = allPrj.filter((prj: any) => 
        user.role === UserRole.ADMIN || 
        user.role === UserRole.GENERAL_MANAGER || 
        user.role === UserRole.PROCUREMENT_MANAGER ||
        prj.assignedUserIds.includes(user.id)
      );
      setMyProjects(userProjects);
      if (userProjects.length > 0) setSelectedProjectIdForNewReq(userProjects[0].id);

      // 2. Load Requests & Catalog
      setRequests(await dbService.getAllMaterialRequests());
      setCatalogItems(await dbService.getCatalogItems());
    };
    fetchData();
  }, [showForm, user.id, user.role]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    
    return catalogItems.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.aliases?.some(alias => alias.toLowerCase().includes(term))
    );
  }, [searchTerm, catalogItems]);

  const visibleRequests = useMemo(() => {
    const query = tableSearchQuery.trim().toLowerCase();
    return requests
      .filter(req => myProjects.some(p => p.id === req.projectId))
      .filter(req => selectedProjectFilter === 'all' || req.projectId === selectedProjectFilter)
      .filter(req => !query || req.id.toLowerCase().includes(query) || req.projectName.toLowerCase().includes(query));
  }, [requests, myProjects, tableSearchQuery, selectedProjectFilter]);

  const currentRequests = visibleRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const addItemToRequest = (item: Item) => {
    if (requestItems.find(i => i.itemId === item.id)) return;
    setRequestItems([...requestItems, { itemId: item.id, name: item.name, unit: item.unit, quantity: 1 }]);
    setSearchTerm('');
  };

  const handleCreateRequest = async () => {
    if (requestItems.length === 0) {
      alert("يرجى إضافة أصناف للطلب أولاً");
      return;
    }
    const project = myProjects.find(p => p.id === selectedProjectIdForNewReq);
    const newReq: MaterialRequest = {
      id: `MR-${Date.now().toString().slice(-4)}`,
      projectId: selectedProjectIdForNewReq,
      projectName: project?.name || 'غير معروف',
      requesterId: user.id,
      requesterName: user.name,
      status: RequestStatus.PENDING_TECHNICAL,
      createdAt: new Date().toISOString().split('T')[0],
      items: requestItems.map((item, idx) => ({
        id: `ri-${Date.now()}-${idx}`,
        itemId: item.itemId,
        name: item.name,
        unit: item.unit,
        quantity: Number(item.quantity)
      }))
    };

    await dbService.createMaterialRequest(newReq);
    alert("تم إنشاء الطلب بنجاح وإرساله للتعميد الفني.");
    setShowForm(false);
    setRequestItems([]);
  };

  const handleTechnicalApprove = async (reqId: string) => {
    if(confirm("هل أنت متأكد من اعتماد المواصفات الفنية لهذا الطلب؟ سيظهر بعدها في قسم المشتريات.")) {
      // updateMaterialRequestStatus is defined in dbService
      await dbService.updateMaterialRequestStatus(reqId, RequestStatus.APPROVED_TECHNICAL);
      setRequests(await dbService.getAllMaterialRequests());
    }
  };

  const canApproveTechnical = user.role === UserRole.ENGINEER || user.role === UserRole.ADMIN || user.role === UserRole.GENERAL_MANAGER;

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
            className={`w-full md:w-auto bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-100 ${myProjects.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700 active:scale-95'}`}
          >
            <Plus size={20} />
            <span>طلب جديد</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        {/* Filter Inputs */}
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
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[700px]">
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
                  <td className="px-6 py-4 font-bold text-slate-700">{req.projectName}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-bold">{req.createdAt}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase whitespace-nowrap ${
                      req.status === RequestStatus.APPROVED_TECHNICAL ? 'bg-emerald-100 text-emerald-700' :
                      req.status === RequestStatus.PENDING_TECHNICAL ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {REQUEST_STATUS_LABELS[req.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                    {req.status === RequestStatus.PENDING_TECHNICAL && canApproveTechnical && (
                      <button onClick={() => handleTechnicalApprove(req.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all" title="اعتماد فني">
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-emerald-600"><FileText size={18} /></button>
                  </td>
                </tr>
              ))}
              {currentRequests.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold">لا توجد طلبات مطابقة</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scaleUp">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">إنشاء طلب مواد جديد</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><Plus className="rotate-45" size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">المشروع المستهدف</label>
                <select value={selectedProjectIdForNewReq} onChange={(e) => setSelectedProjectIdForNewReq(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-slate-700">
                  {myProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-slate-800 border-b pb-2">البحث في الكتالوج المعتمد</h4>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ابحث باسم الصنف أو الاسم البديل..." className="w-full pr-10 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm" />
                  {filteredItems.length > 0 && (
                     <div className="absolute top-full right-0 left-0 bg-white border border-slate-200 rounded-2xl mt-2 shadow-2xl z-20 max-h-60 overflow-y-auto">
                        {filteredItems.map(item => (
                          <button key={item.id} onClick={() => addItemToRequest(item)} className="w-full p-4 text-right hover:bg-slate-50 flex justify-between items-center group border-b last:border-0 border-slate-50">
                             <div className="flex-1"><p className="font-black text-slate-800">{item.name}</p><p className="text-[10px] text-slate-400 font-bold">SKU: {item.sku}</p></div>
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
                      <div className="flex-1"><p className="font-black text-slate-800">{it.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{it.unit}</p></div>
                      <div className="w-24"><input type="number" value={it.quantity} onChange={(e) => setRequestItems(requestItems.map((r, i) => i === idx ? { ...r, quantity: Number(e.target.value) } : r))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-black" /></div>
                      <button onClick={() => setRequestItems(requestItems.filter((_, i) => i !== idx))} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                   </div>
                 ))}
                 {requestItems.length === 0 && <div className="py-10 text-center text-slate-400 border-2 border-dashed rounded-3xl font-bold">لا توجد أصناف مضافة بعد</div>}
              </div>
            </div>
            <div className="p-6 border-t bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="w-full sm:w-auto px-6 py-3 font-black text-slate-500 hover:bg-white rounded-2xl transition-all">إلغاء</button>
              <button onClick={handleCreateRequest} className="w-full sm:w-auto px-10 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">إرسال للتعميد الفني</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequestView;