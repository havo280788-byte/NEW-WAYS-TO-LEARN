import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-md">
            {/* Blue-Purple Gradient Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 opacity-95" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-white/20 mx-4 md:mx-0 max-h-[90vh] flex flex-col"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 md:top-4 md:right-4 text-slate-400 hover:text-slate-600 z-10 p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <div className="p-6 md:p-8 flex flex-col items-center text-center overflow-y-auto">
                    <h2 className="text-xs md:text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">
                        NEW WAYS TO LEARN
                    </h2>
                    <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-4 md:mb-6 uppercase tracking-wide leading-tight">
                        LEARNING EVOLUTION QUEST
                    </h3>

                    <p className="text-slate-500 mb-6 md:mb-8 text-sm md:text-base">Enter your details to start the quest!</p>

                    <div className="w-full space-y-4 text-left">
                        <div>
                            <label htmlFor="playerName" className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Full Name</label>
                            <input
                                id="playerName"
                                type="text"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(''); }}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm md:text-base"
                            />
                        </div>

                        <div>
                            <label htmlFor="playerClass" className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Class</label>
                            <input
                                id="playerClass"
                                type="text"
                                value={className}
                                onChange={(e) => { setClassName(e.target.value); setError(''); }}
                                placeholder="Enter your class"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm md:text-base"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}

                        <button
                            onClick={handleStart}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform active:scale-95 transition-all mt-4 text-base md:text-lg tracking-wide uppercase"
                        >
                            START
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
