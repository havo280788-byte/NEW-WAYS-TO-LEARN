import React from 'react';
import { motion } from 'framer-motion';

interface OceanGameOverProps {
    onPlayAgain: () => void;
}

export const OceanGameOver: React.FC<OceanGameOverProps> = ({ onPlayAgain }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-red-500"
            >
                <div className="mb-6">
                    <span className="text-6xl">⚠️</span>
                </div>

                <h2 className="text-3xl font-extrabold text-red-600 mb-4 uppercase">
                    INCORRECT
                </h2>

                <p className="text-slate-700 font-bold text-lg mb-8">
                    YOU CAN’T DECODE YOUR FUTURE!
                </p>

                <button
                    onClick={onPlayAgain}
                    className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-700 hover:shadow-xl transform active:scale-95 transition-all text-lg tracking-wide uppercase"
                >
                    PLAY AGAIN!
                </button>
            </motion.div>
        </div>
    );
};
