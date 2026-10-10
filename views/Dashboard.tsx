
import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../services/db';
import { Clock, BrainCircuit, Heart, Zap, ChevronRight, Activity, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ViewType, UserProfile, StudySession } from '../types';

interface DashboardProps {
  onNavigate?: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

  useEffect(() => {
    setUser(db.getCurrentUser());
    setStudySessions(db.getStudySessions());
    
    // Refresh interval for live velocity updates
    const interval = setInterval(() => {
      setStudySessions(db.getStudySessions());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const theme = useMemo(() => {
    const defaultTheme = {
      name: 'blue',
      text: 'text-blue-600',
      grad: 'from-blue-600 via-blue-500 to-indigo-700',
      border: 'border-blue-500',
      bg: 'bg-blue-600',
      shadow: 'shadow-blue-500/30'
    };
    if (!user) return defaultTheme;
    const year = user.year;
    if (year.includes('Phase II')) return { ...defaultTheme, name: 'yellow', text: 'text-yellow-600', grad: 'from-yellow-400 via-orange-400 to-yellow-500', border: 'border-yellow-500', bg: 'bg-yellow-500' };
    return defaultTheme;
  }, [user]);

  const chartData = useMemo(() => {
    if (timeRange === 'weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, idx) => {
        const date = new Date();
        const diff = (date.getDay() === 0 ? 6 : date.getDay() - 1) - idx;
        date.setDate(date.getDate() - diff);
        const dateStr = date.toISOString().split('T')[0];
        const dayHours = studySessions
          .filter(s => s.date === dateStr)
          .reduce((sum, s) => sum + s.hours, 0);
        return { name: day, hours: parseFloat(dayHours.toFixed(2)) };
      });
    } else if (timeRange === 'monthly') {
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => {
        // Mocking previous weeks for better visualization, but keeping actual for current
        return {
          name: week,
          hours: i === 3 ? parseFloat(studySessions.reduce((s, c) => s + c.hours, 0).toFixed(1)) : Math.floor(Math.random() * 10) + 15
        };
      });
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => ({
        name: month,
        hours: Math.floor(Math.random() * 50) + 20
      }));
    }
  }, [studySessions, timeRange]);

  const totalHours = useMemo(() => studySessions.reduce((acc, curr) => acc + curr.hours, 0), [studySessions]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`${theme.bg} text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg ${theme.shadow}`}>Node Logged</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Velocity Tracking: Active</span>
          </div>
          <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter leading-tight">
            Welcome, <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme.grad}`}>{user?.name?.split(' ')[0] || 'Member'}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Academic context: {user?.college} ({user?.year})</p>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col items-end">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
             <div className={`bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border-2 ${theme.border} shadow-xl flex items-center gap-3`}>
               <Activity className={`w-5 h-5 ${theme.text}`} />
               <span className="font-black text-sm text-slate-800 dark:text-white">Active Session</span>
             </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`relative group overflow-hidden bg-gradient-to-br ${theme.grad} p-8 rounded-[3rem] text-white shadow-2xl transition-all hover:-translate-y-2 cursor-pointer`}>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/70 font-black uppercase tracking-widest mb-1">{timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Session</p>
            <div className="flex items-end gap-2">
               <p className="text-5xl font-black tracking-tighter">{totalHours.toFixed(1)}</p>
               <p className="text-sm font-black opacity-80 mb-2 uppercase">Hours</p>
            </div>
            <div className="mt-8 flex items-center gap-2">
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white shadow-[0_0_10px_white]" style={{ width: `${Math.min(totalHours * 10, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div onClick={() => onNavigate?.('simulation')} className="relative group overflow-hidden bg-gradient-to-br from-fuchsia-600 via-rose-500 to-orange-600 p-8 rounded-[3rem] text-white shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/70 font-black uppercase tracking-widest mb-1">3D Simulation</p>
            <div className="flex items-end gap-2">
               <p className="text-5xl font-black tracking-tighter">14</p>
               <p className="text-sm font-black opacity-80 mb-2 uppercase">Cases</p>
            </div>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 p-8 rounded-[3rem] text-white shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/70 font-black uppercase tracking-widest mb-1">CGPA Metric</p>
            <div className="flex items-end gap-2">
               <p className="text-5xl font-black tracking-tighter">{user?.cgpa || '8.2'}</p>
               <p className="text-sm font-black opacity-80 mb-2 uppercase">Points</p>
            </div>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 p-8 rounded-[3rem] text-white shadow-2xl transition-all hover:-translate-y-2 cursor-pointer">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/70 font-black uppercase tracking-widest mb-1">Attendance</p>
            <div className="flex items-end gap-2">
               <p className="text-5xl font-black tracking-tighter">{user?.percentage || '86%'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[4rem] border dark:border-slate-700 shadow-xl overflow-hidden relative">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 relative z-10 gap-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] flex items-center gap-4">
                  <div className={`w-3 h-8 ${theme.bg} rounded-full shadow-lg ${theme.shadow}`} />
                  Study Velocity (Active Tracking)
                </h3>
              </div>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border dark:border-slate-700">
                {(['weekly', 'monthly', 'yearly'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      timeRange === range
                        ? `${theme.bg} text-white shadow-lg`
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={timeRange === 'weekly' ? '#6366f1' : timeRange === 'monthly' ? '#10b981' : '#f59e0b'} stopOpacity={0.6}/>
                      <stop offset="95%" stopColor={timeRange === 'weekly' ? '#6366f1' : timeRange === 'monthly' ? '#10b981' : '#f59e0b'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', backgroundColor: '#1e293b', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 900 }}
                    formatter={(value: any) => [`${value} hrs`, 'Study Duration']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke={timeRange === 'weekly' ? '#6366f1' : timeRange === 'monthly' ? '#10b981' : '#f59e0b'} 
                    strokeWidth={5} 
                    fillOpacity={1} 
                    fill="url(#colorVelocity)" 
                    animationDuration={1500} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[4rem] border dark:border-slate-700 shadow-xl relative overflow-hidden">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <Heart className="w-5 h-5 text-rose-500" />
              Personal Info
            </h3>
            <div className="space-y-4">
               <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Blood Group</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">{user?.bloodGroup}</p>
               </div>
               <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Institutional Contact</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">+91 {user?.contactNumber}</p>
               </div>
               <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Emergency</p>
                  <p className="text-lg font-black text-rose-500">{user?.emergencyContact}</p>
               </div>
            </div>
          </div>
          
          <button onClick={() => onNavigate?.('inquiries')} className="w-full bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl flex items-center justify-between group hover:bg-black transition-all">
             <div className="flex items-center gap-4 text-left">
                <div className="p-3 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform">
                   <HelpCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Academic Help</p>
                   <p className="text-lg font-black tracking-tight leading-none">Have a Doubt?</p>
                </div>
             </div>
             <ChevronRight className="w-6 h-6 text-slate-600 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Local component needed for dashboard
const HelpCircle = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default Dashboard;
