import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SaveTheOceanIntroProps {
    onStart: (name: string, className: string) => void;
    onClose: () => void;
}

export const SaveTheOceanIntro: React.FC<SaveTheOceanIntroProps> = ({ onStart, onClose }) => {
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
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-md">
            {/* Ocean Background Overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/80 via-cyan-800/80 to-teal-900/80 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-white/50"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <div className="p-8 flex flex-col items-center text-center">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-2 uppercase tracking-wide">
                        NEW WAYS TO LEARN
                    </h2>
                    <h3 className="text-xl font-bold text-slate-600 mb-6 uppercase tracking-wide">
                        Save The Ocean Adventure
                    </h3>

                    <p className="text-slate-500 mb-8">Enter your details to start the mission!</p>

                    <div className="w-full space-y-4 text-left">
                        <div>
                            <label htmlFor="playerName" className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Full Name</label>
                            <input
                                id="playerName"
                                type="text"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(''); }}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
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
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}

                        <button
                            onClick={handleStart}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform active:scale-95 transition-all mt-4 text-lg tracking-wide uppercase"
                        >
                            START
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
