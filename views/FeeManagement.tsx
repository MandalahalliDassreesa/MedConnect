
import React from 'react';
import { db } from '../services/db';
import { CreditCard, History, CheckCircle, Clock, ArrowUpRight, ShieldCheck } from 'lucide-react';

const FeeManagement: React.FC = () => {
  const fees = db.getFees();
  const totalDue = fees.reduce((acc, f) => acc + (f.status === 'Pending' ? f.amount : 0), 0);
  const paidCount = fees.filter(f => f.status === 'Paid').length;
  const progress = (paidCount / fees.length) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Financial Ledger</h2>
        <p className="text-slate-500 font-medium mt-1">Institutional tuition and living expenses tracking (INR).</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border dark:border-slate-700 shadow-xl">
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                <History className="w-5 h-5" />
              </div>
              Transaction History
            </h3>
            
            <div className="space-y-4">
              {fees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border dark:border-slate-700 group hover:shadow-md transition-all">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${fee.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'} text-white shadow-lg`}>
                      {fee.status === 'Paid' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 dark:text-white">{fee.title}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fee.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black ${fee.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatCurrency(fee.amount)}
                    </p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {fee.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="bg-white/10 p-4 rounded-2xl w-fit mb-8">
                <CreditCard className="w-8 h-8" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-200 mb-2">Total Outstanding (INR)</p>
              <h3 className="text-4xl font-black mb-10 tracking-tighter">{formatCurrency(totalDue)}</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 text-indigo-300">
                    <span>Payment Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <button className="w-full py-5 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3">
                  Initiate UPI Payment <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border-2 border-emerald-100 dark:border-emerald-900/30 flex items-center gap-5">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tight">Razorpay Secure</p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-500/60 font-medium">Standard Indian Banking Encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeManagement;
