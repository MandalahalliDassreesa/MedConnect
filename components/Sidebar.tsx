
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, Layers, BarChart3, Settings, GraduationCap, 
  Calendar, Stethoscope, Home, Bell, CreditCard, User, LogOut, Library as LibraryIcon, Database, ExternalLink, HelpCircle
} from 'lucide-react';
import { ViewType } from '../types';
import { db } from '../services/db';
import { sheets } from '../services/googleSheets';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onLogout: () => void;
  theme: any;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, theme }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSheetConnected, setIsSheetConnected] = useState(false);
  const currentUser = db.getCurrentUser();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSyncing(db.getSyncState());
      setIsSheetConnected(sheets.getStatus());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const academicItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', baseColor: 'text-blue-500' },
    { id: 'subjects', icon: BookOpen, label: 'Subjects', baseColor: 'text-indigo-500' },
    { id: 'library', icon: LibraryIcon, label: 'Resources', baseColor: 'text-cyan-500' },
    { id: 'simulation', icon: Layers, label: '3D Simulation', baseColor: 'text-rose-500' },
    { id: 'performance', icon: BarChart3, label: 'Performance', baseColor: 'text-emerald-500' },
    { id: 'inquiries', icon: HelpCircle, label: 'Academic Help', baseColor: 'text-amber-500' },
  ];

  const adminItems = [
    { id: 'clinical', icon: Stethoscope, label: 'Clinical', baseColor: 'text-amber-500' },
    { id: 'calendar', icon: Calendar, label: 'Calendar', baseColor: 'text-purple-500' },
    { id: 'hostel', icon: Home, label: 'Hostel', baseColor: 'text-orange-500' },
    { id: 'notices', icon: Bell, label: 'Notices', baseColor: 'text-pink-500' },
    { id: 'fees', icon: CreditCard, label: 'Fees', baseColor: 'text-cyan-500' },
  ];

  const NavItem: React.FC<{ item: any }> = ({ item }) => {
    const isActive = currentView === item.id;
    return (
      <button
        onClick={() => setView(item.id as ViewType)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${
          isActive
            ? `bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-black shadow-xl border border-slate-100 dark:border-slate-600`
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700'
        }`}
      >
        {isActive && <div className={`absolute left-0 w-1.5 h-6 rounded-full ${theme.bg}`} />}
        <div className={`p-2 rounded-xl transition-all ${isActive ? `bg-white dark:bg-slate-800 shadow-lg ${theme.glow}` : 'bg-slate-50 dark:bg-slate-900 group-hover:scale-110'}`}>
          <item.icon className={`w-4 h-4 ${isActive ? theme.text : item.baseColor}`} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="w-72 bg-white dark:bg-slate-900 border-r dark:border-slate-800 h-full flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-30">
      <div className="p-8 flex items-center gap-4">
        <div className={`${theme.bg} p-3 rounded-[1.5rem] shadow-xl ${theme.glow}`}>
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className={`text-2xl font-black ${theme.text} tracking-tighter leading-none`}>MEDCONNECT</h1>
          <div className="flex items-center gap-2 mt-1">
             <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isSyncing ? 'Pushing Data' : 'Cloud Standby'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-6 mt-4 overflow-y-auto custom-scrollbar space-y-10">
        <div>
          <div className="flex items-center gap-2 mb-6 px-2">
             <div className={`w-1 h-3 ${theme.bg} rounded-full`} />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Academic Core</p>
          </div>
          <div className="space-y-2">
            {academicItems.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-6 px-2">
             <div className={`w-1 h-3 bg-rose-500 rounded-full`} />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Ecosystem</p>
          </div>
          <div className="space-y-2">
            {adminItems.map(item => <NavItem key={item.id} item={item} />)}
          </div>
        </div>

        {/* ADMIN ONLY ACCESS: Only the user with 'Admin' role can see this console */}
        {currentUser?.role === 'Admin' && (
          <div className="mt-10 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
                <Database className="w-4 h-4 text-blue-500" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admin Control</p>
            </div>
            <button 
                onClick={() => setView('database')} 
                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${currentView === 'database' ? 'bg-slate-900 text-white' : 'bg-white dark:bg-slate-900 border dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
            >
                Database Console <ExternalLink className="w-3 h-3" />
            </button>
            <div className="mt-3 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isSheetConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <p className="text-[8px] font-bold text-slate-400 uppercase">{isSheetConnected ? 'Sync Pipeline Active' : 'Local Only'}</p>
            </div>
          </div>
        )}
      </nav>

      <div className="p-6 mt-auto">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all text-rose-500 font-black uppercase tracking-widest text-[10px] bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 mb-6 group border border-transparent hover:border-rose-200">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-md group-hover:scale-110 transition-transform">
            <LogOut className="w-4 h-4" />
          </div>
          Terminate Session
        </button>
        <div className="space-y-2">
          <NavItem item={{ id: 'profile', icon: User, label: 'Identity', baseColor: 'text-slate-500' }} />
          <NavItem item={{ id: 'settings', icon: Settings, label: 'Preferences', baseColor: 'text-slate-500' }} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
