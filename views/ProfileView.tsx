
import React, { useState } from 'react';
import { db } from '../services/db';
import { User, Mail, GraduationCap, Phone, Heart, Award, Edit3, Save, ShieldCheck, Target } from 'lucide-react';
import { UserProfile } from '../types';

const ProfileView: React.FC = () => {
  // Fix: Use getCurrentUser() instead of non-existent getProfile() and provide explicit typing
  const [profile, setProfile] = useState<UserProfile | null>(db.getCurrentUser());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Fix: Added check to ensure profile is not null before updating
    if (profile) {
      db.updateProfile(profile);
    }
    setIsEditing(false);
  };

  // Fix: Added fallback UI to handle potential null state of profile
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
          <User className="w-12 h-12 text-slate-300" />
        </div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Profile database session expired</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-300">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Identity & Credentials</h2>
          <p className="text-slate-500 font-medium mt-1">Verified Institutional Academic Profile.</p>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all ${isEditing ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}
        >
          {isEditing ? <><Save className="w-4 h-4" /> Save Profile</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
        </button>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-slate-800 rounded-[3.5rem] shadow-2xl overflow-hidden border dark:border-slate-700">
          <div className="h-40 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 relative">
             <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Verified Student
             </div>
          </div>
          
          <div className="px-12 pb-12 relative">
            <div className="flex flex-col md:flex-row gap-8 items-start -mt-20">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[3rem] border-8 border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-slate-200">
                  <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <div className="mt-20 md:mt-24 space-y-2">
                <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{profile.name}</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{profile.year} • Clinical Intern</span>
                  <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">GPA: 3.82</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Academic Roots</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                    <GraduationCap className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{profile.college}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                    <Mail className="w-5 h-5 text-indigo-500" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                      {isEditing ? (
                        <input className="bg-transparent border-b border-indigo-200 text-sm font-bold w-full focus:outline-none" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                      ) : (
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{profile.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Emergency Core</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <div>
                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Blood Group</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{profile.bloodGroup}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl">
                    <Phone className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Emergency Contact</p>
                      {isEditing ? (
                        <input className="bg-transparent border-b border-amber-200 text-sm font-bold w-full focus:outline-none" value={profile.emergencyContact} onChange={e => setProfile({...profile, emergencyContact: e.target.value})} />
                      ) : (
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{profile.emergencyContact}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border dark:border-slate-700 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Citations</h5>
              <p className="text-2xl font-black text-slate-800 dark:text-white">12</p>
           </div>
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border dark:border-slate-700 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Rotations</h5>
              <p className="text-2xl font-black text-slate-800 dark:text-white">08</p>
           </div>
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border dark:border-slate-700 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Task Score</h5>
              <p className="text-2xl font-black text-slate-800 dark:text-white">942</p>
           </div>
        </div>
      </div>
    </div>
  );
};

// Fix: Renamed local helper to avoid confusion and used string for strokeWidth
const CheckCircleIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
  </svg>
);

export default ProfileView;
