import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LEARNING_QUEST_POOL, LEARNING_QUEST_PASSAGE } from '../constants';
import { useHighlighter } from '../hooks/useHighlighter';
import { Highlighter } from './GameIcons';
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
    { id: 5, name: "Blended Learning", icon: "🔄" },
    { id: 6, name: "AI Assistant", icon: "🤖" },
    { id: 7, name: "Global Classroom", icon: "🌐" },
    { id: 8, name: "Innovation Lab", icon: "🔬" },
];

export const LearningQuestMap: React.FC<LearningQuestMapProps> = ({ onGameOver, onWin }) => {
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState<typeof LEARNING_QUEST_POOL>([]);
    const [feedback, setFeedback] = useState<'correct' | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const {
        isHighlighterActive,
        toggleHighlighter,
        addHighlight,
        renderHighlightedText
    } = useHighlighter();

    // Constant ID for this specific passage
    const QUEST_PASSAGE_ID = 'learning-quest-main';

    const [playCorrect] = useSound(SOUNDS.correct);
    const [playIncorrect] = useSound(SOUNDS.incorrect);
    const [playLevelUp] = useSound(SOUNDS.levelUp);

    useEffect(() => {
        // Use questions in order (since they are sequential 1-8 based on the text)
        // or shuffle if desired, but user provided sequential questions.
        // Let's use sequential for now as they seem tied to the text flow.
        const questions = [...LEARNING_QUEST_POOL];
        setShuffledQuestions(questions);
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
        if (currentStageIndex < 7) {
            playLevelUp();
            setCurrentStageIndex(prev => prev + 1);
        } else {
            onWin();
        }
    };

    if (shuffledQuestions.length === 0) return <div>Loading...</div>;

    const currentQuestion = shuffledQuestions[currentStageIndex];
    // Check if options are T/F/DS (3 options) or Multiple Choice (4 options)
    const isThreeOption = currentQuestion.options.length === 3;

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
            {/* Header / Stats */}
            <div className="bg-white p-4 shadow-sm flex justify-between items-center z-20 sticky top-0 border-b border-indigo-100">
                <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 text-xl tracking-wide">
                    LEARNING EVOLUTION QUEST
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-slate-400">
                        {Math.round(((currentStageIndex) / 8) * 100)}% Complete
                    </div>
                    <div className="text-sm font-bold bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow-lg shadow-indigo-200">
                        STAGE {currentStageIndex + 1} / 8
                    </div>
                </div>
            </div>

            {/* Main Split View */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Left Panel: Reading Passage */}
                <div className="w-full md:w-1/2 bg-white border-r border-slate-200 overflow-y-auto p-6 md:p-10 shadow-inner">
                    <div className="max-w-2xl mx-auto prose prose-indigo prose-lg">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-xs">
                                <span className="bg-indigo-100 px-2 py-1 rounded">Reading Passage</span>
                            </div>
                            <button
                                onClick={toggleHighlighter}
                                className={`p-1.5 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${isHighlighterActive
                                    ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400 ring-offset-1'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                                title="Toggle Highlighter"
                            >
                                <Highlighter size={14} />
                                <span>Highlight</span>
                            </button>
                        </div>
                        {LEARNING_QUEST_PASSAGE.split('\n').map((paragraph, idx) => {
                            if (paragraph.startsWith('# ')) {
                                return <h1 key={idx} className="text-3xl font-extrabold text-slate-900 mb-6">{paragraph.replace('# ', '')}</h1>
                            }
                            if (paragraph.startsWith('**')) {
                                // Simple bold handling for Headers
                                return <h3 key={idx} className="text-xl font-bold text-indigo-700 mt-6 mb-3">{paragraph.replaceAll('**', '')}</h3>
                            }
                            return (
                                <p
                                    key={idx}
                                    className={`mb-4 text-slate-600 leading-relaxed text-lg ${isHighlighterActive ? 'cursor-text selection:bg-yellow-200' : ''}`}
                                    onMouseUp={() => addHighlight(QUEST_PASSAGE_ID, idx, paragraph)}
                                >
                                    {renderHighlightedText(paragraph, QUEST_PASSAGE_ID, idx)}
                                </p>
                            )
                        })}
                    </div>
                </div>

                {/* Right Panel: Map & Question */}
                <div className="w-full md:w-1/2 flex flex-col bg-slate-50 relative">

                    {/* Map Area (Top) */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-indigo-50/50">
                        <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto pb-64">
                            {STAGES.map((stage, index) => {
                                const isActive = index === currentStageIndex;
                                const isPast = index < currentStageIndex;

                                return (
                                    <div key={stage.id} className={`relative flex flex-col items-center p-3 w-28 md:w-32 transition-all duration-300 ${isActive ? 'scale-110 z-10' : 'opacity-60 grayscale scale-95'}`}>
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl mb-3 border-4 transition-all duration-500
                                           ${isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-white ring-4 ring-indigo-200 text-white transform -translate-y-1' :
                                                isPast ? 'bg-emerald-500 border-emerald-300 text-white' : 'bg-white border-slate-200 text-slate-300'}
                                       `}>
                                            {stage.icon}
                                        </div>
                                        <div className={`text-center font-bold text-xs uppercase tracking-wide ${isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                                            {stage.name}
                                        </div>
                                        {isActive && (
                                            <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-1 rounded-full shadow-md animate-bounce border border-white">
                                                YOU
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Question Area (Bottom Fixed) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-indigo-100 shadow-[0_-10px_40px_rgba(79,70,229,0.1)] p-6 z-20 rounded-t-3xl">
                        <div className="max-w-2xl mx-auto">
                            {feedback === 'correct' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-4"
                                >
                                    <div className="inline-block bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 mb-2">Excellent!</h2>
                                    <p className="text-slate-500 mb-6 font-medium">You're mastering this topic.</p>
                                    <button
                                        onClick={handleContinue}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-12 rounded-2xl shadow-xl shadow-emerald-200 transition-all transform hover:scale-105 active:scale-95 text-lg w-full md:w-auto"
                                    >
                                        CONTINUE JOURNEY
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="mb-6">
                                        <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2 block">Question {currentStageIndex + 1}</span>
                                        <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                                            {currentQuestion.question}
                                        </h3>
                                    </div>

                                    {/* Grid adjusts based on whether it's T/F/DS (3 cols) or Multiple Choice (1 or 2 cols) */}
                                    <div className={`grid gap-3 ${isThreeOption ? 'grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                                        {currentQuestion.options.map((opt) => (
                                            <button
                                                key={opt.id}
                                                disabled={selectedOption !== null}
                                                onClick={() => handleAnswer(opt.id)}
                                                className={`p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 group h-full
                                                    ${selectedOption === opt.id
                                                        ? 'bg-red-50 border-red-500 text-red-700'
                                                        : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm'
                                                    }
                                                `}
                                            >
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${selectedOption === opt.id ? 'bg-red-200 text-red-700' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-200 group-hover:text-indigo-700'}`}>
                                                    {opt.id}
                                                </span>
                                                <span className={`text-lg text-center md:text-left ${isThreeOption ? 'font-bold' : ''}`}>{opt.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
