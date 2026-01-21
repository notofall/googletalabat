
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { dbService } from '../services/databaseService';
import { LogIn, ShieldCheck, Zap, Globe, LayoutGrid, ServerCog, UserPlus } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSystemInitialized, setIsSystemInitialized] = useState<boolean | null>(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Setup State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if system is initialized (First Run Check)
    const checkInit = async () => {
      const initialized = await dbService.isSystemInitialized();
      setIsSystemInitialized(initialized);
    };
    checkInit();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(async () => {
        const user = await dbService.authenticateUser(email, password);
        if (user) {
          sessionStorage.setItem('proc_user', JSON.stringify(user));
          onLogin(user);
        } else {
          alert('بيانات الدخول غير صحيحة.');
        }
        setLoading(false);
    }, 800);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (adminPassword.length < 6) {
        alert("كلمة المرور يجب أن تكون 6 خانات على الأقل");
        setLoading(false);
        return;
    }

    setTimeout(async () => {
        const admin = await dbService.registerSystemAdmin(adminName, adminEmail, adminPassword);
        sessionStorage.setItem('proc_user', JSON.stringify(admin));
        alert("تم تهيئة النظام وتسجيل المدير بنجاح!");
        onLogin(admin);
        setLoading(false);
    }, 1000);
  };

  if (isSystemInitialized === null) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4 font-['Cairo'] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 z-10">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-10 text-white p-8">
            <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-6">
                    <LayoutGrid size={32} className="text-white" />
                </div>
                <h1 className="text-6xl font-black tracking-tight leading-tight">
                    نظام إتقان <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">الإصدار 2.0</span>
                </h1>
                <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
                    الحل المؤسسي المتكامل لإدارة المشتريات، العقود، وسلاسل الإمداد بدعم من الذكاء الاصطناعي.
                </p>
            </div>

            <div className="space-y-6">
                {[
                    { title: 'أداء عالي', desc: 'معالجة بيانات ضخمة بسرعة فائقة', icon: Zap },
                    { title: 'أمان متقدم', desc: 'تشفير وحماية للصلاحيات', icon: ShieldCheck },
                    { title: 'سحابي', desc: 'وصول من أي مكان وفي أي وقت', icon: Globe },
                ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="p-3 bg-white/10 rounded-xl text-emerald-400">
                            <feature.icon size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{feature.title}</h3>
                            <p className="text-slate-400 text-sm">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Right Side: Form (Login OR Setup) */}
        <div className="flex items-center justify-center">
            <div className="glass-panel w-full max-w-md p-8 md:p-10 rounded-[40px] shadow-2xl relative">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <LayoutGrid size={120} />
                </div>

                {!isSystemInitialized ? (
                    // --- SETUP SCREEN (FIRST RUN) ---
                    <div className="animate-fadeIn">
                        <div className="mb-8 text-center lg:text-right">
                            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-black mb-3">
                                <ServerCog size={14} /> إعداد النظام
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 mb-2">تهيئة النظام لأول مرة</h2>
                            <p className="text-slate-500 font-bold">يرجى تسجيل بيانات مدير النظام (Admin) للمتابعة.</p>
                        </div>

                        <form onSubmit={handleSetup} className="space-y-5">
                             <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700">اسم المدير</label>
                                <input required type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="الاسم الكامل" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700">البريد الإلكتروني</label>
                                <input required type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="admin@example.com" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700">كلمة المرور</label>
                                <input required type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="••••••••" />
                             </div>

                             <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center gap-3">
                                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><UserPlus size={20} /> حفظ وإنشاء النظام</>}
                             </button>
                        </form>
                    </div>
                ) : (
                    // --- LOGIN SCREEN (NORMAL) ---
                    <div className="animate-fadeIn">
                        <div className="mb-8 text-center lg:text-right">
                            <h2 className="text-3xl font-black text-slate-800 mb-2">تسجيل الدخول</h2>
                            <p className="text-slate-500 font-bold">مرحباً بك مجدداً في مساحة العمل</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700">البريد الإلكتروني</label>
                                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 transition-all" placeholder="user@itqan.sa" dir="ltr" />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700">كلمة المرور</label>
                                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 transition-all" placeholder="••••••••" dir="ltr" />
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-600 hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
                                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span className="ml-2">دخول آمن</span><LogIn size={20} className="rtl:rotate-180" /></>}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/20 text-xs font-bold">
        Itqan Procurement System v2.0 &copy; 2025
      </div>
    </div>
  );
};

export default Login;
