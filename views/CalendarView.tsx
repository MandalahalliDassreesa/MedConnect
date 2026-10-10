
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/db';
import { CalendarEvent } from '../types';
import { 
  Calendar as CalendarIcon, MapPin, Clock, ChevronRight, 
  Plus, Search, X, Trash2, Bell, CheckCircle2, 
  CalendarRange, Sparkles, LayoutGrid, List, ChevronLeft, CalendarDays, Globe, ShieldCheck, Loader2
} from 'lucide-react';

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Exams' | 'Holidays' | 'Programs'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [reminders, setReminders] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [deploying, setDeploying] = useState(false);
  const user = db.getCurrentUser();
  const isAdmin = user?.role === 'Admin';

  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Programs',
    status: 'Upcoming',
    location: '',
    isPublished: false
  });

  useEffect(() => {
    setEvents(db.getCalendarEvents());
    const savedReminders = JSON.parse(localStorage.getItem('mc_reminders') || '[]');
    setReminders(new Set(savedReminders));
  }, []);

  const toggleReminder = (id: string) => {
    const next = new Set(reminders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setReminders(next);
    localStorage.setItem('mc_reminders', JSON.stringify(Array.from(next)));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    db.addCalendarEvent(newEvent);
    setEvents(db.getCalendarEvents());
    setShowAddModal(false);
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      type: 'Programs',
      status: 'Upcoming',
      location: '',
      isPublished: false
    });
  };

  const handleDeployToAll = async () => {
    setDeploying(true);
    try {
      await db.deployCalendarToAll();
      setEvents(db.getCalendarEvents());
      alert("Academic timeline successfully deployed to all institutional nodes.");
    } catch (err) {
      alert("Deployment failed. Registry sync error.");
    } finally {
      setDeploying(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Permanently remove this academic event from the registry?')) {
      db.deleteCalendarEvent(id);
      setEvents(db.getCalendarEvents());
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Exams': return 'rose';
      case 'Programs': return 'indigo';
      case 'Holidays': return 'emerald';
      default: return 'blue';
    }
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => activeFilter === 'All' || e.type === activeFilter)
      .filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()) || (e.location?.toLowerCase().includes(searchTerm.toLowerCase())))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, activeFilter, searchTerm]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, date: null });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      days.push({ day: d, date: dateStr, events: dayEvents });
    }

    return days;
  }, [currentMonth, events]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const hasUnpublished = events.some(e => !e.isPublished);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Academic Timeline</h2>
          <p className="text-slate-500 font-medium mt-1">Official institutional schedule synced with the Registrar.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {isAdmin && hasUnpublished && (
            <button 
              onClick={handleDeployToAll}
              disabled={deploying}
              className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {deploying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
              Deploy to All Users
            </button>
          )}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border dark:border-slate-700">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] text-sm font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> Schedule Event
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search events, venues, or subjects..." 
            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl py-5 pl-16 pr-6 shadow-sm text-sm font-medium focus:ring-4 ring-blue-500/10 outline-none dark:text-white"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 w-full md:w-auto overflow-x-auto">
          {(['All', 'Exams', 'Programs', 'Holidays'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === f ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xl border dark:border-slate-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 border dark:border-slate-700 shadow-xl animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-blue-600" />
              {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl hover:bg-slate-200 transition-all">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button onClick={() => setCurrentMonth(new Date())} className="px-6 py-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all">
                Today
              </button>
              <button onClick={() => changeMonth(1)} className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl hover:bg-slate-200 transition-all">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-700 rounded-2xl overflow-hidden border dark:border-slate-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-slate-50 dark:bg-slate-900 p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                {d}
              </div>
            ))}
            {calendarDays.map((d, i) => (
              <div 
                key={i} 
                onClick={() => isAdmin && d.date && (setNewEvent(prev => ({ ...prev, date: d.date! })), setShowAddModal(true))}
                className={`min-h-[140px] bg-white dark:bg-slate-800 p-4 transition-all relative group cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-900/10 ${!d.day ? 'opacity-20 pointer-events-none' : ''}`}
              >
                <span className={`text-sm font-black ${d.date === new Date().toISOString().split('T')[0] ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/40 w-8 h-8 flex items-center justify-center rounded-full -ml-2 -mt-2' : 'text-slate-400'}`}>
                  {d.day}
                </span>
                
                <div className="mt-3 space-y-1">
                  {d.events?.map((e, idx) => (
                    <div 
                      key={idx} 
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight truncate border shadow-sm flex items-center gap-1 ${
                        e.type === 'Exams' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        e.type === 'Holidays' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}
                    >
                      {!e.isPublished && <div className="w-1 h-1 bg-amber-500 rounded-full" title="Draft" />}
                      {e.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.length === 0 ? (
            <div className="lg:col-span-3 py-20 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
              <CalendarRange className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No matching academic events found</p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const color = getTypeColor(event.type);
              const isReminded = reminders.has(event.id);
              return (
                <div 
                  key={event.id} 
                  className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-transparent hover:border-blue-400 shadow-xl hover:shadow-2xl transition-all duration-300 group relative flex flex-col"
                >
                  {!event.isPublished && (
                    <div className="absolute top-4 left-4 bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                      Draft (Local Only)
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-8 mt-2">
                    <div className={`p-4 bg-${color}-500 text-white rounded-[1.5rem] shadow-xl shadow-${color}-200/50`}>
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleReminder(event.id)}
                        className={`p-2 rounded-xl transition-all ${isReminded ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-amber-500'}`}
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-2 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-${color}-50 dark:bg-${color}-900/30 text-${color}-600`}>
                        {event.type}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                  </div>

                  <div className="space-y-4 pt-6 border-t dark:border-slate-700">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-10">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Schedule Event</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-rose-500 hover:text-white rounded-2xl transition-all group">
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                <input 
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-5 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 font-bold"
                  placeholder="e.g. Ophthalmology Clinical Exam"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-5 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 font-bold"
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                  <select 
                     className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-5 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 font-bold"
                     value={newEvent.type}
                     onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                  >
                    <option>Exams</option>
                    <option>Programs</option>
                    <option>Holidays</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Venue / Location</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-5 pl-12 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 font-bold"
                    placeholder="e.g. Examination Hall B"
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-4 h-4" /> Save Local Draft
                </button>
                <p className="text-[10px] text-slate-400 font-bold mt-4 text-center">Admin: After saving, use the 'Deploy to All' button to publish globally.</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
