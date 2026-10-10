
import React, { useState, useEffect } from 'react';
import { SUBJECTS } from '../constants';
import { db } from '../services/db';
import { Book } from '../types';
import { Search, Book as BookIcon, PlayCircle, ExternalLink, Download, Plus, X, Save, FileText, Sparkles } from 'lucide-react';

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'books' | 'videos'>('books');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [globalBooks, setGlobalBooks] = useState<Book[]>([]);
  const user = db.getCurrentUser();
  const isAdmin = user?.role === 'Admin';

  const [newBook, setNewBook] = useState<Omit<Book, 'id'>>({
    title: '',
    author: '',
    cover: 'https://picsum.photos/seed/med/200/300',
    pdfUrl: ''
  });

  useEffect(() => {
    setGlobalBooks(db.getGlobalBooks());
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.pdfUrl) return;
    await db.addGlobalBook(newBook);
    setGlobalBooks(db.getGlobalBooks());
    setShowAddModal(false);
    setNewBook({ title: '', author: '', cover: 'https://picsum.photos/seed/med/200/300', pdfUrl: '' });
  };

  const allBooks = [...SUBJECTS.flatMap(s => s.books), ...globalBooks];
  const filteredBooks = allBooks.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredVideos = SUBJECTS.flatMap(s => s.videos).filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">Resource Library</h2>
          <p className="text-slate-500 font-medium">Access peer-reviewed text books and clinical lecture videos.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && activeTab === 'books' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-4 h-4" /> Add PDF Asset
            </button>
          )}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit border dark:border-slate-700">
            <button 
              onClick={() => setActiveTab('books')}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'books' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Textbooks
            </button>
            <button 
              onClick={() => setActiveTab('videos')}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'videos' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Lectures
            </button>
          </div>
        </div>
      </header>

      <div className="relative group max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder={`Filter institutional ${activeTab}...`}
          className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] py-4 pl-14 pr-6 focus:ring-4 ring-blue-500/5 focus:border-blue-500 outline-none transition-all shadow-sm dark:text-white font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'books' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {filteredBooks.map((book) => (
            <div key={book.id} className="group bg-white dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 relative">
              {book.isGlobal && (
                <div className="absolute top-4 left-4 z-10 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg">
                  Global Add
                </div>
              )}
              <div className="aspect-[2/3] relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                  <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  {book.pdfUrl && (
                    <a href={book.pdfUrl} target="_blank" rel="noreferrer" className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-center">
                      <ExternalLink className="w-4 h-4" /> Open Reader
                    </a>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-black text-slate-800 dark:text-white truncate mb-1 text-sm tracking-tight">{book.title}</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{book.author || 'Institutional Author'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] border dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all cursor-pointer group">
              <div className="aspect-video relative overflow-hidden bg-slate-200">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <div className="bg-white/95 backdrop-blur-md p-5 rounded-full shadow-2xl group-hover:scale-110 transition-transform shadow-white/20">
                    <PlayCircle className="text-blue-600 w-10 h-10" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/20">
                  {video.duration}
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-black text-slate-800 dark:text-white line-clamp-2 text-lg leading-snug tracking-tight">{video.title}</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">Verified Academic Stream</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-10">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Add PDF Asset</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-rose-500 hover:text-white rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddBook} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Title</label>
                <input 
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-5 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 transition-all font-bold"
                  placeholder="e.g. Robbins Basic Pathology"
                  value={newBook.title}
                  onChange={e => setNewBook({...newBook, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author / Publisher</label>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-5 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 transition-all font-bold"
                  placeholder="e.g. Elsevier Health"
                  value={newBook.author}
                  onChange={e => setNewBook({...newBook, author: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PDF Direct URL (Access for all users)</label>
                <div className="relative">
                  <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white p-5 pl-12 rounded-2xl border-none outline-none focus:ring-4 ring-blue-500/10 transition-all font-mono text-xs"
                    placeholder="https://institutional-cloud.edu/resources/book.pdf"
                    value={newBook.pdfUrl}
                    onChange={e => setNewBook({...newBook, pdfUrl: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <Sparkles className="w-4 h-4" /> Deploy to Institutional Library
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
