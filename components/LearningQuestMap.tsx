import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LEARNING_QUEST_POOL } from '../constants';
import useSound from 'use-sound';

// Using constants directly to avoid import issues or ensuring they match exactly
const SOUNDS = {
    correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
    incorrect: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
    levelUp: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

interface LearningQuestMapProps {
    onGameOver: () => void;
    onWin: () => void;
}

const STAGES = [
    { id: 1, name: "Digital Spark", icon: "💻" },
    { id: 2, name: "Smart Apps", icon: "📱" },
    { id: 3, name: "Virtual Class", icon: "🏫" },
    { id: 4, name: "Cloud Library", icon: "☁️" },
    { id: 5, name: "Online Tests", icon: "📝" },
    { id: 6, name: "Blended Learning", icon: "🔄" },
    { id: 7, name: "AI Assistant", icon: "🤖" },
    { id: 8, name: "Global Classroom", icon: "🌐" },
    { id: 9, name: "Innovation Lab", icon: "🔬" },
    { id: 10, name: "Future Mastery", icon: "🚀" },
];

export const LearningQuestMap: React.FC<LearningQuestMapProps> = ({ onGameOver, onWin }) => {
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState<typeof LEARNING_QUEST_POOL>([]);
    const [showQuestion, setShowQuestion] = useState(true); // Always show question below map
    const [feedback, setFeedback] = useState<'correct' | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const [playCorrect] = useSound(SOUNDS.correct);
    const [playIncorrect] = useSound(SOUNDS.incorrect);
    const [playLevelUp] = useSound(SOUNDS.levelUp);

    useEffect(() => {
        // Shuffle questions on mount and take first 10
        const shuffled = [...LEARNING_QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 10);
        setShuffledQuestions(shuffled);
    }, []);

    const handleAnswer = (optionId: string) => {
        if (selectedOption || feedback) return; // Prevent double clicks

        const currentQ = shuffledQuestions[currentStageIndex];
        setSelectedOption(optionId);

        if (optionId === currentQ.correctAnswerId) {
            playCorrect();
            setFeedback('correct');
        } else {
            playIncorrect();
            setTimeout(() => {
                onGameOver();
            }, 1000);
        }
    };

    const handleContinue = () => {
        setFeedback(null);
        setSelectedOption(null);
        if (currentStageIndex < 9) {
            playLevelUp();
            setCurrentStageIndex(prev => prev + 1);
        } else {
            onWin();
        }
    };

    if (shuffledQuestions.length === 0) return <div>Loading...</div>;

    const currentQuestion = shuffledQuestions[currentStageIndex];

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
            {/* Header / Stats */}
            <div className="bg-white p-4 shadow-sm flex justify-between items-center z-10 sticky top-0">
                <div className="font-bold text-indigo-700 text-lg tracking-wide">LEARNING EVOLUTION QUEST</div>
                <div className="text-sm font-semibold bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full border border-indigo-100">
                    STAGE {currentStageIndex + 1} / 10
                </div>
            </div>

            {/* Scrollable Map Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 bg-slate-50 relative">
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto pb-64">
                    {/* Map Nodes */}
                    {STAGES.map((stage, index) => {
                        const isActive = index === currentStageIndex;
                        const isPast = index < currentStageIndex;

                        return (
                            <div key={stage.id} className={`relative flex flex-col items-center p-4 w-32 md:w-40 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-70 grayscale'}`}>
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg mb-3 border-4 transition-all duration-500
                                   ${isActive ? 'bg-indigo-500 border-indigo-300 text-white shadow-indigo-200' :
                                        isPast ? 'bg-emerald-500 border-emerald-300 text-white' : 'bg-white border-slate-200 text-slate-300'}
                               `}>
                                    {stage.icon}
                                </div>
                                <div className={`text-center font-bold text-sm ${isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                                    {stage.name}
                                </div>
                                {isActive && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-bounce">
                                        YOU
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Question Area - Fixed at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-20 rounded-t-3xl">
                <div className="max-w-3xl mx-auto">
                    {feedback === 'correct' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h2 className="text-3xl font-extrabold text-emerald-500 mb-2">CORRECT!</h2>
                            <p className="text-slate-600 mb-6 font-medium">Keep moving forward!</p>
                            <button
                                onClick={handleContinue}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-12 rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:scale-105 active:scale-95 text-lg"
                            >
                                CONTINUE
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <h3 className="text-xl font-bold text-slate-800 mb-6">
                                {currentQuestion.question}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((opt) => (
                                    <button
                                        key={opt.id}
                                        disabled={selectedOption !== null}
                                        onClick={() => handleAnswer(opt.id)}
                                        className={`p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 
                                            ${selectedOption === opt.id
                                                ? 'bg-red-50 border-red-500 text-red-700' // Optimistic wrong (fixed if correct later) 
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700'
                                            }
                                        `}
                                    >
                                        <span className="font-bold mr-2 text-slate-400">{opt.id}.</span> {opt.text}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};
