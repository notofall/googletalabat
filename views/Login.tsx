
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LogIn, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Simulation accounts for demo
  const accounts: Record<string, User> = {
    'supervisor@itqan.sa': { id: '1', name: 'أحمد المشرف', email: 'supervisor@itqan.sa', role: UserRole.SUPERVISOR },
    'engineer@itqan.sa': { id: '2', name: 'م. خالد مهندس', email: 'engineer@itqan.sa', role: UserRole.ENGINEER },
    'pm@itqan.sa': { id: '3', name: 'ياسر مدير المشتريات', email: 'pm@itqan.sa', role: UserRole.PROCUREMENT_MANAGER, approvalLimit: 50000 },
    'gm@itqan.sa': { id: '4', name: 'د. فهد المدير العام', email: 'gm@itqan.sa', role: UserRole.GENERAL_MANAGER },
    'admin@itqan.sa': { id: '5', name: 'سارة مدير النظام', email: 'admin@itqan.sa', role: UserRole.ADMIN },
    'qs@itqan.sa': { id: '6', name: 'م. عمر مهندس كميات', email: 'qs@itqan.sa', role: UserRole.QUANTITY_SURVEYOR },
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = accounts[email.toLowerCase()];
    if (user) {
      sessionStorage.setItem('proc_user', JSON.stringify(user));
      onLogin(user);
    } else {
      alert('مستخدم غير موجود. جرب أحد الحسابات التجريبية بالأسفل.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-['Cairo']">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 space-y-8 animate-scaleUp">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-emerald-600">إتقان</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">نظام إدارة المشتريات والمشاريع</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@itqan.sa"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3 space-x-reverse"
            >
              <LogIn size={24} />
              <span>دخول للنظام</span>
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-amber-600 mb-4 justify-center">
              <ShieldAlert size={18} />
              <span className="text-sm font-bold">حسابات تجريبية للمعاينة:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-bold">
              <button onClick={() => setEmail('supervisor@itqan.sa')} className="bg-slate-50 p-2 rounded hover:bg-slate-100 border text-right">مشرف موقع</button>
              <button onClick={() => setEmail('engineer@itqan.sa')} className="bg-slate-50 p-2 rounded hover:bg-slate-100 border text-right">مهندس تعميد</button>
              <button onClick={() => setEmail('pm@itqan.sa')} className="bg-slate-50 p-2 rounded hover:bg-slate-100 border text-right">مدير مشتريات</button>
              <button onClick={() => setEmail('gm@itqan.sa')} className="bg-slate-50 p-2 rounded hover:bg-slate-100 border text-right">مدير عام</button>
              <button onClick={() => setEmail('qs@itqan.sa')} className="bg-slate-50 p-2 rounded hover:bg-slate-100 border text-right">مهندس كميات</button>
              <button onClick={() => setEmail('admin@itqan.sa')} className="bg-slate-50 p-2 rounded hover:bg-slate-100 border text-right">مدير نظام</button>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-slate-500 text-xs font-medium">جميع الحقوق محفوظة &copy; 2024 نظام إتقان للمشتريات والمشاريع</p>
      </div>
    </div>
  );
};

export default Login;
