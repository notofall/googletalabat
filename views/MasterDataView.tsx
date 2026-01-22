
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, Users, Tags, Package, Plus, Search,
  ShieldCheck, UserCheck, ToggleLeft, ToggleRight,
  UserPlus, Lock, Trash2, Save, X, Settings,
  Database, Palette, Download, Upload, RefreshCcw, LayoutPanelLeft,
  KeyRound, ShieldAlert, FileText, CheckCircle2,
  ServerCog
} from 'lucide-react';
import { Item, UserRole, Project, Supplier, User, SystemSettings, ReportConfig, UserPermissions } from '../types';
import { dbService } from '../services/databaseService';
import { ROLE_NAMES } from '../constants';

const MasterDataView: React.FC<{ user: User }> = ({ user }) => {
  const [currentSection, setCurrentSection] = useState<'projects' | 'suppliers' | 'catalog' | 'permissions' | 'it_admin'>('projects');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  // Data States
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogItems, setCatalogItems] = useState<Item[]>([]);
  
  // IT Admin States
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  // Forms
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: UserRole.ENGINEER });
  const [newProject, setNewProject] = useState({ name: '', code: '', ownerName: '', budget: 0 });
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', email: '' });
  const [newItem, setNewItem] = useState({ name: '', sku: '', unit: '', basePrice: 0 });

  const fetchData = async () => {
    if (currentSection === 'permissions') setSystemUsers(await dbService.getAllUsers());
    if (currentSection === 'projects') setProjects(await dbService.getProjects());
    if (currentSection === 'suppliers') setSuppliers(await dbService.getSuppliers());
    if (currentSection === 'catalog') setCatalogItems(await dbService.getCatalogItems());
    if (currentSection === 'it_admin') {
      setSettings(await dbService.getSystemSettings());
      setReportConfig(await dbService.getReportConfig());
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentSection]);

  const handleUpdateSettings = async () => {
    if (!settings || !reportConfig) return;
    setIsSaving(true);
    try {
      await dbService.updateSystemSettings(settings);
      await dbService.updateReportConfig(reportConfig);
      alert('تم حفظ إعدادات الهوية والتقارير بنجاح');
    } catch (e) { alert('خطأ في الاتصال بالسيرفر'); }
    setIsSaving(false);
  };

  const handleTogglePermission = async (userId: string, permKey: keyof UserPermissions) => {
    const targetUser = systemUsers.find(u => u.id === userId);
    if (!targetUser) return;
    
    const updatedPerms = {
      ...targetUser.permissions,
      [permKey]: !targetUser.permissions[permKey]
    };
    
    try {
      await dbService.updateUserPermissions(userId, updatedPerms);
      setSystemUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions: updatedPerms } : u));
    } catch (e) { alert('فشل في تحديث الصلاحية'); }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.password || newUser.password.length < 6) {
      alert("كلمة المرور يجب أن تكون 6 خانات على الأقل");
      return;
    }

    setIsSaving(true);
    try {
      // Default permissions based on role
      const defaultPermissions: UserPermissions = {
        canCreateRequest: true,
        canApproveTechnical: false,
        canApproveFinancial: false,
        canManageProcurement: false,
        canManageInventory: false,
        canEditSystemSettings: false,
        canViewReports: true,
        canEditPrices: false
      };
      
      if (newUser.role === UserRole.ADMIN) {
         Object.keys(defaultPermissions).forEach(k => (defaultPermissions as any)[k] = true);
      } else if (newUser.role === UserRole.GENERAL_MANAGER) {
         defaultPermissions.canApproveFinancial = true;
         defaultPermissions.canViewReports = true;
      }

      await dbService.createUser({
        ...newUser,
        permissions: defaultPermissions,
        approvalLimit: newUser.role === UserRole.GENERAL_MANAGER ? 1000000 : 0
      });
      
      setSystemUsers(await dbService.getAllUsers());
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: UserRole.ENGINEER });
      alert('تم إضافة المستخدم بنجاح');
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء إضافة المستخدم');
    }
    setIsSaving(false);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await dbService.createProject(newProject);
    setProjects(await dbService.getProjects());
    setShowAddProject(false);
    setNewProject({ name: '', code: '', ownerName: '', budget: 0 });
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
      e.preventDefault();
      await dbService.createSupplier(newSupplier);
      setSuppliers(await dbService.getSuppliers());
      setShowAddSupplier(false);
      setNewSupplier({ name: '', contact: '', email: '' });
  };

  const handleAddItem = async (e: React.FormEvent) => {
      e.preventDefault();
      await dbService.createItem(newItem);
      setCatalogItems(await dbService.getCatalogItems());
      setShowAddItem(false);
      setNewItem({ name: '', sku: '', unit: '', basePrice: 0 });
  };

  const handleBackupExport = async () => {
    try {
      await dbService.exportFullBackup();
    } catch (e) { alert('فشل تصدير النسخة الاحتياطية'); }
  };

  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (confirm('تنبيه: سيتم مسح كافة البيانات الحالية واستبدالها بالنسخة الاحتياطية. هل أنت متأكد؟')) {
        setIsImporting(true);
        try {
          await dbService.importBackup(content);
          alert('تمت استعادة البيانات بنجاح، سيتم إعادة تحميل الصفحة.');
          window.location.reload();
        } catch (err) { alert('الملف غير صالح أو تالف.'); }
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const sections = [
    { id: 'projects', label: 'المشاريع', icon: Building2 },
    { id: 'suppliers', label: 'الموردين', icon: Users },
    { id: 'catalog', label: 'الكتالوج', icon: Package },
    ...(user.role === UserRole.ADMIN || user.role === UserRole.GENERAL_MANAGER ? [
      { id: 'permissions', label: 'مصفوفة الصلاحيات', icon: KeyRound },
      { id: 'it_admin', label: 'إدارة النظام', icon: ServerCog }
    ] : []),
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">إدارة البيانات والتحكم</h2>
          <p className="text-slate-500 font-medium">التحكم المركزي في الهوية، الصلاحيات، والبيانات.</p>
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
              : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200'
            }`}
          >
            {React.createElement(section.icon as any, { size: 20 })}
            {section.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
        {currentSection === 'permissions' ? (
          <div className="animate-fadeIn">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-black text-slate-800 flex items-center gap-2"><KeyRound size={20} className="text-emerald-600"/> مصفوفة صلاحيات المستخدمين (Grid Matrix)</h3>
               <button onClick={() => setShowAddUserModal(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-600 transition-all">
                  <UserPlus size={16} /> مستخدم جديد
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <tr>
                      <th className="p-6">المستخدم / الدور</th>
                      <th className="p-4 text-center">إنشاء طلب</th>
                      <th className="p-4 text-center">تعميد فني</th>
                      <th className="p-4 text-center">تعميد مالي</th>
                      <th className="p-4 text-center">إدارة مشتريات</th>
                      <th className="p-4 text-center">إدارة مخزون</th>
                      <th className="p-4 text-center">تعديل أسعار</th>
                      <th className="p-4 text-center">إدارة نظام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {systemUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 border-l border-slate-50">
                           <div className="flex flex-col">
                              <span className="font-black text-slate-800 text-sm">{u.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{ROLE_NAMES[u.role]}</span>
                           </div>
                        </td>
                        {[
                          'canCreateRequest', 'canApproveTechnical', 'canApproveFinancial', 
                          'canManageProcurement', 'canManageInventory', 'canEditPrices', 'canEditSystemSettings'
                        ].map((perm) => (
                          <td key={perm} className="p-4 text-center">
                             <button 
                                onClick={() => handleTogglePermission(u.id, perm as keyof UserPermissions)}
                                className={`transition-all ${u.permissions[perm as keyof UserPermissions] ? 'text-emerald-600' : 'text-slate-200 hover:text-slate-300'}`}
                             >
                               {u.permissions[perm as keyof UserPermissions] ? <CheckCircle2 size={24} /> : <X size={24} />}
                             </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        ) : currentSection === 'it_admin' ? (
          <div className="p-8 space-y-12 animate-fadeIn">
            {/* Branding Section */}
            <section className="space-y-6">
               <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <Palette className="text-emerald-600" size={24} />
                  <h3 className="text-xl font-black text-slate-800">هوية المؤسسة (White-Labeling)</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم الشركة / المؤسسة</label>
                     <input type="text" value={settings?.companyName || ''} onChange={e => setSettings({...settings!, companyName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-black text-slate-700" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الرقم الضريبي (VAT Number)</label>
                     <input type="text" value={settings?.taxNumber || ''} onChange={e => setSettings({...settings!, taxNumber: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-black text-slate-700" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">العملة الافتراضية</label>
                     <input type="text" value={settings?.currency || ''} onChange={e => setSettings({...settings!, currency: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none font-black text-slate-700" />
                  </div>
               </div>
            </section>

            {/* Reports Customization */}
            <section className="space-y-6">
               <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <LayoutPanelLeft className="text-blue-600" size={24} />
                  <h3 className="text-xl font-black text-slate-800">إدارة محرك التقارير (Report Builder)</h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'showSupplierRating', label: 'إظهار تقييم الموردين' },
                    { key: 'showBudgetVariance', label: 'إظهار انحرافات الميزانية' },
                    { key: 'showAuditStamp', label: 'إدراج ختم التدقيق الإلكتروني' },
                    { key: 'showRequesterIdentity', label: 'إظهار هوية صاحب الطلب' }
                  ].map(cfg => (
                    <button 
                      key={cfg.key}
                      onClick={() => setReportConfig({...reportConfig!, [cfg.key]: !reportConfig![cfg.key as keyof ReportConfig]})}
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${reportConfig?.[cfg.key as keyof ReportConfig] ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-100'}`}
                    >
                      <span className="text-xs font-black text-slate-700">{cfg.label}</span>
                      {reportConfig?.[cfg.key as keyof ReportConfig] ? <ToggleRight className="text-emerald-600" size={28} /> : <ToggleLeft className="text-slate-300" size={28} />}
                    </button>
                  ))}
               </div>
            </section>

            {/* Maintenance & Backup */}
            <section className="space-y-6">
               <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <Database className="text-amber-600" size={24} />
                  <h3 className="text-xl font-black text-slate-800">الصيانة والنسخ الاحتياطي</h3>
               </div>
               <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleBackupExport} className="flex-1 p-10 bg-slate-900 text-white rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-slate-800 transition-all group">
                     <Download size={48} className="group-hover:-translate-y-2 transition-transform" />
                     <div className="text-center">
                        <p className="font-black text-xl">تصدير كامل البيانات</p>
                        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Full Database Backup (JSON)</p>
                     </div>
                  </button>
                  <label className="flex-1 p-10 bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group">
                     <Upload size={48} className="text-slate-300 group-hover:-translate-y-2 transition-transform" />
                     <div className="text-center">
                        <p className="font-black text-xl text-slate-700">استعادة نسخة احتياطية</p>
                        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Import Data File</p>
                     </div>
                     <input type="file" accept=".json" onChange={handleBackupImport} className="hidden" />
                  </label>
               </div>
            </section>

            <div className="flex justify-end pt-8 border-t border-slate-100">
               <button 
                  onClick={handleUpdateSettings} 
                  disabled={isSaving}
                  className="px-12 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-emerald-500/20 flex items-center gap-3 hover:bg-emerald-700 transition-all active:scale-95"
               >
                 {isSaving ? <RefreshCcw size={24} className="animate-spin" /> : <Save size={24} />}
                 حفظ كافة إعدادات النظام
               </button>
            </div>
          </div>
        ) : currentSection === 'projects' ? (
          <div className="animate-fadeIn">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-black text-slate-800">قائمة المشاريع</h3>
               <button onClick={() => setShowAddProject(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-600 transition-all">
                  <Plus size={16} /> مشروع جديد
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <tr><th className="p-6">كود المشروع</th><th className="p-6">اسم المشروع</th><th className="p-6">المالك</th><th className="p-6">الميزانية</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {projects.map(p => (
                       <tr key={p.id}>
                          <td className="p-6 font-bold text-slate-500">{p.code}</td>
                          <td className="p-6 font-black text-slate-800">{p.name}</td>
                          <td className="p-6 text-sm">{p.ownerName}</td>
                          <td className="p-6 text-sm">{p.budget.toLocaleString()}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        ) : currentSection === 'suppliers' ? (
          <div className="animate-fadeIn">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-black text-slate-800">قائمة الموردين</h3>
               <button onClick={() => setShowAddSupplier(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-600 transition-all">
                  <Plus size={16} /> مورد جديد
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <tr><th className="p-6">اسم المورد</th><th className="p-6">مسؤول التواصل</th><th className="p-6">البريد الإلكتروني</th><th className="p-6">التقييم</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {suppliers.map(s => (
                       <tr key={s.id}>
                          <td className="p-6 font-black text-slate-800">{s.name}</td>
                          <td className="p-6 text-sm">{s.contact}</td>
                          <td className="p-6 text-sm">{s.email}</td>
                          <td className="p-6 text-sm">{s.rating || 5.0}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-black text-slate-800">دليل الأصناف (الكتالوج)</h3>
               <button onClick={() => setShowAddItem(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-600 transition-all">
                  <Plus size={16} /> صنف جديد
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                    <tr><th className="p-6">SKU</th><th className="p-6">اسم الصنف</th><th className="p-6">الوحدة</th><th className="p-6">السعر التقديري</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {catalogItems.map(i => (
                       <tr key={i.id}>
                          <td className="p-6 font-bold text-slate-500">{i.sku}</td>
                          <td className="p-6 font-black text-slate-800">{i.name}</td>
                          <td className="p-6 text-sm">{i.unit}</td>
                          <td className="p-6 text-sm">{i.basePrice.toLocaleString()}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">إضافة مستخدم جديد</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">الاسم الكامل</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" placeholder="مثال: محمد أحمد" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">البريد الإلكتروني (اسم المستخدم)</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" placeholder="user@company.com" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">كلمة المرور</label>
                <div className="relative">
                   <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full pr-12 pl-4 py-3 bg-slate-50 border rounded-xl font-bold" placeholder="******" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">الدور الوظيفي</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold">
                  {Object.entries(ROLE_NAMES).map(([role, label]) => (
                    <option key={role} value={role}>{label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black mt-4 hover:bg-emerald-600 transition-colors">
                {isSaving ? 'جاري الحفظ...' : 'إضافة المستخدم'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">إضافة مشروع جديد</h3>
              <button onClick={() => setShowAddProject(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">اسم المشروع</label>
                <input required type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">كود المشروع</label>
                <input required type="text" value={newProject.code} onChange={e => setNewProject({...newProject, code: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">اسم المالك</label>
                <input required type="text" value={newProject.ownerName} onChange={e => setNewProject({...newProject, ownerName: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">الميزانية المرصودة</label>
                <input required type="number" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black mt-4 hover:bg-emerald-600 transition-colors">إضافة المشروع</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">إضافة مورد جديد</h3>
              <button onClick={() => setShowAddSupplier(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">اسم المورد / الشركة</label>
                <input required type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">مسؤول التواصل</label>
                <input required type="text" value={newSupplier.contact} onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">البريد الإلكتروني</label>
                <input required type="email" value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black mt-4 hover:bg-emerald-600 transition-colors">إضافة المورد</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">إضافة صنف جديد للكتالوج</h3>
              <button onClick={() => setShowAddItem(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">اسم الصنف</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">كود الصنف (SKU)</label>
                <input required type="text" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">الوحدة القياسية</label>
                <input required type="text" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" placeholder="مثال: كيس، طن، متر" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">السعر التقديري (للميزانية)</label>
                <input required type="number" value={newItem.basePrice} onChange={e => setNewItem({...newItem, basePrice: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-black mt-4 hover:bg-emerald-600 transition-colors">إضافة الصنف</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataView;
