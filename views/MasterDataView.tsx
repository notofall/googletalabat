
import React, { useState, useRef, useMemo } from 'react';
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
  ToggleRight
} from 'lucide-react';
import { Item, UserRole, Project, Supplier, User } from '../types';

const MasterDataView: React.FC<{ user: User }> = ({ user }) => {
  const [currentSection, setCurrentSection] = useState<'projects' | 'suppliers' | 'catalog' | 'budget' | 'permissions'>('projects');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [deletingCatalogItem, setDeletingCatalogItem] = useState<Item | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // بيانات تجريبية للمستخدمين لإدارة صلاحياتهم
  const [systemUsers, setSystemUsers] = useState<User[]>([
    { id: '1', name: 'أحمد المشرف', email: 'supervisor@itqan.sa', role: UserRole.SUPERVISOR, canEditPOPrices: false },
    { id: '3', name: 'ياسر مدير المشتريات', email: 'pm@itqan.sa', role: UserRole.PROCUREMENT_MANAGER, approvalLimit: 50000, canEditPOPrices: true },
    { id: '6', name: 'م. عمر مهندس كميات', email: 'qs@itqan.sa', role: UserRole.QUANTITY_SURVEYOR, canEditPOPrices: false },
  ]);

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
    ...(user.role === UserRole.ADMIN || user.role === UserRole.GENERAL_MANAGER ? [{ id: 'permissions', label: 'إدارة الصلاحيات', icon: ShieldCheck }] : []),
  ];

  const toggleUserPermission = (userId: string) => {
    setSystemUsers(systemUsers.map(u => 
      u.id === userId ? { ...u, canEditPOPrices: !u.canEditPOPrices } : u
    ));
    alert("تم تحديث صلاحيات المستخدم بنجاح.");
  };

  const [projects] = useState<Project[]>([
    { id: '1', name: 'برج التجارة العالمي', code: 'PRJ-001', budget: 2500000, spent: 1250000, status: 'نشط', levelsCount: 12, assignedUserIds: ['1', '2', '5', '6'], scheduledQuantities: [] },
    { id: '2', name: 'مجمع واحة العلوم', code: 'PRJ-002', budget: 1800000, spent: 1650000, status: 'نشط', levelsCount: 4, assignedUserIds: ['3', '4', '5'], scheduledQuantities: [] }
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
          {currentSection !== 'permissions' && (
             <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"><Plus size={20} /> إضافة جديد</button>
          )}
        </div>

        <div className="p-0">
          {currentSection === 'permissions' && (
            <div className="p-6">
               <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-8 flex items-start gap-6">
                  <ShieldCheck className="text-amber-600 shrink-0" size={32} />
                  <div>
                     <h4 className="text-lg font-black text-amber-900 mb-1">إدارة صلاحيات تعديل المشتريات</h4>
                     <p className="text-sm font-bold text-amber-800 leading-relaxed">تتيح هذه الصلاحية لمدير المشتريات تعديل أسعار الأصناف في أوامر الشراء "بعد" صدورها. يُنصح بتفعيلها فقط في الحالات التي يتم فيها إصدار أوامر شراء تقديرية ثم تفريغ السعر النهائي من الفاتورة المستلمة.</p>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b">
                       <tr>
                          <th className="p-6">المستخدم</th>
                          <th className="p-6">الدور الوظيفي</th>
                          <th className="p-6">صلاحية تعديل أسعار PO</th>
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
                               <span className="text-xs font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-600 tracking-tighter">{u.role}</span>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  {u.canEditPOPrices ? (
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1"><UserCheck size={12}/> مسموح بالتعديل</span>
                                  ) : (
                                    <span className="bg-red-50 text-red-700 text-[10px] font-black px-3 py-1 rounded-full border border-red-100 flex items-center gap-1"><Lock size={12}/> التعديل محجوب</span>
                                  )}
                               </div>
                            </td>
                            <td className="p-6 text-center">
                               <button 
                                  onClick={() => toggleUserPermission(u.id)}
                                  className={`p-3 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-xs mx-auto ${u.canEditPOPrices ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                               >
                                  {u.canEditPOPrices ? <><ToggleRight size={24}/> سحب الصلاحية</> : <><ToggleLeft size={24}/> منح الصلاحية</>}
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
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
