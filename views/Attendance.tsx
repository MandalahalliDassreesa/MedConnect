
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { TASKS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, TrendingUp, Calendar, ArrowUpRight, Sparkles, Brain, Target, AlertTriangle, Loader2 } from 'lucide-react';
import { getLocalPersonalizedFeedback } from '../services/localAI';
import { AIFeedback, TaskPerformance } from '../types';

const Attendance: React.FC = () => {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [perfData, setPerfData] = useState<TaskPerformance[]>([]);

  const analyzeProgress = async () => {
    setLoading(true);
    const currentPerf = db.getPerformance();
    setPerfData(currentPerf);
    // 100% Offline Audit
    const result = await getLocalPersonalizedFeedback(currentPerf, TASKS);
    setFeedback(result);
    setLoading(false);
  };

  useEffect(() => {
    analyzeProgress();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Learning Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400">Offline Institutional Insights</p>
        </div>
        <button 
          onClick={analyzeProgress}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Run Diagnostic
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border dark:border-slate-700 shadow-sm relative overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Target className="text-blue-600 dark:text-blue-400 w-5 h-5" />
              Institutional Competency Audit
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Syncing Local Registry...</p>
              </div>
            ) : feedback ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    Gap Analysis
                  </div>
                  <ul className="space-y-3">
                    {feedback.weakSpots.map((spot, i) => (
                      <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        {spot}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    Recommended Modules
                  </div>
                  <ul className="space-y-3">
                    {feedback.focusTopics.map((topic, i) => (
                      <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border dark:border-slate-700 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-6">Subject Attendance Health</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={db.getSubjects()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Bar dataKey="attendance" radius={[6, 6, 0, 0]} barSize={32}>
                    {db.getSubjects().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.attendance > 85 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <Award className="w-12 h-12 text-blue-400 mb-6" />
            <h3 className="text-xl font-bold mb-2">Academic Profile</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Institutional percentile computed entirely within the secure workstation sandbox.
            </p>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-center flex-1">
                <p className="text-2xl font-black text-blue-400">{perfData.length}</p>
                <p className="text-[10px] uppercase font-bold text-slate-500">Tasks Run</p>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="text-center flex-1">
                <p className="text-2xl font-black text-emerald-400">92%</p>
                <p className="text-[10px] uppercase font-bold text-slate-500">Sync Rank</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
