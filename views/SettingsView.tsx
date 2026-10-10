
import React, { useState } from 'react';
import { Bell, Shield, Cloud, Monitor, ChevronRight, Lock, Eye, Globe } from 'lucide-react';

const SettingsView: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [sync, setSync] = useState(true);

  const SettingRow = ({ icon: Icon, label, desc, toggle, value, set }: any) => (
    <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-[2rem] border dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-5">
        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-300">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{label}</h4>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{desc}</p>
        </div>
      </div>
      {toggle ? (
        <button 
          onClick={() => set(!value)}
          className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'right-1' : 'left-1'}`} />
        </button>
      ) : (
        <ChevronRight className="w-5 h-5 text-slate-300" />
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">System Preferences</h2>
        <p className="text-slate-500 font-medium mt-1">Configure your clinical workstation and data privacy.</p>
      </header>

      <div className="max-w-3xl space-y-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Workstation Config</h3>
          <SettingRow icon={Bell} label="Push Notifications" desc="Exam and clinical duty alerts" toggle value={notifications} set={setNotifications} />
          <SettingRow icon={Cloud} label="Cloud Database Sync" desc="Real-time backup to MedConnect server" toggle value={sync} set={setSync} />
          <SettingRow icon={Monitor} label="Display Mode" desc="System adaptive dark mode" />
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Security & Privacy</h3>
          <SettingRow icon={Lock} label="Authentication" desc="Biometric and 2FA settings" />
          <SettingRow icon={Eye} label="Visibility" desc="Who can see your clinical logs" />
          <SettingRow icon={Globe} label="Region" desc="Institutional zone: North America" />
        </div>

        <div className="p-10 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 rounded-[3rem] border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">MedConnect Professional v3.4.0</p>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">This instance is managed by the College IT department. Some settings may be restricted by administrator policies.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
