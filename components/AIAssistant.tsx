
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, ShieldCheck, WifiOff } from 'lucide-react';
import { queryLocalAI } from '../services/localAI';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string, isError?: boolean}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const localResponse = await queryLocalAI(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: localResponse || "No clinical data found locally." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Workstation error: Local knowledge base inaccessible.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-slate-800 w-80 h-[500px] rounded-[2.5rem] shadow-2xl border dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 p-5 text-white flex justify-between items-center shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500 shadow-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-xs uppercase tracking-widest block">Local Advisor</span>
                <div className="flex items-center gap-1">
                  <WifiOff className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Air-Gapped Mode</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30 dark:bg-slate-900/20 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm mb-4 border dark:border-slate-700">
                  <ShieldCheck className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                  MedConnect Advisor. Completely offline for maximum privacy. Ask me anything clinical.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] px-5 py-3.5 rounded-2xl text-[11px] shadow-sm font-medium leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-br-none' 
                    : m.isError 
                      ? 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 border border-rose-100 rounded-bl-none'
                      : 'bg-white dark:bg-slate-700 dark:text-slate-200 rounded-bl-none border dark:border-slate-600 shadow-md'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 px-5 py-3.5 rounded-2xl rounded-bl-none border dark:border-slate-600 flex items-center gap-3">
                  <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Consulting Local DB...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-5 bg-white dark:bg-slate-800 border-t dark:border-slate-700 flex gap-2 shrink-0">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Query offline database..."
              className="flex-1 text-xs bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white border-none rounded-xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-slate-500/10 transition-all font-medium"
            />
            <button onClick={handleSend} disabled={loading} className="bg-slate-900 hover:opacity-90 disabled:opacity-50 text-white p-3.5 rounded-xl shadow-xl transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-slate-900 hover:bg-black text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all group border border-white/10">
          <Sparkles className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
