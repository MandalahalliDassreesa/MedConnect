
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { ClinicalDuty } from '../types';
import { Stethoscope, Clock, CheckCircle, AlertCircle, ClipboardList, Plus, Search, Calendar, ChevronRight, Sparkles, Loader2, X, FileText, Info } from 'lucide-react';
import { queryLocalAI } from '../services/localAI';

const ClinicalView: React.FC = () => {
  const [duties, setDuties] = useState<ClinicalDuty[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<ClinicalDuty | null>(null);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  const [newEntry, setNewEntry] = useState({ 
    department: '', 
    time: '08:00 - 14:00', 
    date: new Date().toISOString().split('T')[0],
    notes: '',
    logbookStatus: 'Pending' as const 
  });

  useEffect(() => {
    setDuties(db.getDuties());
  }, []);

  const handleAdd = () => {
    if (!newEntry.department) return;
    db.addLogbookEntry(newEntry);
    setDuties(db.getDuties());
    setShowForm(false);
    setNewEntry({ 
      department: '', 
      time: '08:00 - 14:00', 
      date: new Date().toISOString().split('T')[0],
      notes: '',
      logbookStatus: 'Pending' 
    });
  };

  const handleToggleStatus = (id: string, current: 'Pending' | 'Completed') => {
    const next = current === 'Pending' ? 'Completed' : 'Pending';
    db.updateLogbookStatus(id, next);
    setDuties(db.getDuties());
    if (selectedDuty?.id === id) {
      setSelectedDuty(prev => prev ? { ...prev, logbookStatus: next } : null);
    }
  };

  const getAiBriefing = async (dept: string) => {
    setLoadingAi(true);
    setAiBriefing(null);
    try {
      // 100% Offline lookup
      const response = await queryLocalAI(dept);
      setAiBriefing(response || "Local clinical data for this department is being indexed.");
    } catch (e) {
      setAiBriefing("Offline AI engine encountered an internal registry error.");
    } finally {
      setLoadingAi(false);
    }
  };

  const pendingCount = duties.filter(d => d.logbookStatus === 'Pending').length;
  const completionRate = duties.length ? Math.round((duties.filter(d => d.logbookStatus === 'Completed').length / duties.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Clinical Postings</h2>
          <p className="text-slate-500 font-medium mt-1">Official Institutional Logbook & Posting Registry</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Log Posting
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Duty List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <Clock className="w-5 h-5" /> Current Schedule
              </h3>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {duties.map(duty => (
                <div 
                  key={duty.id} 
                  onClick={() => setSelectedDuty(duty)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[2rem] border-2 transition-all cursor-pointer group ${selectedDuty?.id === duty.id ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20' : 'bg-slate-50 border-transparent dark:bg-slate-900/40 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl shadow-xl transition-all ${duty.logbookStatus === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-blue-600 border dark:border-slate-700'}`}>
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">{duty.department}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{duty.date} • {duty.time}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(duty.id, duty.logbookStatus); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${duty.logbookStatus === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-600 text-white shadow-lg'}`}
                  >
                    {duty.logbookStatus === 'Completed' ? 'Done' : 'Mark Done'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Details */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-xl flex-1 flex flex-col min-h-[400px]">
            {selectedDuty ? (
              <div className="space-y-8 animate-in fade-in duration-300 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{selectedDuty.department}</h3>
                  <button 
                    onClick={() => getAiBriefing(selectedDuty.department)}
                    className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all group"
                  >
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>

                {loadingAi ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Registry...</p>
                  </div>
                ) : aiBriefing ? (
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-bold mb-2 flex items-center gap-2">
                       <Info className="w-4 h-4" /> Air-Gapped Advisory
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">{aiBriefing}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Select the clinical diamond icon for an offline departmental briefing.</p>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Stethoscope className="w-10 h-10 text-slate-200 mb-6" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Select a posting entry</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden p-10">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-8">Log Duty Entry</h3>
            <div className="space-y-6">
              <input 
                className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-5 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10"
                placeholder="Department..."
                value={newEntry.department}
                onChange={e => setNewEntry({...newEntry, department: e.target.value})}
              />
              <input 
                type="date"
                className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-5 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10"
                value={newEntry.date}
                onChange={e => setNewEntry({...newEntry, date: e.target.value})}
              />
              <button 
                onClick={handleAdd} 
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
              >
                Sync to Logbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalView;
