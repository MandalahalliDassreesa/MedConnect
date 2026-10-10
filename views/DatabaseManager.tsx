
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { sheets } from '../services/googleSheets';
import { Database, Link2, Code, Terminal, Save, Trash2, CheckCircle, Download, FileJson, Info, ExternalLink, Globe, Wifi, ShieldCheck, Activity, RefreshCw } from 'lucide-react';

const DatabaseManager: React.FC = () => {
  const [apiUrl, setApiUrl] = useState(sheets.getApiUrl());
  const [sheetUrl, setSheetUrl] = useState(sheets.getSheetUrl());
  const [activeTab, setActiveTab] = useState<'setup' | 'explorer'>('setup');
  const [selectedTable, setSelectedTable] = useState<string>('Users');
  const [tableData, setTableData] = useState<any[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  useEffect(() => {
    refreshTableData();
    const interval = setInterval(() => setIsLiveSyncing(db.getSyncState()), 500);
    return () => clearInterval(interval);
  }, [selectedTable]);

  const refreshTableData = () => {
    switch(selectedTable) {
      case 'Users': setTableData(db.getAllUsers()); break;
      case 'ClinicalLogs': setTableData(db.getDuties()); break;
      case 'Fees': setTableData(db.getFees()); break;
      case 'Performance': setTableData(db.getPerformance()); break;
      default: setTableData([]);
    }
  };

  const handlePullAll = async () => {
    setIsPulling(true);
    await db.pullFromCloud();
    refreshTableData();
    setIsPulling(false);
  };

  const handleSaveConnection = () => {
    sheets.setApiUrl(apiUrl);
    sheets.setSheetUrl(sheetUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(sheets.getScriptTemplate());
    alert("Apps Script copied to clipboard!");
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(tableData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medconnect_${selectedTable.toLowerCase()}.json`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Root Admin</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Globe className="w-3 h-3" /> Global Node Active
            </span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">Global Registry Console</h2>
          <p className="text-slate-500 font-medium mt-2">Institutional-wide student identity and clinical data synchronization hub.</p>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={handlePullAll}
             disabled={isPulling}
             className={`flex items-center gap-3 px-6 py-4 rounded-[1.5rem] bg-white dark:bg-slate-800 border-2 transition-all ${isPulling ? 'border-amber-400 shadow-amber-100 shadow-xl' : 'border-blue-400'}`}
           >
              <RefreshCw className={`w-4 h-4 text-blue-500 ${isPulling ? 'animate-spin' : ''}`} />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">{isPulling ? 'Syncing Global...' : 'Pull Cloud Registry'}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">Refetch All Nodes</span>
              </div>
           </button>
        </div>
      </header>

      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('setup')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'setup' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-400'}`}
        >
          <Link2 className="w-4 h-4" /> Global Setup
        </button>
        <button 
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'explorer' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-400'}`}
        >
          <Terminal className="w-4 h-4" /> Global Registry Explorer
        </button>
      </div>

      {activeTab === 'setup' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] border dark:border-slate-700 shadow-xl space-y-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <Wifi className="w-6 h-6 text-blue-600" /> Institution Cloud Bridge
            </h3>

            <div className="space-y-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">Shared Registry Protocol</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  By configuring this bridge, every workstation logging in with your unique Web App URL will broadcast its identity to your master Google Sheet. This allows institutional-wide monitoring of all MedConnect nodes.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Apps Script Web App URL (Central Hub)</label>
                <input 
                  value={apiUrl}
                  onChange={e => setApiUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-4 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 transition-all font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Spreadsheet Link</label>
                <input 
                  value={sheetUrl}
                  onChange={e => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-4 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 transition-all font-mono text-xs"
                />
              </div>

              <button 
                onClick={handleSaveConnection}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {saveSuccess ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {saveSuccess ? 'Global Config Deployed' : 'Deploy Connection'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]" />
            <h3 className="text-xl font-black flex items-center gap-3 relative z-10">
              <Activity className="w-6 h-6 text-blue-400" /> Master Registry Instructions
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-medium">To see everyone globally, you must use the <strong>v3 Bidirectional Bridge Script</strong> which supports non-destructive data retrieval (GET).</p>
                <ol className="space-y-4">
                  {[
                    "Initialize a 'Master Student Registry' Google Sheet.",
                    "Paste the code provided below into Apps Script.",
                    "Set Deployment to 'Anyone' to allow workstations to push/pull data.",
                    "Registry syncs automatically on every user interaction."
                  ].map((step, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                      <p className="text-xs text-slate-400 font-medium">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-6 bg-black/40 rounded-2xl border border-white/10 font-mono text-[10px] text-blue-300 overflow-x-auto max-h-48 custom-scrollbar">
                <pre>{sheets.getScriptTemplate()}</pre>
              </div>

              <button 
                onClick={handleCopyScript}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
              >
                Copy v3 Global Script
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[3.5rem] border dark:border-slate-700 shadow-xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-8 border-b dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
            <div className="flex gap-2">
              {['Users', 'ClinicalLogs', 'Fees', 'Performance'].map(t => (
                <button 
                  key={t}
                  onClick={() => setSelectedTable(t)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTable === t ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t === 'Users' ? 'Master Student Registry' : t}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button onClick={handleExportJSON} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200">
                <FileJson className="w-4 h-4" /> Master Export (JSON)
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar p-0">
             <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                   <tr>
                      {tableData.length > 0 && Object.keys(tableData[0]).map(k => (
                        <th key={k} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b dark:border-slate-800">
                          {k}
                        </th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                   {tableData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                         {Object.values(row).map((val: any, j) => (
                           <td key={j} className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300 max-w-xs truncate">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                           </td>
                         ))}
                      </tr>
                   ))}
                </tbody>
             </table>
             {tableData.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center p-10">
                 <Globe className="w-16 h-16 text-slate-100 mb-4" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Master Registry Empty</p>
               </div>
             )}
          </div>
          
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-700 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
             <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Aggregated Institutional Registry: Pulling from Cloud Bridge...
             </div>
             <a 
               href={sheets.getSheetUrl()} 
               target="_blank" 
               rel="noreferrer"
               className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-black"
             >
                MASTER REGISTRY SOURCE <ExternalLink className="w-3 h-3" />
             </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseManager;
