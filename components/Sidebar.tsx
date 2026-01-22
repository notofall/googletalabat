
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  CheckSquare, 
  ShoppingBag, 
  PackageCheck, 
  Database, 
  BarChart3, 
  LogOut,
  UserCircle,
  X,
  Sparkles,
  Building2,
  Receipt,
  Gavel
} from 'lucide-react';
import { User, UserRole, SystemSettings } from '../types';
import { ROLE_NAMES } from '../constants';
import { dbService } from '../services/databaseService';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, onLogout, onClose }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await dbService.getSystemSettings();
        setSettings(s);
      } catch (e) { console.debug("Using default branding"); }
    };
    loadSettings();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard, roles: Object.values(UserRole) },
    { id: 'material_requests', label: 'طلبات المواد', icon: FilePlus, roles: [UserRole.SUPERVISOR, UserRole.ADMIN] },
    { id: 'approvals', label: 'مركز التعميد', icon: CheckSquare, roles: [UserRole.ENGINEER, UserRole.GENERAL_MANAGER, UserRole.ADMIN] },
    { id: 'quotations', label: 'المناقصات (Sourcing)', icon: Gavel, roles: [UserRole.PROCUREMENT_MANAGER, UserRole.GENERAL_MANAGER, UserRole.ADMIN] },
    { id: 'procurement', label: 'أوامر الشراء', icon: ShoppingBag, roles: [UserRole.PROCUREMENT_MANAGER, UserRole.GENERAL_MANAGER, UserRole.ADMIN] },
    { id: 'receipts', label: 'المخزون والاستلام', icon: PackageCheck, roles: [UserRole.SUPERVISOR, UserRole.QUANTITY_SURVEYOR, UserRole.ADMIN] },
    { id: 'invoices', label: 'الفواتير والمطابقة', icon: Receipt, roles: [UserRole.PROCUREMENT_MANAGER, UserRole.GENERAL_MANAGER, UserRole.ADMIN] },
    { id: 'master_data', label: 'البيانات والتحكم', icon: Database, roles: [UserRole.ADMIN, UserRole.QUANTITY_SURVEYOR, UserRole.PROCUREMENT_MANAGER, UserRole.GENERAL_MANAGER] },
    { id: 'reports', label: 'التقارير والذكاء', icon: BarChart3, roles: Object.values(UserRole) },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-72 bg-[#0f172a] text-white flex flex-col h-full shadow-2xl lg:shadow-none border-l border-slate-800/50">
      <div className="p-8 pb-4 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
            {settings?.companyLogoUrl ? <img src={settings.companyLogoUrl} alt="logo" className="w-6 h-6 object-contain" /> : <Building2 size={24} className="text-white" />}
          </div>
          <div className="overflow-hidden">
            <h1 className="text-xl font-black text-white tracking-tight truncate">{settings?.companyName || 'إتقان'}</h1>
            <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">v2.2</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Enterprise</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar space-y-1">
        <div className="px-4 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">القائمة الرئيسية</div>
        <nav className="space-y-1">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/40' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {activeTab === item.id && <Sparkles className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20 animate-pulse" size={16} />}
              <item.icon size={20} className={activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-bold text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 mx-4 mb-4 bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-600">
                <UserCircle size={28} />
             </div>
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-800 rounded-full"></div>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-black truncate text-white">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate font-bold uppercase">{ROLE_NAMES[user.role]}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 border border-red-500/10 font-black text-xs"
        >
          <LogOut size={16} />
          <span>تسجيل خروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
