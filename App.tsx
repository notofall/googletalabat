
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import MaterialRequestView from './views/MaterialRequestView';
import ApprovalsView from './views/ApprovalsView';
import QuotationsView from './views/QuotationsView';
import ProcurementView from './views/ProcurementView';
import ReceiptsView from './views/ReceiptsView';
import InvoicesView from './views/InvoicesView';
import MasterDataView from './views/MasterDataView';
import ReportsView from './views/ReportsView';
import Login from './views/Login';
import { Menu, X, Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('proc_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('proc_user');
    setUser(null);
    addToast('Logged out successfully', 'info');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!user) {
    return <Login onLogin={(u) => { setUser(u); addToast(`Welcome back, ${u.name}`); }} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'material_requests': return <MaterialRequestView user={user} />;
      case 'approvals': return <ApprovalsView user={user} />;
      case 'quotations': return <QuotationsView user={user} />;
      case 'procurement': return <ProcurementView user={user} />;
      case 'receipts': return <ReceiptsView user={user} />;
      case 'invoices': return <InvoicesView user={user} />;
      case 'master_data': return <MasterDataView user={user} />;
      case 'reports': return <ReportsView user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-['Cairo'] overflow-hidden">
      <div className="fixed top-6 left-6 z-[200] space-y-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-slideInLeft min-w-[300px] ${
              toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 
              toast.type === 'error' ? 'bg-white border-red-100 text-red-700' : 'bg-white border-blue-100 text-blue-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="text-emerald-500" size={20} />}
            {toast.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
            {toast.type === 'info' && <Info className="text-blue-500" size={20} />}
            <span className="font-black text-sm">{toast.message}</span>
          </div>
        ))}
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className={`
        fixed inset-y-0 right-0 z-[70] w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 bg-[#0f172a]
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:shadow-none'}
      `}>
        <Sidebar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }} 
          onLogout={handleLogout} 
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-40 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
             </button>
             <h2 className="hidden lg:block font-black text-slate-800 text-xl tracking-tight">إتقان لإدارة المشتريات</h2>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 left-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-black text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth w-full max-w-[100vw]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
