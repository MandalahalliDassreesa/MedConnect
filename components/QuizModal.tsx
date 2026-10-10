
import React, { useState, useMemo } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle, XCircle, ChevronRight, Sparkles, Award, Brain } from 'lucide-react';

interface QuizModalProps {
  topicTitle: string;
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ topicTitle, questions, onComplete, onClose }) => {
  const randomizedQuestions = useMemo(() => [...questions].sort(() => Math.random() - 0.5), [questions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQ = randomizedQuestions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQ.correctAnswer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < randomizedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const finalScore = Math.round((score / randomizedQuestions.length) * 100);
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
        <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[3rem] p-10 text-center shadow-2xl border dark:border-slate-700 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2">Module Mastered!</h3>
          <p className="text-slate-500 font-medium mb-8">Competency Audit Result for {topicTitle}</p>
          
          <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl mb-10 border dark:border-slate-700">
            <p className="text-5xl font-black text-emerald-500 mb-2">{finalScore}%</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Score</p>
          </div>

          <button 
            onClick={() => onComplete(finalScore)}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            Update Study Records
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl border dark:border-slate-700 overflow-hidden flex flex-col animate-in slide-in-from-bottom-6 duration-500">
        <div className="p-8 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Randomized Competency Test</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white truncate max-w-xs">{topicTitle}</h3>
          </div>
          <div className="bg-white dark:bg-slate-800 px-5 py-2 rounded-2xl border dark:border-slate-700">
            <span className="text-xs font-black text-blue-600">{currentIndex + 1} / {randomizedQuestions.length}</span>
          </div>
        </div>

        <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
          <p className="text-xl font-bold text-slate-800 dark:text-white mb-8 leading-relaxed">
            {currentQ.question}
          </p>

          <div className="space-y-3">
            {currentQ.options.map((opt, i) => {
              const isCorrect = i === currentQ.correctAnswer;
              const isSelected = i === selectedOption;
              let style = "bg-slate-50 dark:bg-slate-900 border-transparent text-slate-700 dark:text-slate-300";
              
              if (isAnswered) {
                if (isCorrect) style = "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                else if (isSelected) style = "bg-rose-50 dark:bg-rose-900/30 border-rose-500 text-rose-700 dark:text-rose-400";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={isAnswered}
                  className={`w-full p-5 rounded-2xl border-2 text-left font-bold text-sm transition-all flex items-center justify-between group ${style} ${!isAnswered && 'hover:border-blue-400'}`}
                >
                  {opt}
                  {isAnswered && isCorrect && <CheckCircle className="w-5 h-5" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 animate-in fade-in duration-300">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Clinical Rationale</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">{currentQ.explanation}</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-700 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-500 transition-colors">Discard Test</button>
          <button 
            onClick={handleNext}
            disabled={!isAnswered}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-30 shadow-xl"
          >
            {currentIndex === randomizedQuestions.length - 1 ? 'Finalize Result' : 'Next Question'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
