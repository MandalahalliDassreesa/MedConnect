
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { TASKS } from '../constants';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Award, TrendingUp, Sparkles, Brain, Target, AlertTriangle, Loader2, CheckCircle, Zap, Home } from 'lucide-react';
import { getLocalPersonalizedFeedback } from '../services/localAI'; // Replaced Gemini
import { AIFeedback, TaskPerformance } from '../types';

interface PerformanceViewProps {
  onBackToDashboard?: () => void;
}

const PerformanceView: React.FC<PerformanceViewProps> = ({ onBackToDashboard }) => {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [perfData, setPerfData] = useState<TaskPerformance[]>([]);

  const analyzeProgress = useCallback(async () => {
    setLoading(true);
    try {
      const currentPerf = db.getPerformance();
      setPerfData(currentPerf);
      // Completely Offline Audit
      const result = await getLocalPersonalizedFeedback(currentPerf, TASKS);
      setFeedback(result);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    analyzeProgress();
  }, [analyzeProgress]);

  const radarData = [
    { subject: 'Anatomy', A: 85, fullMark: 100 },
    { subject: 'Physiology', A: 70, fullMark: 100 },
    { subject: 'Surgery', A: 95, fullMark: 100 },
    { subject: 'Cardio', A: 60, fullMark: 100 },
    { subject: 'Neuro', A: 80, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col">
          <button onClick={onBackToDashboard} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors mb-4">
            <Home className="w-4 h-4" /> Back to Dashboard
          </button>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Clinical Competency Audit</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Air-Gapped institutional analysis of your medical footprint.</p>
        </div>
        <button 
          onClick={analyzeProgress}
          className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 group"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          Refresh Local Audit
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-xl flex flex-col items-center">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-10 w-full text-center">Global Skill Radar</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <Radar name="Student" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[3.5rem] border dark:border-slate-700 shadow-xl relative overflow-hidden flex flex-col">
          <div className="p-10 flex-1">
            <div className="flex items-center gap-4 mb-10">
               <div className="bg-indigo-500 text-white p-3 rounded-2xl shadow-lg">
                  <Brain className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Local AI Insight</h3>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">NEXT-Phase Institutional Standard</p>
               </div>
            </div>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4">
                 <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Running Workstation Diagnostic...</p>
              </div>
            ) : feedback ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                <div className="space-y-8">
                  <section>
                    <h4 className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-4">
                      <CheckCircle className="w-4 h-4" /> Mastered Domains
                    </h4>
                    <ul className="space-y-2">
                      {feedback.masteredAreas?.map((area, i) => (
                        <li key={i} className="flex items-center gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                          <Zap className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-slate-700 dark:text-emerald-300">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
                <div className="space-y-8">
                  <section>
                    <h4 className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.2em] mb-4">
                      <Target className="w-4 h-4" /> Prescribed Action Plan
                    </h4>
                    <div className="space-y-3">
                      {feedback.actionPlan?.map((step, i) => (
                        <div key={i} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border border-transparent hover:border-indigo-200">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{step}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceView;
