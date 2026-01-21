
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import MaterialRequestView from './views/MaterialRequestView';
import ApprovalsView from './views/ApprovalsView';
import ProcurementView from './views/ProcurementView';
import ReceiptsView from './views/ReceiptsView';
import MasterDataView from './views/MasterDataView';
import ReportsView from './views/ReportsView';
import Login from './views/Login';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('proc_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('proc_user');
    setUser(null);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'material_requests': return <MaterialRequestView user={user} />;
      case 'approvals': return <ApprovalsView user={user} />;
      case 'procurement': return <ProcurementView user={user} />;
      case 'receipts': return <ReceiptsView user={user} />;
      case 'master_data': return <MasterDataView user={user} />;
      case 'reports': return <ReportsView user={user} />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-['Cairo'] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Desktop and Mobile Drawer */}
      <div className={`
        fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-30 shadow-sm">
          <button onClick={toggleSidebar} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-black text-emerald-600 text-lg">إتقان</span>
          </div>
          <div className="w-10"></div> {/* Spacer to center title */}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
