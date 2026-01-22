
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { dbService } from '../services/databaseService';
import { LogIn, ShieldCheck, Zap, Globe, LayoutGrid, ServerCog, UserPlus, Building2 } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSystemInitialized, setIsSystemInitialized] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkInit = async () => {
      try {
        const initialized = await dbService.isSystemInitialized();
        setIsSystemInitialized(initialized);
      } catch (e) {
        // If check fails (e.g. network error before mock switch), default to initialized (show login)
        // or handle gracefully. For now, assume initialized to show login so user isn't stuck.
        console.error("Init check failed", e);
        setIsSystemInitialized(true); 
      }
    };
    checkInit();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await dbService.authenticateUser(email, password);
      if (user) {
        sessionStorage.setItem('proc_user', JSON.stringify(user));
        onLogin(user);
      }
    } catch (error) {
      alert('بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const admin = await dbService.registerSystemAdmin(adminName, adminEmail);
        sessionStorage.setItem('proc_user', JSON.stringify(admin));
        onLogin(admin);
    } catch (e) {
        alert("فشل في تهيئة النظام");
    } finally {
        setLoading(false);
    }
  };

  if (isSystemInitialized === null) {
      return (
          <div className="min-h-screen bg-[#0f172a] flex items-center justify-center font-['Cairo'] text-white">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-sm font-bold opacity-70">جاري الاتصال بالمنظومة...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-['Cairo'] overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
        <div className="hidden lg:flex flex-col justify-center space-y-12 text-white">
           <div className="space-y-4">
              <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-8">
                <Building2 size={40} className="text-white" />
              </div>
              <h1 className="text-7xl font-black leading-tight tracking-tighter">
                 منظومة <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">إتقان المؤسسية</span>
              </h1>
              <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">الجيل الجديد لإدارة المشتريات والرقابة المالية للمؤسسات الكبرى.</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'تتبع العمليات', desc: 'Audit Trail', icon: ShieldCheck },
                { label: 'دعم القرار AI', desc: 'Gemini Insight', icon: Zap }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md">
                   <item.icon className="text-emerald-500 mb-4" size={32} />
                   <h3 className="font-black text-lg">{item.label}</h3>
                   <p className="text-slate-500 text-xs font-bold uppercase">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="flex items-center justify-center">
           <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-slate-100 relative group transition-all">
              {!isSystemInitialized ? (
                <form onSubmit={handleSetup} className="animate-fadeIn space-y-8">
                   <div className="text-center md:text-right">
                      <h2 className="text-3xl font-black text-slate-900 mb-2">تهيئة المنظومة</h2>
                      <p className="text-slate-500 font-bold">تسجيل مدير النظام الرئيسي للمؤسسة</p>
                   </div>
                   <div className="space-y-4">
                      <input required value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="اسم المدير الكامل" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                      <input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="البريد الإلكتروني المؤسسي" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                   </div>
                   <button type="submit" disabled={loading} className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                      {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><UserPlus /> تشغيل النظام</>}
                   </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="animate-fadeIn space-y-8">
                   <div className="text-center md:text-right">
                      <h2 className="text-4xl font-black text-slate-900 mb-2">تسجيل الدخول</h2>
                      <p className="text-slate-500 font-bold">مرحباً بك في بوابتك المؤسسية</p>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Username or Email</label>
                         {/* Changed type to text to allow non-email usernames */}
                         <input required type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="اسم المستخدم أو البريد الإلكتروني" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Security Credentials</label>
                         <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                      </div>
                   </div>
                   <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 group">
                      {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><LogIn className="group-hover:translate-x-[-4px] transition-transform" /> دخول آمن</>}
                   </button>
                   <p className="text-center text-slate-400 text-xs font-bold">Itqan v2.0 Enterprise &copy; 2025</p>
                </form>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
