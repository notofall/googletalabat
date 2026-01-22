
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Search, Filter, FileText, Download, Tag, SearchCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import { User, RequestStatus, Item, UserRole, MaterialRequest } from '../types';
import { REQUEST_STATUS_LABELS } from '../constants';
import { dbService } from '../services/databaseService';

const MaterialRequestView: React.FC<{ user: User }> = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [requestItems, setRequestItems] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const allPrj = await dbService.getProjects();
      setMyProjects(allPrj);
      if (allPrj.length > 0) setSelectedProjectId(allPrj[0].id);
      setRequests(await dbService.getAllMaterialRequests());
      setCatalogItems(await dbService.getCatalogItems());
    };
    fetchData();
  }, [showForm]);

  const handleCreateRequest = async () => {
    if (requestItems.length === 0) return;
    try {
      await dbService.createMaterialRequest({
        projectId: selectedProjectId,
        items: requestItems.map(item => ({
          itemId: item.itemId,
          quantity: Number(item.quantity)
        })),
        notes: "Generated via Web Client"
      });
      setShowForm(false);
      setRequestItems([]);
    } catch (e) {
      alert("Failed to create request");
    }
  };

  const addItem = (item: Item) => {
    if (requestItems.find(i => i.itemId === item.id)) return;
    setRequestItems([...requestItems, { itemId: item.id, name: item.name, unit: item.unit, quantity: 1 }]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">طلبات المواد (PR)</h2>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> طلب جديد
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-slate-50 border-b">
             <tr>
               <th className="px-6 py-4">رقم الطلب</th>
               <th className="px-6 py-4">المشروع</th>
               <th className="px-6 py-4">الحالة</th>
               <th className="px-6 py-4">تاريخ الإنشاء</th>
             </tr>
          </thead>
          <tbody>
             {requests.map(req => (
               <tr key={req.id} className="border-b last:border-0 hover:bg-slate-50">
                 <td className="px-6 py-4 font-black text-emerald-600">{req.id.slice(0,8)}...</td>
                 <td className="px-6 py-4">{req.projectName || req.projectId}</td>
                 <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 rounded text-xs font-bold">{REQUEST_STATUS_LABELS[req.status]}</span>
                 </td>
                 <td className="px-6 py-4 text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-3xl w-full max-w-2xl p-6 space-y-6 animate-scaleUp max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-black">إنشاء طلب جديد</h3>
              <select className="w-full p-3 border rounded-xl" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
                 {myProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              
              <div className="space-y-2">
                 <h4 className="font-bold">إضافة أصناف</h4>
                 <div className="flex gap-2">
                    {catalogItems.slice(0,5).map(item => (
                       <button key={item.id} onClick={() => addItem(item)} className="p-2 border rounded-lg hover:bg-emerald-50 text-xs font-bold">{item.name}</button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                 {requestItems.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                       <span className="font-bold">{it.name}</span>
                       <input type="number" value={it.quantity} onChange={e => setRequestItems(requestItems.map((r,i) => i===idx ? {...r, quantity: Number(e.target.value)} : r))} className="w-20 p-1 border rounded text-center" />
                       <button onClick={() => setRequestItems(requestItems.filter((_,i) => i!==idx))} className="text-red-500"><Trash2 size={18} /></button>
                    </div>
                 ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                 <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl font-bold text-slate-500">إلغاء</button>
                 <button onClick={handleCreateRequest} className="px-6 py-2 rounded-xl font-bold bg-emerald-600 text-white">إرسال الطلب</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
export default MaterialRequestView;
