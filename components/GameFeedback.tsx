import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Award } from './GameIcons';
import confetti from 'canvas-confetti';

interface FeedbackProps {
    type: 'correct' | 'incorrect' | null;
}

export const AnswerFeedback: React.FC<FeedbackProps> = ({ type }) => {
    useEffect(() => {
        if (type === 'correct') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [type]);

    return (
        <AnimatePresence>
            {type && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 ${type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                        }`}
                >
                    {type === 'correct' ? <CheckCircle size={48} /> : <XCircle size={48} />}
                    <span className="text-2xl font-bold">
                        {type === 'correct' ? 'Excellent!' : 'Try Again'}
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

interface LevelUpProps {
    isOpen: boolean;
    level: number;
    onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpProps> = ({ isOpen, level, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FFD700', '#FFA500']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FFD700', '#FFA500']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-indigo-900 to-purple-800 p-1 rounded-3xl shadow-2xl max-w-sm w-full"
            >
                <div className="bg-slate-900 rounded-[22px] p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>

                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6 inline-block p-4 bg-yellow-400/20 rounded-full text-yellow-400 border border-yellow-400/50"
                    >
                        <Award size={64} />
                    </motion.div>

                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wide">Level Up!</h2>
                    <p className="text-indigo-200 mb-8">You reached Level <span className="text-yellow-400 font-bold text-xl">{level}</span></p>

                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-bold py-3 rounded-xl hover:brightness-110 transition-all active:scale-95"
                    >
                        Awesome!
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
