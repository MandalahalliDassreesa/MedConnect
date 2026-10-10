
import React from 'react';
import { db } from '../services/db';
import { Home, Users, Utensils, AlertTriangle, Send, ChevronRight } from 'lucide-react';

const HostelView: React.FC = () => {
  const hostel = db.getHostel();
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Residential Life</h2>
        <p className="text-slate-500 font-medium mt-1">Managing {hostel.block} Accommodations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[3rem] text-white shadow-2xl">
            <div className="bg-white/20 p-4 rounded-2xl w-fit mb-6">
              <Home className="w-8 h-8" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-100 mb-1">Assigned Unit</p>
            <h3 className="text-4xl font-black mb-6">Room {hostel.roomNumber}</h3>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Roommates</p>
              {hostel.roommates.map((name, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    {name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-bold">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border dark:border-slate-700 shadow-xl">
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Grievance Desk
            </h3>
            <textarea 
              placeholder="Report maintenance issues (Plumbing, Electrical, WiFi)..."
              className="w-full h-32 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-xs font-medium outline-none focus:ring-4 focus:ring-amber-500/10 mb-4 dark:text-white"
            />
            <button className="w-full py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-100 dark:shadow-none hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
              <Send className="w-3 h-3" /> Submit Report
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border dark:border-slate-700 shadow-xl h-full">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-4">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
                  <Utensils className="w-6 h-6" />
                </div>
                Mess Nutrition Plan
              </h3>
              <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                Week 12 • Standard Veg/Non-Veg
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Fix: Explicitly cast messMenu entries to resolve compilation error when map is called on items */}
              {(Object.entries(hostel.messMenu) as [string, string[]][]).map(([day, items]) => (
                <div key={day} className={`p-6 rounded-[2rem] border-2 transition-all ${day === today ? 'bg-emerald-50/50 border-emerald-400 dark:bg-emerald-900/10' : 'bg-slate-50 border-transparent dark:bg-slate-900/40'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{day}</h4>
                    {day === today && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Today</span>}
                  </div>
                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-400 font-bold flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostelView;
