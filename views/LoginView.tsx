
import React, { useState } from 'react';
import { db } from '../services/db';
import { GraduationCap, Mail, Lock, User, ArrowRight, Stethoscope, Loader2, AlertCircle, Building2, Heart, Activity, Calendar, ChevronDown } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    year: 'MBBS Phase I',
    bloodGroup: 'O+',
    emergencyContact: '',
    contactNumber: '',
    cgpa: '',
    percentage: '0%'
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await db.login(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Invalid credentials. Please verify your institutional email and passkey.');
      }
    } catch (err) {
      setError("Institutional database is currently offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation: Email must end with .edu
    if (!signupData.email.toLowerCase().endsWith('.edu')) {
      setError('Registration restricted to institutional .edu email addresses.');
      return;
    }

    // Validation: CGPA max is 10
    const cgpaVal = parseFloat(signupData.cgpa);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      setError('CGPA must be a valid number between 0.0 and 10.0');
      return;
    }

    setLoading(true);
    try {
      const newUser = await db.signup({
        ...signupData,
        cgpa: cgpaVal.toFixed(2),
        role: 'Student',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${signupData.name}`
      });
      if (newUser) {
        onLoginSuccess(newUser);
      } else {
        setError('Email already exists in the institutional registry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 border border-slate-100">
        
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
                <GraduationCap className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">MedConnect</h1>
            </div>
            <h2 className="text-6xl font-black tracking-tighter leading-none mb-6">
              Institutional <span className="text-blue-500">Access.</span><br/>Secure Gateway.
            </h2>
            <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed">
              Standardized secure authentication for medical students and institutional faculty.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
               <Lock className="w-6 h-6 text-blue-400 mb-3" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Identity Guard</p>
               <p className="text-[10px] text-slate-500">SHA-256 Auth</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
               <Stethoscope className="w-6 h-6 text-emerald-400 mb-3" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Sync Pipeline</p>
               <p className="text-[10px] text-slate-500">Local DB Encryption</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white overflow-y-auto max-h-screen custom-scrollbar">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8 text-center lg:text-left">
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
                {isLogin ? 'Welcome Back' : 'Join Registry'}
              </h3>
              <p className="text-slate-500 font-medium text-sm">
                {isLogin ? 'Enter your secure clinical workstation.' : 'Enroll in the academic ecosystem.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[11px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        className="w-full bg-slate-50 text-slate-900 border-none rounded-2xl p-4 pl-12 text-sm font-medium outline-none focus:ring-4 ring-blue-500/10 transition-all"
                        placeholder="e.g. Dr. Sarah Sharma"
                        value={signupData.name}
                        onChange={e => setSignupData({...signupData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        className="w-full bg-slate-50 text-slate-900 border-none rounded-2xl p-4 pl-12 text-sm font-medium outline-none focus:ring-4 ring-blue-500/10 transition-all"
                        placeholder="e.g. AIIMS New Delhi"
                        value={signupData.college}
                        onChange={e => setSignupData({...signupData, college: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email"
                    required
                    className="w-full bg-slate-50 text-slate-900 border-none rounded-2xl p-4 pl-12 text-sm font-medium outline-none focus:ring-4 ring-blue-500/10 transition-all"
                    placeholder="name@college.edu"
                    value={isLogin ? email : signupData.email}
                    onChange={e => isLogin ? setEmail(e.target.value) : setSignupData({...signupData, email: e.target.value})}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Group</label>
                    <div className="relative">
                      <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select 
                        required
                        className="w-full bg-slate-50 text-slate-900 border-none rounded-2xl p-4 pl-12 text-sm font-medium outline-none focus:ring-4 ring-blue-500/10 transition-all appearance-none"
                        value={signupData.bloodGroup}
                        onChange={e => setSignupData({...signupData, bloodGroup: e.target.value})}
                      >
                        {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current CGPA (Max 10)</label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        className="w-full bg-slate-50 text-slate-900 border-none rounded-2xl p-4 pl-12 text-sm font-medium outline-none focus:ring-4 ring-blue-500/10 transition-all"
                        placeholder="0.00"
                        value={signupData.cgpa}
                        onChange={e => setSignupData({...signupData, cgpa: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Passkey</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password"
                    required
                    className="w-full bg-slate-50 text-slate-900 border-none rounded-2xl p-4 pl-12 text-sm font-medium outline-none focus:ring-4 ring-blue-500/10 transition-all"
                    placeholder="Secure password"
                    value={isLogin ? password : signupData.password}
                    onChange={e => isLogin ? setPassword(e.target.value) : setSignupData({...signupData, password: e.target.value})}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select 
                      className="w-full bg-slate-50 text-slate-900 border-none rounded-2xl p-4 pl-12 text-sm font-medium outline-none focus:ring-4 ring-blue-500/10 transition-all appearance-none"
                      value={signupData.year}
                      onChange={e => setSignupData({...signupData, year: e.target.value})}
                    >
                      <option>MBBS Phase I</option>
                      <option>MBBS Phase II</option>
                      <option>MBBS Phase III</option>
                      <option>Clinical Intern</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isLogin ? 'Enter Workspace' : 'Create Identity'} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="pt-8 mt-10 border-t border-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400 font-bold">
                {isLogin ? "No Institutional Access?" : "Already in registry?"}
              </p>
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
