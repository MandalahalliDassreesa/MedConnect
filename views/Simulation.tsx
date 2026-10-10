
import React, { useState, useEffect, useCallback } from 'react';
import ThreeScene from '../components/ThreeScene';
import { TASKS } from '../constants';
// Fix: Use queryLocalAI with an alias to match the component's expected function name
import { queryLocalAI as getLocalMedicalExplanation } from '../services/localAI'; // Replaced Gemini
import { Target, RotateCw, Activity, Home, Loader2, Sparkles, Microscope, Stethoscope, BookOpen, Fingerprint, Search, Info } from 'lucide-react';

interface SimulationProps {
  onBackToDashboard?: () => void;
  theme?: any;
}

const Simulation: React.FC<SimulationProps> = ({ onBackToDashboard, theme }) => {
  const [selectedOrgan, setSelectedOrgan] = useState<'heart' | 'brain' | 'skeleton' | 'nervous'>('heart');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const fetchExplanation = useCallback(async (subject: string) => {
    setLoadingExplanation(true);
    try {
      // 100% Offline retrieval
      const text = await getLocalMedicalExplanation(subject);
      setExplanation(text || '');
    } catch (e) {
      console.error("Simulation Explanation Error:", e);
    } finally {
      setLoadingExplanation(false);
    }
  }, []);

  useEffect(() => {
    setSelectedPart(null);
    fetchExplanation(selectedOrgan);
  }, [selectedOrgan, fetchExplanation]);

  const handlePartSelect = (partName: string) => {
    setSelectedPart(partName);
    fetchExplanation(`${selectedOrgan} - ${partName}`);
  };

  const organThemes = {
    heart: { color: 'rose', active: 'bg-rose-600', hover: 'hover:bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    brain: { color: 'indigo', active: 'bg-indigo-600', hover: 'hover:bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    skeleton: { color: 'amber', active: 'bg-amber-500', hover: 'hover:bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    nervous: { color: 'cyan', active: 'bg-cyan-500', hover: 'hover:bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
  };

  const activeTheme = theme || { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-500' };
  const activeTask = TASKS.find(t => t.organ === selectedOrgan);

  const parseAISections = (text: string) => {
    if (!text) return null;
    const sections = text.split(/\n\d\.\s\*\*/g);
    return sections.map((s, i) => {
      const titleMatch = s.match(/^\*\*(.*?)\*\*/);
      const title = titleMatch ? titleMatch[1] : `Detail ${i + 1}`;
      const content = s.replace(/^\*\*.*?\*\*:?/, '').trim();
      return { title, content };
    });
  };

  const processedIntel = parseAISections(explanation);

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button onClick={onBackToDashboard} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:${activeTheme.text} transition-colors mb-2`}>
            <Home className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
             <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Anatomy Clinical Lab</h2>
             <div className={`px-4 py-1.5 rounded-full ${activeTheme.bg} text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg ${activeTheme.glow}`}>
                <Activity className="w-3 h-3 animate-pulse" /> Diagnostic Sync Active
             </div>
          </div>
        </div>

        <div className="flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-[1.5rem] border shadow-xl">
          {(['heart', 'brain', 'skeleton', 'nervous'] as const).map((organ) => (
            <button
              key={organ}
              onClick={() => setSelectedOrgan(organ)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedOrgan === organ 
                  ? `${organThemes[organ].active} text-white shadow-lg` 
                  : `text-slate-400 ${organThemes[organ].hover} dark:hover:bg-slate-700`
              }`}
            >
              {organ}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-0">
        <div className={`lg:col-span-3 bg-white dark:bg-slate-800 rounded-[3rem] border-4 transition-all duration-500 ${organThemes[selectedOrgan].border} shadow-2xl relative overflow-hidden flex flex-col`}>
          {/* Prominent Selection Overlay */}
          <div className="absolute top-8 left-8 z-10 flex flex-col gap-4">
            <div className="bg-slate-900/90 backdrop-blur-xl text-white px-6 py-4 rounded-[2rem] border border-white/20 flex items-center gap-4 shadow-2xl animate-in slide-in-from-left-4">
              <div className={`w-12 h-12 rounded-2xl ${organThemes[selectedOrgan].active} flex items-center justify-center shadow-lg`}>
                <Fingerprint className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Structure ID</span>
                <span className="text-lg font-black uppercase tracking-tighter leading-none">
                  {selectedPart || `${selectedOrgan} General`}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => { setSelectedPart(null); fetchExplanation(selectedOrgan); }} 
              className="bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-2xl border border-white/10 active:scale-95 flex items-center gap-2 hover:bg-white/20 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <RotateCw className="w-4 h-4" /> Reset View
            </button>
          </div>
          
          <div className="flex-1 w-full relative">
            <ThreeScene 
              model={selectedOrgan} 
              onSelectPart={handlePartSelect} 
              selectedPart={selectedPart} 
              loading={loadingExplanation} 
            />
          </div>

          {/* Interactive Scanning HUD */}
          <div className="absolute bottom-8 right-8 pointer-events-none">
             <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">Model Fidelity: 100%</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                   <Search className="w-3 h-3 text-blue-400" />
                   <span className="text-[10px] font-bold text-white uppercase tracking-widest">Raycasting Active</span>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
          <div className={`p-10 rounded-[3.5rem] border-4 shadow-2xl relative overflow-hidden transition-all duration-500 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700`}>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-[1.5rem] ${activeTheme.bg} text-white shadow-2xl ${activeTheme.glow}`}>
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-[0.2em]">Local Clinical Briefing</h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${activeTheme.text}`}>Workstation Intelligence Only</p>
                </div>
              </div>
            </div>

            <div className="mb-10 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 dark:border-slate-700 border-dashed relative group">
              <h4 className={`text-5xl font-black ${activeTheme.text} tracking-tighter uppercase mb-2 leading-none`}>
                {selectedPart || selectedOrgan}
              </h4>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeTheme.bg} animate-pulse`} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional ID Verified</p>
              </div>
            </div>

            <div className="space-y-8">
              {loadingExplanation ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <Loader2 className={`w-12 h-12 ${activeTheme.text} animate-spin`} />
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">Consulting Offline Registry...</p>
                </div>
              ) : processedIntel ? (
                <div className="space-y-10">
                  {processedIntel.map((sec, idx) => (
                    <section key={idx}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-1.5 h-6 ${activeTheme.bg} rounded-full shadow-lg`} />
                        <h5 className="font-black text-slate-800 dark:text-slate-100 text-[12px] uppercase tracking-[0.2em]">{sec.title}</h5>
                      </div>
                      <div className="p-7 bg-slate-50/50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">{sec.content}</p>
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <BookOpen className="w-16 h-16 text-slate-100 mb-6" />
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Select a part to begin offline analysis.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
