import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface LearningQuestWinProps {
    name: string;
    score: number;
    completionTime: number;
    onPlayAgain: () => void;
    onLeaderboard: () => void;
}

export const LearningQuestWin: React.FC<LearningQuestWinProps> = ({ name, score, completionTime, onPlayAgain, onLeaderboard }) => {

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/90 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 text-center p-6 md:p-8 border-4 border-yellow-400 mx-4 md:mx-0"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>

                <div className="text-6xl md:text-7xl mb-4 md:mb-6 filter drop-shadow-lg">🏆</div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-800 mb-2 uppercase tracking-wide">
                    CONGRATULATIONS!
                </h2>

                <p className="text-slate-600 mb-4 md:mb-6 font-medium text-base md:text-lg">
                    <span className="font-bold text-indigo-600">{name}</span> – YOU HAVE MASTERED NEW WAYS TO LEARN!
                </p>

                <div className="bg-indigo-50 rounded-xl p-3 md:p-4 mb-4 md:mb-6 border border-indigo-100 grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                        <p className="text-xs md:text-sm text-indigo-500 font-bold uppercase mb-1">SCORE</p>
                        <p className="text-3xl md:text-4xl font-black text-indigo-700">{score} <span className="text-base md:text-lg font-medium text-indigo-400">/ 80</span></p>
                    </div>
                    <div>
                        <p className="text-xs md:text-sm text-indigo-500 font-bold uppercase mb-1">TIME</p>
                        <p className="text-3xl md:text-4xl font-black text-indigo-700">{completionTime} <span className="text-base md:text-lg font-medium">s</span></p>
                    </div>
                </div>

                <div className="mb-6 md:mb-8">
                    <div className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold text-xs md:text-sm border border-yellow-200 shadow-sm">
                        🎓 DIGITAL LEARNING CHAMPION
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={onLeaderboard}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95 uppercase tracking-wide text-sm md:text-base"
                    >
                        LEADERBOARD
                    </button>
                    <button
                        onClick={onPlayAgain}
                        className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 md:py-3 rounded-xl border-2 border-slate-200 transition-all uppercase text-sm md:text-base"
                    >
                        PLAY AGAIN
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
