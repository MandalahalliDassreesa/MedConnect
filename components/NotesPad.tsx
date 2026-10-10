
import React, { useState, useEffect } from 'react';
import { Edit3, Save, X } from 'lucide-react';

interface NotesPadProps {
  topicId: string;
  topicTitle: string;
  onClose: () => void;
}

const NotesPad: React.FC<NotesPadProps> = ({ topicId, topicTitle, onClose }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`note_${topicId}`);
    if (saved) setNote(saved);
  }, [topicId]);

  const saveNote = () => {
    localStorage.setItem(`note_${topicId}`, note);
    alert('Note saved locally.');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl shadow-2xl border dark:border-slate-700 animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notes: {topicTitle}</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-4">
          <textarea 
            className="w-full h-64 bg-slate-50 dark:bg-slate-900 dark:text-white p-4 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
            placeholder="Start typing your notes here..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
          <button onClick={saveNote} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesPad;
