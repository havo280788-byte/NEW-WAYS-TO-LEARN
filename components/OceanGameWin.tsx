import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import useSound from 'use-sound';
import { SOUNDS } from '../constants';

interface OceanGameWinProps {
    name: string;
    completionTime: number; // in seconds
    onPlayAgain: () => void;
    onLeaderboard: () => void;
}

export const OceanGameWin: React.FC<OceanGameWinProps> = ({ name, completionTime, onPlayAgain, onLeaderboard }) => {
    const [playLevelUp] = useSound(SOUNDS.levelUp);

    useEffect(() => {
        playLevelUp();
    }, [playLevelUp]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/90 backdrop-blur-md">
            {/* Simple Fireworks Effect Overlay (CSS or basic divs could be added here for flare) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500" />

                <div className="mb-6 relative inline-block">
                    <span className="text-8xl filter drop-shadow-lg">🏆</span>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 border-4 border-dashed border-yellow-400 rounded-full opacity-50"
                    />
                </div>

                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 mb-2 uppercase">
                    CONGRATULATIONS!
                </h2>

                <p className="text-slate-600 font-bold text-xl mb-4">
                    {name}
                </p>

                <p className="text-slate-500 mb-2">Great job! You are truly Smart Learners!</p>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8 inline-block w-full">
                    <p className="text-blue-800 font-bold uppercase text-sm tracking-wider">Completion Time</p>
                    <p className="text-3xl font-black text-blue-600">{Math.floor(completionTime / 60)}m {completionTime % 60}s</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onLeaderboard}
                        className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-all uppercase"
                    >
                        LEADERBOARD
                    </button>
                    <button
                        onClick={onPlayAgain}
                        className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all uppercase"
                    >
                        PLAY AGAIN
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
