
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, Users, Tags, Package, Plus, Search,
  ArrowRight, ShieldCheck, UserCheck, ToggleLeft, ToggleRight,
  UserPlus, Lock, Trash2, Save, X, User as UserIcon
} from 'lucide-react';
import { Item, UserRole, Project, Supplier, User } from '../types';
import { dbService } from '../services/databaseService';
import { ROLE_NAMES } from '../constants';

const MasterDataView: React.FC<{ user: User }> = ({ user }) => {
  const [currentSection, setCurrentSection] = useState<'projects' | 'suppliers' | 'catalog' | 'budget' | 'permissions'>('projects');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // Data States
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogItems, setCatalogItems] = useState<Item[]>([]);

  // Modals State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form States
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.ENGINEER, canEditPOPrices: false, approvalLimit: 0 });
  const [newItem, setNewItem] = useState<Partial<Item>>({ name: '', sku: '', unit: '', basePrice: 0 });
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({ name: '', email: '', contact: '' });
  const [newProject, setNewProject] = useState<Partial<Project>>({ name: '', code: '', ownerName: '', budget: 0 });

  const fetchData = async () => {
    if (currentSection === 'permissions') setSystemUsers(await dbService.getAllUsers());
    if (currentSection === 'projects') setProjects(await dbService.getProjects());
    if (currentSection === 'suppliers') setSuppliers(await dbService.getSuppliers());
    if (currentSection === 'catalog') setCatalogItems(await dbService.getCatalogItems());
  };

  useEffect(() => {
    fetchData();
  }, [currentSection, showAddUserModal, showAddModal]);

  const canManageData = user.role === UserRole.ADMIN || user.role === UserRole.QUANTITY_SURVEYOR || user.role === UserRole.GENERAL_MANAGER;

  if (!canManageData) {
    return <div className="p-10 text-center text-red-500 font-bold">دخول غير مصرح به</div>;
  }

  const sections = [
    { id: 'projects', label: 'المشاريع', icon: Building2 },
    { id: 'suppliers', label: 'الموردين', icon: Users },
    { id: 'catalog', label: 'الكتالوج', icon: Package },
    { id: 'budget', label: 'الميزانية', icon: Tags },
    ...(user.role === UserRole.ADMIN || user.role === UserRole.GENERAL_MANAGER ? [{ id: 'permissions', label: 'المستخدمين والصلاحيات', icon: ShieldCheck }] : []),
  ];

  // Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.createUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        canEditPOPrices: newUser.canEditPOPrices,
        approvalLimit: Number(newUser.approvalLimit)
      });
      alert('تم إنشاء المستخدم بنجاح');
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: UserRole.ENGINEER, canEditPOPrices: false, approvalLimit: 0 });
    } catch (error: any) { alert(error.message); }
  };

  const handleAddItem = async () => {
    if (currentSection === 'catalog') {
        await dbService.createCatalogItem({ ...newItem, id: Date.now().toString(), categoryId: '1', aliases: [] } as Item);
    } else if (currentSection === 'suppliers') {
        await dbService.createSupplier({ ...newSupplier, id: Date.now().toString(), rating: 5 } as Supplier);
    } else if (currentSection === 'projects') {
        await dbService.createProject({ ...newProject, id: Date.now().toString(), spent: 0, status: 'ACTIVE', assignedUserIds: [] } as Project);
    }
    setShowAddModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if(!confirm('هل أنت متأكد من الحذف؟')) return;
    if (currentSection === 'catalog') await dbService.deleteCatalogItem(id);
    if (currentSection === 'suppliers') await dbService.deleteSupplier(id);
    if (currentSection === 'projects') await dbService.deleteProject(id);
    fetchData();
  };

  const filteredItems = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (currentSection === 'projects') return projects.filter(p => !q || p.name.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q));
    if (currentSection === 'suppliers') return suppliers.filter(s => !q || s.name.toLowerCase().includes(q));
    if (currentSection === 'catalog') return catalogItems.filter(i => !q || i.name.toLowerCase().includes(q));
    if (currentSection === 'permissions') return systemUsers.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    return [];
  }, [currentSection, globalSearchQuery, projects, suppliers, catalogItems, systemUsers]);

  if (selectedProject) {
    return (
      <div className="space-y-6 animate-fadeIn pb-10">
        <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold"><ArrowRight size={20} /> العودة للمشاريع</button>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-800">{selectedProject.name}</h2>
          <p className="text-slate-500 font-bold mb-4">المالك: {selectedProject.ownerName}</p>
          <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 font-bold">
             هذه الواجهة مخصصة لربط بنود الكتالوج بالمشروع وتحديد الكميات التقديرية.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">إدارة البيانات والتحكم</h2>
          <p className="text-slate-500 font-medium">التحكم المركزي في البيانات الأساسية وصلاحيات المستخدمين.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => { setCurrentSection(section.id as any); setGlobalSearchQuery(''); }}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black whitespace-nowrap transition-all border-2 ${
              currentSection === section.id 
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100' 
              : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30'
            }`}
          >
            <section.icon size={20} />
            {section.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder={`البحث في ${sections.find(s => s.id === currentSection)?.label}...`} 
              className="w-full pr-10 pl-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm"
            />
          </div>
          {currentSection === 'permissions' ? (
             <button onClick={() => setShowAddUserModal(true)} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"><UserPlus size={20} /> إضافة مستخدم</button>
          ) : currentSection !== 'budget' && (
             <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"><Plus size={20} /> إضافة جديد</button>
          )}
        </div>

        <div className="p-6">
          {/* Permissions Table */}
          {currentSection === 'permissions' && (
               <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b">
                       <tr>
                          <th className="p-4">المستخدم</th>
                          <th className="p-4">الدور الوظيفي</th>
                          <th className="p-4">تعديل الأسعار</th>
                          <th className="p-4 text-center">الإجراء</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filteredItems.map((u: any) => (
                         <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4"><p className="font-black text-slate-800">{u.name}</p></td>
                            <td className="p-4"><span className="text-xs font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-600">{ROLE_NAMES[u.role] || u.role}</span></td>
                            <td className="p-4">{u.canEditPOPrices ? <UserCheck className="text-emerald-600" size={18}/> : <Lock className="text-slate-300" size={18}/>}</td>
                            <td className="p-4 text-center">
                               <button onClick={async () => { await dbService.updateUserPermissions(u.id, { canEditPOPrices: !u.canEditPOPrices }); fetchData(); }} className="text-slate-400 hover:text-emerald-600"><ToggleLeft size={24}/></button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
          )}

          {/* Suppliers Table */}
          {currentSection === 'suppliers' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((s: any) => (
                   <div key={s.id} className="p-6 border border-slate-200 rounded-2xl hover:border-emerald-400 transition-all group relative">
                      <button onClick={() => handleDelete(s.id)} className="absolute top-4 left-4 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                      <h4 className="font-black text-slate-800 text-lg mb-1">{s.name}</h4>
                      <p className="text-sm text-slate-500 font-bold">{s.contact}</p>
                      <p className="text-xs text-slate-400 mt-2">{s.email}</p>
                   </div>
                ))}
             </div>
          )}

          {/* Catalog Table */}
          {currentSection === 'catalog' && (
             <div className="overflow-x-auto">
               <table className="w-full text-right">
                 <thead className="bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b">
                   <tr>
                     <th className="p-4">اسم الصنف</th>
                     <th className="p-4">الوحدة</th>
                     <th className="p-4">السعر الأساسي</th>
                     <th className="p-4"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredItems.map((i: any) => (
                     <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                       <td className="p-4 font-black text-slate-800">{i.name} <span className="text-[10px] text-slate-400 block">{i.sku}</span></td>
                       <td className="p-4 text-sm font-bold">{i.unit}</td>
                       <td className="p-4 text-sm font-bold">{i.basePrice} ر.س</td>
                       <td className="p-4 text-left"><button onClick={() => handleDelete(i.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}

          {/* Projects List */}
          {currentSection === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((prj: any) => (
                <div key={prj.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-2xl transition-all group relative">
                   <button onClick={() => handleDelete(prj.id)} className="absolute top-6 left-6 text-slate-300 hover:text-red-500 z-10"><Trash2 size={18}/></button>
                   <h4 className="text-xl font-black text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">{prj.name}</h4>
                   <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-6">
                      <UserIcon size={14} />
                      <span>المالك: {prj.ownerName}</span>
                   </div>
                   <button onClick={() => setSelectedProject(prj)} className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-sm hover:bg-emerald-600 hover:text-white transition-all">تخصيص جدول الكميات</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scaleUp">
               <h3 className="text-xl font-black text-slate-800 mb-4">إضافة {currentSection === 'catalog' ? 'صنف' : (currentSection === 'suppliers' ? 'مورد' : 'مشروع')} جديد</h3>
               <div className="space-y-4">
                  {currentSection === 'catalog' && (
                     <>
                        <input className="w-full p-3 border rounded-xl" placeholder="اسم الصنف" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                        <input className="w-full p-3 border rounded-xl" placeholder="SKU" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} />
                        <input className="w-full p-3 border rounded-xl" placeholder="الوحدة (كجم، متر...)" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} />
                        <input type="number" className="w-full p-3 border rounded-xl" placeholder="السعر التقديري" value={newItem.basePrice} onChange={e => setNewItem({...newItem, basePrice: Number(e.target.value)})} />
                     </>
                  )}
                  {currentSection === 'suppliers' && (
                     <>
                        <input className="w-full p-3 border rounded-xl" placeholder="اسم المورد" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
                        <input className="w-full p-3 border rounded-xl" placeholder="الشخص المسؤول" value={newSupplier.contact} onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})} />
                        <input className="w-full p-3 border rounded-xl" placeholder="البريد الإلكتروني" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} />
                     </>
                  )}
                  {currentSection === 'projects' && (
                     <>
                        <input className="w-full p-3 border rounded-xl" placeholder="اسم المشروع" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
                        <input className="w-full p-3 border rounded-xl" placeholder="كود المشروع" value={newProject.code} onChange={e => setNewProject({...newProject, code: e.target.value})} />
                        <input className="w-full p-3 border rounded-xl" placeholder="اسم مالك المشروع" value={newProject.ownerName} onChange={e => setNewProject({...newProject, ownerName: e.target.value})} />
                        <input type="number" className="w-full p-3 border rounded-xl" placeholder="الميزانية المرصودة" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})} />
                     </>
                  )}
                  <button onClick={handleAddItem} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700">حفظ البيانات</button>
                  <button onClick={() => setShowAddModal(false)} className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">إلغاء</button>
               </div>
            </div>
         </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-scaleUp overflow-hidden">
              <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-800">إضافة مستخدم جديد</h3>
                 <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>
              <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-500">الاسم الكامل</label>
                    <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full p-3 border rounded-xl font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-500">البريد الإلكتروني</label>
                    <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full p-3 border rounded-xl font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-500">الدور الوظيفي</label>
                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full p-3 border rounded-xl font-bold">
                       {Object.entries(ROLE_NAMES).map(([role, label]) => (
                         <option key={role} value={role}>{label}</option>
                       ))}
                    </select>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                       <label className="text-sm font-black text-slate-500">سقف الصلاحية المالية</label>
                       <input type="number" value={newUser.approvalLimit} onChange={e => setNewUser({...newUser, approvalLimit: Number(e.target.value)})} className="w-full p-3 border rounded-xl font-bold" />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                       <input type="checkbox" checked={newUser.canEditPOPrices} onChange={e => setNewUser({...newUser, canEditPOPrices: e.target.checked})} className="w-5 h-5 accent-emerald-600" />
                       <span className="text-xs font-black text-slate-700">تعديل أسعار PO</span>
                    </div>
                 </div>
                 <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black mt-4 hover:bg-emerald-700">حفظ المستخدم</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataView;
