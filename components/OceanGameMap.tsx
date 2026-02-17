import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { OCEAN_QUESTION_POOL, SOUNDS } from '../constants';
import { AnswerFeedback } from './GameFeedback';

interface OceanGameMapProps {
    onGameOver: () => void;
    onWin: () => void;
}

const STAGE_1_QUESTIONS = OCEAN_QUESTION_POOL.slice(0, 5);
const STAGE_2_QUESTIONS = OCEAN_QUESTION_POOL.slice(5, 9);

export const OceanGameMap: React.FC<OceanGameMapProps> = ({ onGameOver, onWin }) => {
    const [stage, setStage] = useState<1 | 2>(1);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState<typeof OCEAN_QUESTION_POOL>([]);
    const [showQuestion, setShowQuestion] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    // Sounds
    const [playCorrect] = useSound(SOUNDS.correct);
    const [playIncorrect] = useSound(SOUNDS.incorrect);
    const [playLevelUp] = useSound(SOUNDS.levelUp);

    // Initialize Stage 1
    useEffect(() => {
        // Randomize Stage 1 Questions
        const shuffled = [...STAGE_1_QUESTIONS].sort(() => Math.random() - 0.5);
        setShuffledQuestions(shuffled);
        setCurrentQuestionIndex(0);
        // Delay showing question to allow map animation
        setTimeout(() => setShowQuestion(true), 1500);
    }, []);

    const handleStageTransition = () => {
        setShowQuestion(false);
        playLevelUp();
        setTimeout(() => {
            setStage(2);
            const shuffled = [...STAGE_2_QUESTIONS].sort(() => Math.random() - 0.5);
            setShuffledQuestions(shuffled);
            setCurrentQuestionIndex(0);
            setTimeout(() => setShowQuestion(true), 1500);
        }, 2000);
    };

    const handleAnswer = (optionId: string) => {
        const currentQ = shuffledQuestions[currentQuestionIndex];
        if (optionId === currentQ.correctAnswerId) {
            playCorrect();
            setFeedback('correct');
            setTimeout(() => {
                setFeedback(null);
                if (currentQuestionIndex < shuffledQuestions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                } else {
                    // Stage Complete
                    if (stage === 1) {
                        handleStageTransition();
                    } else {
                        onWin();
                    }
                }
            }, 1500);
        } else {
            playIncorrect();
            setFeedback('incorrect');
            setTimeout(() => {
                onGameOver();
            }, 1500);
        }
    };

    const currentQ = shuffledQuestions[currentQuestionIndex];

    return (
        <div className="fixed inset-0 bg-blue-50 overflow-hidden flex flex-col">
            <AnswerFeedback type={feedback} />

            {/* Top Bar */}
            <div className="bg-white/80 backdrop-blur-md p-4 shadow-sm flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                    <span className="text-2xl">🗺️</span>
                    <h2 className="text-xl font-bold text-slate-800">Mission Map</h2>
                </div>
                <div className="flex gap-2">
                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${stage === 1 ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-slate-200 text-slate-500'}`}>
                        STAGE 1: DECODE
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${stage === 2 ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-slate-200 text-slate-500'}`}>
                        STAGE 2: DESIGN
                    </div>
                </div>
            </div>

            {/* Map Visuals */}
            <div className="flex-1 relative bg-gradient-to-b from-blue-100 to-indigo-200 overflow-hidden">
                {/* Decorative Map Elements */}
                <div className="absolute inset-0 opacity-30">
                    <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
                        {/* Path connecting stages */}
                        <path d="M 200 500 C 300 300, 500 300, 600 100" stroke="white" strokeWidth="8" strokeDasharray="20 10" fill="none" />
                    </svg>
                </div>

                {/* Stage 1 Island */}
                <div className="absolute bottom-20 left-10 md:left-40 flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${stage === 1 ? 'bg-blue-500 border-white shadow-blue-400/50 shadow-2xl scale-110' : 'bg-blue-300 border-blue-200 grayscale'}`}>
                        <span className="text-4xl">🧩</span>
                    </div>
                    <div className="mt-4 bg-white/90 px-4 py-2 rounded-xl font-bold text-blue-800 shadow-sm">DECODE THE FUTURE</div>
                </div>

                {/* Stage 2 Island */}
                <div className="absolute top-20 right-10 md:right-40 flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${stage === 2 ? 'bg-purple-500 border-white shadow-purple-400/50 shadow-2xl scale-110' : 'bg-purple-300 border-purple-200 opacity-60'}`}>
                        <span className="text-4xl">🚀</span>
                    </div>
                    <div className="mt-4 bg-white/90 px-4 py-2 rounded-xl font-bold text-purple-800 shadow-sm">DESIGN THE FUTURE</div>
                </div>

                {/* Player Icon */}
                <motion.div
                    className="absolute z-10"
                    initial={{ bottom: '20%', left: '20%' }}
                    animate={{
                        bottom: stage === 1 ? '25%' : '75%',
                        left: stage === 1 ? '25%' : '75%'
                    }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                >
                    <div className="w-16 h-16 bg-yellow-400 rounded-full border-4 border-white shadow-xl flex items-center justify-center relative">
                        <span className="text-2xl">🎓</span>
                        <div className="absolute -bottom-2 w-10 h-2 bg-black/20 rounded-full blur-sm" />
                    </div>
                </motion.div>
            </div>

            {/* Question Card Overlay */}
            <AnimatePresence>
                {showQuestion && currentQ && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-0 left-0 right-0 p-6 flex justify-center z-30"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-4xl border border-slate-100 flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Question {currentQuestionIndex + 1} / {shuffledQuestions.length}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 leading-snug">
                                    {currentQ.question}
                                </h3>
                            </div>

                            <div className="flex-1 grid grid-cols-1 gap-3">
                                {currentQ.options.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleAnswer(opt.id)}
                                        className="px-6 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all text-left font-bold text-slate-600 flex items-center gap-3"
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm shadow-sm">{opt.id}</span>
                                        {opt.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
