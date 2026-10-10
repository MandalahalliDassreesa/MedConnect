
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Inquiry, UserProfile, Subject } from '../types';
import { 
  HelpCircle, Send, MessageSquare, CheckCircle2, Clock, 
  ChevronRight, ArrowLeft, Home, Sparkles, User, BookOpen,
  MessageCircle, Reply, RefreshCw
} from 'lucide-react';

interface InquiryViewProps {
  onBackToDashboard?: () => void;
}

const InquiryView: React.FC<InquiryViewProps> = ({ onBackToDashboard }) => {
  const [user, setUser] = useState<UserProfile | null>(db.getCurrentUser());
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(db.getSubjects());
  const [question, setQuestion] = useState('');
  const [selectedSub, setSelectedSub] = useState(subjects[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const isAdmin = user?.role === 'Admin';

  const fetchInquiries = async (forceCloud = false) => {
    if (forceCloud) setSyncing(true);
    if (forceCloud) await db.pullFromCloud();
    
    const all = db.getInquiries();
    if (isAdmin) {
      setInquiries(all);
    } else {
      setInquiries(all.filter(i => i.studentId === user?.id));
    }
    setSyncing(false);
  };

  useEffect(() => {
    fetchInquiries(true); // Pull from cloud on mount
    // Poll for answers and new questions from other devices every 10 seconds
    const interval = setInterval(() => fetchInquiries(true), 10000);
    return () => clearInterval(interval);
  }, [user, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    await db.addInquiry(question, selectedSub);
    setQuestion('');
    await fetchInquiries(true); // Pull again to ensure sync
    setLoading(false);
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setLoading(true);
    await db.answerInquiry(id, replyText);
    setReplyText('');
    setReplyId(null);
    await fetchInquiries(true);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button onClick={onBackToDashboard} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-2">
            <Home className="w-4 h-4" /> Back to Dashboard
          </button>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Academic Help Desk</h2>
          <p className="text-slate-500 font-medium mt-1">
            {isAdmin ? 'Address student clinical and academic doubts globally.' : 'Direct line to institutional faculty and subject experts.'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-4 rounded-[1.5rem] border shadow-xl">
           <div className={`p-2 rounded-lg ${syncing ? 'animate-spin' : ''}`}>
              <RefreshCw className={`w-6 h-6 ${syncing ? 'text-amber-500' : 'text-blue-600'}`} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cloud Registry</p>
              <p className="text-sm font-black text-slate-800 dark:text-white">{syncing ? 'Syncing...' : 'Connected'}</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inquiry Form (Only for Students) */}
        {!isAdmin && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-xl sticky top-28">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Ask an Expert</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                  <select 
                    value={selectedSub}
                    onChange={e => setSelectedSub(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-5 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 transition-all font-bold"
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Question</label>
                  <textarea 
                    required
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="Describe your clinical doubt in detail..."
                    className="w-full h-40 bg-slate-50 dark:bg-slate-900 dark:text-white p-5 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 transition-all font-medium resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Broadcast Inquiry
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Inquiry List */}
        <div className={`${isAdmin ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border dark:border-slate-700 shadow-sm min-h-[600px]">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" /> Communication History
                </h3>
                <button 
                  onClick={() => fetchInquiries(true)}
                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl"
                >
                   <div className={`w-3 h-3 rounded-full bg-blue-500 ${syncing ? 'animate-pulse' : ''}`} />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{syncing ? 'Refreshing Global' : 'Live Sync Active'}</span>
                </button>
             </div>

             <div className="space-y-6">
                {inquiries.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <Sparkles className="w-16 h-16 text-slate-100 mb-6" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">No academic inquiries logged yet.</p>
                  </div>
                ) : (
                  inquiries.map(inq => {
                    const subName = subjects.find(s => s.id === inq.subjectId)?.name || 'General';
                    return (
                      <div 
                        key={inq.id} 
                        className={`p-8 rounded-[2.5rem] border-2 transition-all ${inq.status === 'Resolved' ? 'bg-emerald-50/20 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-slate-50 border-transparent dark:bg-slate-900/40'}`}
                      >
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-2xl shadow-md ${inq.status === 'Resolved' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-blue-500 border dark:border-slate-700'}`}>
                                 <BookOpen className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{subName} • {new Date(inq.createdAt).toLocaleDateString()}</p>
                                 <h4 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">{inq.question}</h4>
                                 {isAdmin && <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">From: {inq.studentName}</p>}
                              </div>
                           </div>
                           <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${inq.status === 'Resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                              {inq.status === 'Resolved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {inq.status}
                           </div>
                        </div>

                        {inq.answer ? (
                          <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-emerald-500/10 shadow-sm animate-in fade-in duration-500">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500 rounded-lg text-white">
                                   <Sparkles className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Institutional Faculty Response</span>
                             </div>
                             <p className="text-sm text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed">
                                "{inq.answer}"
                             </p>
                             <p className="text-[8px] font-black text-slate-400 uppercase mt-4 text-right">Resolved at: {new Date(inq.answeredAt!).toLocaleString()}</p>
                          </div>
                        ) : isAdmin ? (
                          <div className="mt-4">
                            {replyId === inq.id ? (
                              <div className="space-y-4 animate-in slide-in-from-top-2">
                                <textarea 
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  placeholder="Type institutional response..."
                                  className="w-full bg-white dark:bg-slate-800 p-5 rounded-2xl border-2 border-blue-500/20 outline-none dark:text-white text-sm"
                                />
                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => handleReply(inq.id)}
                                    disabled={loading}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"
                                  >
                                    Submit Answer
                                  </button>
                                  <button onClick={() => setReplyId(null)} className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setReplyId(inq.id)}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all"
                              >
                                <Reply className="w-4 h-4" /> Reply as Admin
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-slate-400 bg-slate-100/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-transparent">
                             <Clock className="w-4 h-4 animate-spin" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Professional Peer Review</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryView;
