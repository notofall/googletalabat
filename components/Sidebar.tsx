
import React from 'react';
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
  X
} from 'lucide-react';
import { User, UserRole } from '../types';
import { ROLE_NAMES } from '../constants';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, onLogout, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, roles: Object.values(UserRole) },
    { id: 'material_requests', label: 'طلب مواد', icon: FilePlus, roles: [UserRole.SUPERVISOR, UserRole.ADMIN] },
    { id: 'approvals', label: 'تعميد الطلبات', icon: CheckSquare, roles: [UserRole.ENGINEER, UserRole.GENERAL_MANAGER, UserRole.ADMIN] },
    { id: 'procurement', label: 'المشتريات والعروض', icon: ShoppingBag, roles: [UserRole.PROCUREMENT_MANAGER, UserRole.GENERAL_MANAGER, UserRole.ADMIN] },
    { id: 'receipts', label: 'استلام المواد', icon: PackageCheck, roles: [UserRole.SUPERVISOR, UserRole.QUANTITY_SURVEYOR, UserRole.ADMIN] },
    { id: 'master_data', label: 'البيانات الأساسية', icon: Database, roles: [UserRole.ADMIN, UserRole.QUANTITY_SURVEYOR] },
    { id: 'reports', label: 'التقارير', icon: BarChart3, roles: Object.values(UserRole) },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col h-full shadow-2xl lg:shadow-none border-l border-slate-800 lg:border-none">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-emerald-500">إتقان</h1>
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-[0.2em] font-bold">نظام المشتريات والمخازن</p>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 no-scrollbar">
        <nav className="space-y-1.5 px-4">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center space-x-3 space-x-reverse mb-4 p-3 bg-slate-800/40 rounded-2xl border border-slate-800">
          <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/10">
            <UserCircle className="text-emerald-500" size={26} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-black truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate font-bold uppercase">{ROLE_NAMES[user.role]}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 border border-red-500/10 font-black text-sm"
        >
          <LogOut size={18} />
          <span>خروج آمن</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
