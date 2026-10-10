
import React from 'react';
import { db } from '../services/db';
import { Bell, Info, Megaphone, Calendar, User, ChevronRight } from 'lucide-react';

const NoticeBoard: React.FC = () => {
  const notices = db.getNotices();

  const getCategoryTheme = (cat: string) => {
    switch(cat) {
      case 'Urgent': return 'rose';
      case 'Event': return 'indigo';
      default: return 'blue';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Official Bulletin</h2>
        <p className="text-slate-500 font-medium mt-1">Verified campus announcements and faculty news.</p>
      </header>

      <div className="space-y-6 max-w-4xl mx-auto">
        {notices.map((notice) => {
          const color = getCategoryTheme(notice.category);
          return (
            <div key={notice.id} className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-l-[12px] dark:border-slate-700 transition-transform hover:-translate-x-1" style={{ borderLeftColor: `var(--tw-gradient-from, ${color === 'rose' ? '#f43f5e' : color === 'indigo' ? '#6366f1' : '#3b82f6'})` }}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-${color}-500 text-white rounded-2xl shadow-lg`}>
                    {notice.category === 'Urgent' ? <Megaphone className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest text-${color}-600 bg-${color}-50 dark:bg-${color}-900/30 px-3 py-1 rounded-full`}>
                      {notice.category} Notice
                    </span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mt-2 leading-tight">{notice.title}</h3>
                  </div>
                </div>
                <div className="text-right">
                   <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <Calendar className="w-3 h-3" /> {new Date(notice.date).toLocaleDateString()}
                   </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-8">
                {notice.content}
              </p>

              <div className="flex items-center justify-between pt-6 border-t dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issued by: {notice.author}</span>
                </div>
                <button className={`text-${color}-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all`}>
                  Download Document <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NoticeBoard;
