
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import SubjectsView from './views/SubjectsView';
import Simulation from './views/Simulation';
import ClinicalView from './views/ClinicalView';
import PerformanceView from './views/PerformanceView';
import CalendarView from './views/CalendarView';
import HostelView from './views/HostelView';
import NoticeBoard from './views/NoticeBoard';
import FeeManagement from './views/FeeManagement';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';
import Library from './views/Library';
import DatabaseManager from './views/DatabaseManager'; 
import InquiryView from './views/InquiryView';
import AIAssistant from './components/AIAssistant';
import { db } from './services/db';
import { ViewType, UserProfile } from './types';
import { Bell, Search, Sun, Moon, ShieldCheck, Menu, X, Command } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('mc_theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Session Tracking
  const sessionStartRef = useRef<number>(Date.now());
  const lastSyncRef = useRef<number>(Date.now());

  useEffect(() => {
    const activeUser = db.getCurrentUser();
    if (activeUser) setUser(activeUser);

    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mc_theme', 'light');
    }

    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDark]);

  // Persistent Session Logging
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMinutes = (now - lastSyncRef.current) / (1000 * 60);
      
      if (elapsedMinutes >= 1) { // Log every minute
        const hours = elapsedMinutes / 60;
        db.logStudyTime(hours);
        lastSyncRef.current = now;
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    // Final log before exit
    const elapsedMinutes = (Date.now() - lastSyncRef.current) / (1000 * 60);
    if (elapsedMinutes > 0.1) {
      db.logStudyTime(elapsedMinutes / 60);
    }
    db.logout();
    setUser(null);
    setCurrentView('dashboard');
  };

  const theme = useMemo(() => {
    const defaultTheme = {
      name: 'blue',
      accent: 'blue-600',
      text: 'text-blue-600',
      bg: 'bg-blue-600',
      border: 'border-blue-500',
      gradient: 'from-blue-600 via-indigo-600 to-blue-500',
      glow: 'shadow-blue-500/40',
      blob: 'bg-blue-400/10'
    };
    if (!user) return defaultTheme;
    const year = user.year;
    if (year.includes('Phase II')) return { ...defaultTheme, name: 'yellow', bg: 'bg-yellow-500', text: 'text-yellow-600', gradient: 'from-yellow-400 via-orange-400 to-yellow-500' };
    return defaultTheme;
  }, [user]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'subjects': return <SubjectsView onBackToDashboard={() => setCurrentView('dashboard')} />;
      case 'library': return <Library />;
      case 'simulation': return <Simulation onBackToDashboard={() => setCurrentView('dashboard')} theme={theme} />;
      case 'clinical': return <ClinicalView />;
      case 'calendar': return <CalendarView />;
      case 'hostel': return <HostelView />;
      case 'notices': return <NoticeBoard />;
      case 'fees': return <FeeManagement />;
      case 'performance': return <PerformanceView onBackToDashboard={() => setCurrentView('dashboard')} />;
      case 'profile': return <ProfileView />;
      case 'settings': return <SettingsView />;
      case 'database': return <DatabaseManager />;
      case 'inquiries': return <InquiryView onBackToDashboard={() => setCurrentView('dashboard')} />;
      default: return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  if (!user) return <LoginView onLoginSuccess={(u) => setUser(u)} />;

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden relative`}>
      <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] ${theme.blob} dark:opacity-20 rounded-full blur-[120px] pointer-events-none transition-all duration-700`} />
      
      {/* Overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden transition-all opacity-100" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fix: Use flex and relative for desktop to prevent overlap */}
      <aside 
        className={`fixed inset-y-0 left-0 transform transition-all duration-500 ease-in-out z-50 
          ${isSidebarOpen ? 'translate-x-0 w-72 lg:relative lg:translate-x-0' : '-translate-x-full w-0 lg:w-0'}
        `}
      >
        {isSidebarOpen && (
          <Sidebar 
            currentView={currentView} 
            setView={(v) => { 
              setCurrentView(v); 
              if (window.innerWidth < 1024) setIsSidebarOpen(false); 
            }} 
            onLogout={handleLogout} 
            theme={theme} 
          />
        )}
      </aside>

      {/* Main Content Area - Responsive Layout */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10 transition-all duration-500 ease-in-out">
        <header className="h-24 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[1.25rem] border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:scale-105 active:scale-95 transition-all group"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase hidden md:block">MEDCONNECT</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-100 dark:border-emerald-900/30">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Secure Node</span>
            </div>
            <button onClick={() => setIsDark(!isDark)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700">
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            <div 
              onClick={() => setCurrentView('profile')} 
              className="flex items-center gap-3 cursor-pointer group p-2 rounded-2xl transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{user.year}</p>
              </div>
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${theme.gradient} p-[2px]`}>
                 <img src={user.avatar} className="w-full h-full rounded-[13px] bg-white object-cover" alt="user" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto h-full">
            {renderView()}
          </div>
        </main>
      </div>

      <AIAssistant />
    </div>
  );
};

export default App;
