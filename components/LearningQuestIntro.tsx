import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, ChevronRight, Lock } from './GameIcons';

interface LearningQuestIntroProps {
    onStart: (name: string, className: string) => void;
    onClose: () => void;
}

export const LearningQuestIntro: React.FC<LearningQuestIntroProps> = ({ onStart, onClose }) => {
    const [name, setName] = useState('');
    const [className, setClassName] = useState('');
    const [error, setError] = useState('');

    const handleStart = () => {
        if (!name.trim() || !className.trim()) {
            setError('Please fill in all fields');
            return;
        }
        onStart(name, className);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            {/* Background Gradient */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 opacity-90" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-white/20 mx-4 md:mx-0 flex flex-col"
            >
                {/* Header Section */}
                <div className="relative pt-10 pb-6 px-8 text-center flex flex-col items-center">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <div className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">
                        Reading Challenge
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-1">
                        ENGLISH 10
                    </h1>
                    <h2 className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                        NEW WAYS TO LEARN
                    </h2>

                    <p className="text-slate-400 text-sm font-medium max-w-[240px]">
                        Ready to explore new ways of learning English?
                    </p>
                </div>

                {/* Form Section */}
                <div className="px-8 pb-10 space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(''); }}
                                    placeholder="Enter your name"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-sm font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors">
                                    <BookOpen size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={className}
                                    onChange={(e) => { setClassName(e.target.value); setError(''); }}
                                    placeholder="e.g. 10A1"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-50 outline-none transition-all text-sm font-bold text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-[11px] text-center font-bold bg-red-50 py-2 rounded-xl border border-red-100"
                        >
                            {error}
                        </motion.p>
                    )}

                    <div className="space-y-4 pt-2">
                        <button
                            onClick={handleStart}
                            className="group w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] hover:brightness-110 transform active:scale-95 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-3"
                        >
                            START CHALLENGE
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
