
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Tags, 
  Package, 
  Plus, 
  Search,
  Settings2,
  Table as TableIcon,
  ChevronLeft,
  ArrowRight,
  Layers,
  Filter,
  FileSpreadsheet,
  Upload,
  Download,
  Tag,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  User as UserIcon,
  Phone,
  Mail,
  Archive,
  Lock,
  ShieldCheck,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  UserPlus
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
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  
  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: UserRole.ENGINEER,
    canEditPOPrices: false,
    approvalLimit: 0
  });

  useEffect(() => {
    // Load users from DB service
    const fetchUsers = async () => {
      const users = await dbService.getAllUsers();
      setSystemUsers(users);
    };
    if (currentSection === 'permissions') {
      fetchUsers();
    }
  }, [currentSection, showAddUserModal]);

  const canManageData = user.role === UserRole.ADMIN || user.role === UserRole.QUANTITY_SURVEYOR || user.role === UserRole.GENERAL_MANAGER;

  if (!canManageData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 animate-fadeIn">
        <div className="bg-red-50 p-10 rounded-full text-red-500 mb-4 border border-red-100 shadow-inner"><Lock size={100} /></div>
        <h2 className="text-3xl font-black text-slate-800">دخول غير مصرح به</h2>
        <p className="text-slate-500 font-bold max-w-md text-center leading-relaxed">عذراً، الوصول مقتصر على أصحاب الصلاحية العليا فقط.</p>
      </div>
    );
  }

  const sections = [
    { id: 'projects', label: 'المشاريع', icon: Building2 },
    { id: 'suppliers', label: 'الموردين', icon: Users },
    { id: 'catalog', label: 'الكتالوج', icon: Package },
    { id: 'budget', label: 'الميزانية', icon: Tags },
    ...(user.role === UserRole.ADMIN || user.role === UserRole.GENERAL_MANAGER ? [{ id: 'permissions', label: 'المستخدمين والصلاحيات', icon: ShieldCheck }] : []),
  ];

  const toggleUserPermission = async (userId: string, currentVal: boolean) => {
    await dbService.updateUserPermissions(userId, { canEditPOPrices: !currentVal });
    const updatedUsers = await dbService.getAllUsers();
    setSystemUsers(updatedUsers);
  };

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
    } catch (error: any) {
      alert(error.message);
    }
  };

  const [projects] = useState<Project[]>([
    { id: '1', name: 'برج التجارة العالمي', code: 'PRJ-001', budget: 2500000, spent: 1250000, status: 'نشط', assignedUserIds: ['1', '2', '5', '6'] },
    { id: '2', name: 'مجمع واحة العلوم', code: 'PRJ-002', budget: 1800000, spent: 1650000, status: 'نشط', assignedUserIds: ['3', '4', '5'] }
  ]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: '1', name: 'مصنع الشرق للاسمنت', contact: 'خالد بن محمد', email: 'sales@east-cement.sa', rating: 4.5 },
    { id: '2', name: 'حديد اليمامة', contact: 'صالح الغامدي', email: 'orders@yamama-steel.com', rating: 4.8 }
  ]);

  const [catalogItems, setCatalogItems] = useState<Item[]>([
    { id: '1', name: 'أسمنت بورتلاندي 50كجم', sku: 'CM-001', unit: 'كيس', categoryId: '1', basePrice: 22, aliases: ['أسمنت عادي', 'أسمنت سعودي'] },
    { id: '2', name: 'حديد تسليح 12 مم', sku: 'ST-012', unit: 'طن', categoryId: '2', basePrice: 2800, aliases: ['حديد سابك', 'حديد 12'] }
  ]);

  const filteredItems = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (currentSection === 'projects') return projects.filter(p => !q || p.name.toLowerCase().includes(q));
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
          <p className="text-slate-500 font-bold">إدارة جداول الكميات (BOQ)</p>
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
          ) : (
             <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"><Plus size={20} /> إضافة جديد</button>
          )}
        </div>

        <div className="p-0">
          {currentSection === 'permissions' && (
            <div className="p-6">
               <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-8 flex items-start gap-6">
                  <ShieldCheck className="text-amber-600 shrink-0" size={32} />
                  <div>
                     <h4 className="text-lg font-black text-amber-900 mb-1">إدارة المستخدمين وصلاحيات المشتريات</h4>
                     <p className="text-sm font-bold text-amber-800 leading-relaxed">قم بإضافة المستخدمين وتعيين أدوارهم الوظيفية. تتيح صلاحية "تعديل أسعار PO" للمستخدم تغيير الأسعار في أوامر الشراء بعد إصدارها.</p>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b">
                       <tr>
                          <th className="p-6">المستخدم</th>
                          <th className="p-6">الدور الوظيفي</th>
                          <th className="p-6">حد الصلاحية المالية</th>
                          <th className="p-6">تعديل الأسعار</th>
                          <th className="p-6 text-center">الإجراء</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filteredItems.map((u: any) => (
                         <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-6">
                               <p className="font-black text-slate-800">{u.name}</p>
                               <p className="text-xs text-slate-400 font-bold">{u.email}</p>
                            </td>
                            <td className="p-6">
                               <span className="text-xs font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-600 tracking-tighter">{ROLE_NAMES[u.role] || u.role}</span>
                            </td>
                            <td className="p-6 text-sm font-bold">
                               {u.approvalLimit ? `${u.approvalLimit.toLocaleString()} ر.س` : '-'}
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  {u.canEditPOPrices ? (
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><UserCheck size={12}/> مسموح</span>
                                  ) : (
                                    <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1"><Lock size={12}/> محجوب</span>
                                  )}
                               </div>
                            </td>
                            <td className="p-6 text-center">
                               <button 
                                  onClick={() => toggleUserPermission(u.id, u.canEditPOPrices)}
                                  className={`p-3 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-xs mx-auto ${u.canEditPOPrices ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                               >
                                  {u.canEditPOPrices ? <><ToggleRight size={20}/></> : <><ToggleLeft size={20}/></>}
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}
          
          {/* Modal for adding user */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
               <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-scaleUp overflow-hidden">
                  <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                     <h3 className="text-xl font-black text-slate-800">إضافة مستخدم جديد</h3>
                     <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                  </div>
                  <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500">الاسم الكامل</label>
                        <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full p-3 border rounded-xl font-bold" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500">البريد الإلكتروني</label>
                        <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full p-3 border rounded-xl font-bold" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500">الدور الوظيفي</label>
                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full p-3 border rounded-xl font-bold">
                           {Object.entries(ROLE_NAMES).map(([role, label]) => (
                             <option key={role} value={role}>{label}</option>
                           ))}
                        </select>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                           <label className="text-xs font-black text-slate-500">سقف الصلاحية المالية</label>
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

          {currentSection === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {projects.map((prj, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-2xl transition-all group">
                   <h4 className="text-xl font-black text-slate-800 mb-6 group-hover:text-emerald-700 transition-colors">{prj.name}</h4>
                   <button onClick={() => setSelectedProject(prj)} className="w-full py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-sm hover:bg-emerald-600 hover:text-white transition-all">تخصيص جدول الكميات</button>
                </div>
              ))}
            </div>
          )}
          {/* بقية الأقسام الموردين والكتالوج تتبع نفس نمط الجداول السابق */}
        </div>
      </div>
    </div>
  );
};

export default MasterDataView;
