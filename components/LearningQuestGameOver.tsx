import React from 'react';
import { motion } from 'framer-motion';

interface LearningQuestGameOverProps {
    onPlayAgain: () => void;
    onBackToMap: () => void;
}

export const LearningQuestGameOver: React.FC<LearningQuestGameOverProps> = ({ onPlayAgain, onBackToMap }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 text-center p-8 border-4 border-slate-200"
            >
                <div className="text-6xl mb-4">😢</div>
                <h2 className="text-2xl font-extrabold text-red-500 mb-2 uppercase">
                    INCORRECT
                </h2>
                <p className="text-slate-600 mb-8 font-medium">
                    YOUR LEARNING JOURNEY STOPS HERE!
                </p>

                <div className="space-y-3">
                    <button
                        onClick={onPlayAgain}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                    >
                        PLAY AGAIN
                    </button>
                    <button
                        onClick={onBackToMap}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all"
                    >
                        BACK TO MAP
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
