import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Clock, Award, CheckCircle } from './GameIcons';

interface LearningQuestWinProps {
    name: string;
    score: number;
    completionTime: number;
    onWaiting: () => void;
}

export const LearningQuestWin: React.FC<LearningQuestWinProps> = ({ name, score, completionTime, onWaiting }) => {
    const accuracyCount = Math.round(score / 10);
    const accuracyPercent = Math.round((accuracyCount / 8) * 100);

    const minutes = Math.floor(completionTime / 60);
    const seconds = completionTime % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    useEffect(() => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10 text-center p-8 md:p-10 border border-white/20"
            >
                <div className="text-7xl mb-6 filter drop-shadow-xl animate-bounce">🏆</div>

                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
                    CHALLENGE COMPLETED!
                </h2>

                <p className="text-slate-500 mb-8 font-medium">
                    Great job, <span className="text-emerald-600 font-bold">{name}</span>!
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex flex-col items-center">
                        <div className="bg-white p-2 rounded-lg text-emerald-600 mb-3 shadow-sm">
                            <CheckCircle size={20} />
                        </div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">ACCURACY</p>
                        <p className="text-2xl font-black text-slate-800">{accuracyPercent}%</p>
                        <p className="text-[11px] font-bold text-slate-400">({accuracyCount}/8)</p>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex flex-col items-center">
                        <div className="bg-white p-2 rounded-lg text-amber-600 mb-3 shadow-sm">
                            <Clock size={20} />
                        </div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">TIME</p>
                        <p className="text-2xl font-black text-slate-800">{timeStr}</p>
                    </div>
                </div>

                {accuracyPercent === 100 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-4 rounded-2xl flex items-center gap-3 text-left"
                    >
                        <div className="bg-white p-2 rounded-xl text-purple-600 shadow-sm">
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">BADGE EARNED</p>
                            <p className="text-sm font-bold text-slate-800 tracking-tight">AI Reading Pro</p>
                        </div>
                    </motion.div>
                )}

                <button
                    onClick={onWaiting}
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 active:scale-95 transition-all uppercase tracking-widest text-sm"
                >
                    WAITING FOR TEACHER REVIEW…
                </button>
            </motion.div>
        </div>
    );
};
