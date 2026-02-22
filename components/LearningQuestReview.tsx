import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { QuestLeaderboardEntry } from '../types';
import { LEARNING_QUEST_POOL, LEARNING_QUEST_PASSAGE } from '../constants';
import {
    ChevronLeft,
    ChevronRight,
    XCircle,
    User,
    Clock,
    Trophy,
    CheckCircle,
    X,
    Info
} from './GameIcons';

interface LearningQuestReviewProps {
    onClose: () => void;
}

export const LearningQuestReview: React.FC<LearningQuestReviewProps> = ({ onClose }) => {
    const [entries, setEntries] = useState<QuestLeaderboardEntry[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<QuestLeaderboardEntry | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'leaderboard'), orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data() as QuestLeaderboardEntry);
            setEntries(data);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleNext = () => {
        if (currentQuestionIndex < LEARNING_QUEST_POOL.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const currentQuestion = LEARNING_QUEST_POOL[currentQuestionIndex];
    const studentAnswer = selectedEntry?.selectedAnswers?.[currentQuestion.id];

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col h-screen overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-4 shrink-0 shadow-sm z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <XCircle size={24} className="text-slate-400" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Review Student Work</h2>
                            <p className="text-xs text-slate-500 font-medium">Teacher Dashboard • Analytics</p>
                        </div>
                    </div>

                    <div className="flex flex-1 max-w-md gap-2">
                        <div className="relative flex-1">
                            <select
                                onChange={(e) => {
                                    const entry = entries.find(ent => `${ent.name}-${ent.date}` === e.target.value);
                                    setSelectedEntry(entry || null);
                                    setCurrentQuestionIndex(0);
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                            >
                                <option value="">Select a Student...</option>
                                {entries.map((entry, idx) => (
                                    <option key={idx} value={`${entry.name}-${entry.date}`}>
                                        {entry.name} ({entry.className}) — {entry.score}/80 — {Math.floor(entry.time / 60)}m {entry.time % 60}s
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronRight size={16} className="rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-slate-100 gap-4 md:gap-5 p-4 md:p-6 lg:p-8">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : !selectedEntry ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="bg-emerald-50 p-6 rounded-full text-emerald-500 mb-4">
                            <User size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No Student Selected</h3>
                        <p className="text-slate-500">Pick a student from the dropdown to review their answers.</p>
                    </div>
                ) : (
                    <>
                        {/* Left: Reading Passage */}
                        <div className="flex-1 bg-white rounded-2xl md:rounded-3xl border border-slate-200 overflow-hidden flex flex-col shadow-sm max-h-[40vh] md:max-h-full">
                            <div className="p-4 border-b border-slate-100 bg-white sticky top-0 shrink-0">
                                <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600">Reading Context</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 md:p-8 prose prose-emerald max-w-none custom-scrollbar-thin">
                                {LEARNING_QUEST_PASSAGE.split('\n').map((paragraph, idx) => {
                                    if (paragraph.startsWith('# ')) return <h1 key={idx} className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{paragraph.replace('# ', '')}</h1>;
                                    if (paragraph.startsWith('**')) return <h3 key={idx} className="text-sm md:text-base font-bold text-emerald-700 mt-4 mb-2">{paragraph.replaceAll('**', '')}</h3>;
                                    return <p key={idx} className="mb-3 text-slate-600 text-sm md:text-base leading-relaxed">{paragraph}</p>;
                                })}
                            </div>
                        </div>

                        {/* Right: Review UI */}
                        <div className="flex-1 flex flex-col bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
                            {/* Student Header */}
                            <div className="bg-emerald-600 p-4 text-white shrink-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/20 p-1.5 rounded-lg"><User size={16} /></div>
                                        <span className="font-bold text-sm">{selectedEntry.name}</span>
                                    </div>
                                    <div className="flex gap-4 text-xs font-bold text-emerald-100">
                                        <div className="flex items-center gap-1"><Trophy size={14} /> {selectedEntry.score}/80</div>
                                        <div className="flex items-center gap-1"><Clock size={14} /> {Math.floor(selectedEntry.time / 60)}m {selectedEntry.time % 60}s</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-black/10 px-3 py-2 rounded-xl text-xs font-bold border border-white/10 uppercase tracking-widest">
                                    Question {currentQuestionIndex + 1} of 8
                                    <div className="flex gap-2">
                                        <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="p-1 hover:bg-white/20 rounded disabled:opacity-30">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button onClick={handleNext} disabled={currentQuestionIndex === LEARNING_QUEST_POOL.length - 1} className="p-1 hover:bg-white/20 rounded disabled:opacity-30">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar-thin">
                                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6">{currentQuestion.question}</h3>

                                <div className="space-y-3">
                                    {currentQuestion.options.map((opt) => {
                                        const isCorrect = opt.id === currentQuestion.correctAnswerId;
                                        const isStudentPick = studentAnswer === opt.id;

                                        let borderColor = "border-slate-100";
                                        let bgColor = "bg-slate-50";

                                        if (isCorrect) {
                                            borderColor = "border-emerald-500";
                                            bgColor = "bg-emerald-50";
                                        } else if (isStudentPick && !isCorrect) {
                                            borderColor = "border-red-500";
                                            bgColor = "bg-red-50";
                                        }

                                        return (
                                            <div key={opt.id} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${borderColor} ${bgColor}`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 
                                                    ${isCorrect ? 'bg-emerald-500 text-white' : isStudentPick ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    {opt.id}
                                                </div>
                                                <span className={`text-sm md:text-base font-medium flex-1 ${isCorrect ? 'text-emerald-900' : isStudentPick ? 'text-red-900' : 'text-slate-600'}`}>
                                                    {opt.text}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {isStudentPick && (
                                                        <span className="bg-slate-900/5 px-2 py-0.5 rounded-md text-[9px] font-black tracking-tighter text-slate-400 uppercase">Student</span>
                                                    )}
                                                    {isCorrect && (
                                                        <div className="bg-emerald-500 text-white p-1 rounded-full"><CheckCircle size={14} /></div>
                                                    )}
                                                    {isStudentPick && !isCorrect && (
                                                        <div className="bg-red-500 text-white p-1 rounded-full"><X size={14} /></div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {!studentAnswer && (
                                    <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                                        <Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
                                        <p className="text-xs text-amber-700 font-medium">No answer data available for this question. This might be from an older session or was skipped.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-thin::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}} />
        </div>
    );
};
