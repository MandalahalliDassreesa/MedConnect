
import React, { useState, useEffect } from 'react';
import { SUBJECTS } from '../constants';
import { db } from '../services/db';
import { Subject, Topic, Chapter, UserProfile } from '../types';
import { 
  Search, ChevronRight, Book as BookIcon, Play, StickyNote, ArrowLeft, 
  Sparkles, Home, BookOpen, Video, FileText, Download, ExternalLink, 
  PlayCircle, CheckCircle, Heart, Brain, Microscope, Zap, FlaskConical, 
  Stethoscope, Pill, AlertCircle, Activity, Baby, Award, Layers, CheckSquare
} from 'lucide-react';
import NotesPad from '../components/NotesPad';
import QuizModal from '../components/QuizModal';

interface SubjectsViewProps {
  onBackToDashboard?: () => void;
}

const SubjectsView: React.FC<SubjectsViewProps> = ({ onBackToDashboard }) => {
  const [user, setUser] = useState<UserProfile | null>(db.getCurrentUser());
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState<'topics' | 'books' | 'videos'>('topics');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const refreshUser = () => setUser(db.getCurrentUser());

  const filteredSubjects = SUBJECTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubjectTheme = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cardio')) return { color: 'rose', icon: Heart };
    if (lower.includes('neuro')) return { color: 'indigo', icon: Brain };
    if (lower.includes('anat')) return { color: 'orange', icon: Microscope };
    if (lower.includes('physio')) return { color: 'emerald', icon: Zap };
    if (lower.includes('biochem')) return { color: 'amber', icon: FlaskConical };
    if (lower.includes('patho')) return { color: 'purple', icon: AlertCircle };
    if (lower.includes('pharma')) return { color: 'cyan', icon: Pill };
    if (lower.includes('surg')) return { color: 'red', icon: Stethoscope };
    if (lower.includes('ped')) return { color: 'sky', icon: Baby };
    return { color: 'blue', icon: BookIcon };
  };

  const getSubjectProgress = (sub: Subject) => {
    const totalChapters = sub.topics.reduce((acc, t) => acc + t.chapters.length, 0);
    const completed = sub.topics.reduce((acc, t) => {
      return acc + t.chapters.filter(c => user?.completedChapterIds?.includes(c.id)).length;
    }, 0);
    return totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0;
  };

  const handleQuizComplete = async (score: number) => {
    if (selectedChapter && selectedTopic) {
      await db.completeChapter(selectedChapter.id, selectedTopic.id, score);
      refreshUser();
      setShowQuiz(false);
      setSelectedChapter(null);
    }
  };

  if (selectedSubject) {
    const { color, icon: SubjectIcon } = getSubjectTheme(selectedSubject.name);
    return (
      <div className="space-y-6 animate-in zoom-in-95 duration-300 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0 px-2">
          <button onClick={() => { setSelectedSubject(null); setActiveTab('topics'); setSelectedTopic(null); setSelectedChapter(null); }} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Subject Registry
          </button>
          <button onClick={onBackToDashboard} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
            <Home className="w-4 h-4" /> Dashboard
          </button>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-[3.5rem] shadow-2xl border dark:border-slate-700 flex flex-col flex-1 min-h-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 bg-${color}-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-${color}-200/50`}>
                <SubjectIcon className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color}-500`}>{selectedSubject.code}</span>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Progress: {getSubjectProgress(selectedSubject)}%</span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{selectedSubject.name}</h2>
              </div>
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit shrink-0">
              <button onClick={() => setActiveTab('topics')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'topics' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-400'}`}>
                <FileText className="w-4 h-4" /> Curriculum
              </button>
              <button onClick={() => setActiveTab('books')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'books' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-400'}`}>
                <BookOpen className="w-4 h-4" /> Books
              </button>
              <button onClick={() => setActiveTab('videos')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'videos' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl' : 'text-slate-400'}`}>
                <Video className="w-4 h-4" /> Videos
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === 'topics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in duration-300">
                <div className="flex flex-col h-full min-h-0 space-y-6">
                  <div className="flex flex-col min-h-0 flex-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 mb-4 shrink-0">
                       Master Module Index
                       <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                      {selectedSubject.topics.map(topic => {
                        const isDone = user?.completedTopicIds?.includes(topic.id);
                        const progress = (topic.chapters.filter(c => user?.completedChapterIds?.includes(c.id)).length / topic.chapters.length) * 100;
                        return (
                          <div 
                            key={topic.id} 
                            onClick={() => { setSelectedTopic(topic); setSelectedChapter(null); }}
                            className={`p-5 rounded-[2rem] border-2 transition-all group cursor-pointer ${selectedTopic?.id === topic.id 
                              ? `bg-${color}-50/50 border-${color}-400 dark:bg-${color}-900/20` 
                              : 'bg-slate-50 border-transparent dark:bg-slate-900/40 hover:border-slate-200'}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-500 shadow-[0_0_8px_emerald]' : 'bg-slate-300'}`} />
                                <p className={`font-black text-sm uppercase tracking-tight ${selectedTopic?.id === topic.id ? `text-${color}-600 dark:text-${color}-400` : 'text-slate-600 dark:text-slate-400'}`}>
                                  {topic.title}
                                </p>
                              </div>
                              {isDone ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
                            </div>
                            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                               <div className={`h-full bg-${color}-500 transition-all duration-700`} style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedTopic && (
                    <div className="flex flex-col min-h-0 flex-1">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 mb-4 shrink-0">
                         {selectedTopic.title} Chapters
                         <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
                      </h3>
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                        {selectedTopic.chapters.map((chapter, idx) => {
                          const isDone = user?.completedChapterIds?.includes(chapter.id);
                          return (
                            <div 
                              key={chapter.id}
                              onClick={() => setSelectedChapter(chapter)}
                              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedChapter?.id === chapter.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-transparent bg-slate-100 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm'}`}
                            >
                               <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-black text-slate-400">0{idx+1}</span>
                                  <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-tight">{chapter.title}</p>
                               </div>
                               {isDone && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden relative">
                  {selectedChapter ? (
                    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                      <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar space-y-8">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center gap-2 mb-4">
                             <Layers className={`w-5 h-5 text-${color}-500`} />
                             <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${color}-500`}>Chapter Briefing</span>
                          </div>
                          <h4 className="text-4xl font-black text-slate-800 dark:text-white leading-tight mb-6 tracking-tight">{selectedChapter.title}</h4>
                          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-10">
                            {selectedChapter.description} This chapter covers high-yield medical concepts essential for clinical rotations and board examinations. Completion requires successful validation of the Randomized Competency Quiz.
                          </p>
                          
                          {user?.completedChapterIds?.includes(selectedChapter.id) && (
                            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-3xl flex items-center gap-4 mb-8">
                               <div className="bg-emerald-500 text-white p-2 rounded-xl">
                                  <Award className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-xs font-black text-emerald-600 uppercase">Chapter Mastered</p>
                                  <p className="text-[10px] text-emerald-500 font-bold">Quiz Performance: {user.quizScores?.[selectedChapter.id]}%</p>
                               </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-t dark:border-slate-700 flex flex-col sm:flex-row gap-4 shrink-0">
                        <button 
                          onClick={() => setShowQuiz(true)} 
                          className={`flex-1 py-5 bg-${color}-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-${color}-200/50 active:scale-95 transition-all`}
                        >
                          <Play className="w-4 h-4 fill-current" /> Take Chapter Quiz
                        </button>
                        <button 
                          onClick={() => setShowNotes(true)}
                          className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                        >
                          <StickyNote className="w-4 h-4" /> My Journal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm mb-6 border dark:border-slate-700">
                        <CheckSquare className="w-16 h-16 text-slate-200" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] max-w-[200px] leading-relaxed">Select a sub-topic chapter to begin deep validation</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'books' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 h-full overflow-y-auto pr-2 custom-scrollbar animate-in slide-in-from-bottom-4 duration-300 pb-10">
                {selectedSubject.books.map(book => (
                  <div key={book.id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 h-fit">
                    <div className="aspect-[2/3] relative overflow-hidden bg-slate-100">
                      <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="p-6">
                      <h4 className="font-black text-slate-800 dark:text-white mb-1 line-clamp-1">{book.title}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full overflow-y-auto pr-2 custom-scrollbar animate-in slide-in-from-bottom-4 duration-300 pb-10">
                {selectedSubject.videos.map(video => (
                  <div key={video.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all cursor-pointer group h-fit">
                    <div className="aspect-video relative overflow-hidden bg-slate-200">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="bg-white/95 backdrop-blur-md p-5 rounded-full shadow-2xl group-hover:scale-110 transition-transform shadow-white/20">
                          <PlayCircle className={`text-${color}-600 w-10 h-10`} />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="font-black text-slate-800 dark:text-white line-clamp-2 text-lg leading-snug">{video.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {showNotes && selectedTopic && (
          <NotesPad topicId={selectedTopic.id} topicTitle={selectedTopic.title} onClose={() => setShowNotes(false)} />
        )}
        {showQuiz && selectedChapter && (
          <QuizModal 
            topicTitle={selectedChapter.title} 
            questions={selectedChapter.quizPool} 
            onComplete={handleQuizComplete}
            onClose={() => setShowQuiz(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Syllabus Registry</h2>
          <p className="text-slate-500 font-medium mt-1">Track your institutional learning curve across all departments.</p>
        </div>
      </header>

      <div className="relative group max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Filter clinical departments or module codes..." 
          className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl py-5 pl-16 pr-6 shadow-sm text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none dark:text-white relative z-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredSubjects.map(sub => {
          const { color, icon: SubjectIcon } = getSubjectTheme(sub.name);
          const progress = getSubjectProgress(sub);
          return (
            <div 
              key={sub.id} 
              onClick={() => setSelectedSubject(sub)}
              className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] border-2 border-transparent hover:border-blue-400 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group flex flex-col relative overflow-hidden"
            >
              <div className={`absolute -bottom-10 -right-10 w-40 h-40 bg-${color}-500/5 blur-[60px] rounded-full pointer-events-none`} />

              <div className="flex justify-between items-start mb-12 relative z-10">
                <div className={`p-6 bg-${color}-500 text-white rounded-[1.8rem] shadow-2xl shadow-${color}-200/50 group-hover:scale-110 transition-transform duration-500`}>
                  <SubjectIcon className="w-9 h-9" />
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{sub.code}</div>
                   <div className="flex items-center gap-2 justify-end">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className={`text-[10px] font-black text-${color}-600 bg-${color}-50 dark:bg-${color}-900/30 px-3 py-1 rounded-lg uppercase tracking-widest`}>Sync Active</span>
                   </div>
                </div>
              </div>

              <div className="flex-1 relative z-10">
                <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                  {sub.name}
                </h3>
                
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
                  <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {sub.topics.length} Modules</span>
                  <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {sub.topics.length * 5} Chapters</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-400">
                    <span>Registry Completion</span>
                    <span className={`text-${color}-600`}>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-${color}-500 shadow-[0_0_10px_rgba(0,0,0,0.1)] transition-all duration-1000`} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t dark:border-slate-700 flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`} />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Path</span>
                 </div>
                 <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectsView;
