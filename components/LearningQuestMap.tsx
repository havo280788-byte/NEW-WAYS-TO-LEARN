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
    onWin: (score: number) => void;
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
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);

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
            setScore(prev => prev + 10);
            setFeedback('correct');
        } else {
            playIncorrect();
            setFeedback('incorrect');
        }
    };

    const handleContinue = () => {
        setFeedback(null);
        setSelectedOption(null);
        if (currentStageIndex < 7) {
            playLevelUp();
            setCurrentStageIndex(prev => prev + 1);
        } else {
            onWin(score);
        }
    };

    if (shuffledQuestions.length === 0) return <div>Loading...</div>;

    const currentQuestion = shuffledQuestions[currentStageIndex];
    // Check if options are T/F/DS (3 options) or Multiple Choice (4 options)
    const isThreeOption = currentQuestion.options.length === 3;

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden font-sans text-slate-800">
            {/* Header / Stats */}
            <div className="bg-white p-3 shadow-sm flex flex-col md:flex-row justify-between items-center z-30 sticky top-0 border-b border-indigo-100 shrink-0 gap-2 md:gap-0">
                <div className="flex justify-between w-full md:w-auto items-center">
                    <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 text-lg md:text-xl tracking-wide shrink-0">
                        QUEST
                    </div>
                    <div className="md:hidden text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                        {currentStageIndex + 1}/8
                    </div>
                </div>

                <div className="flex-1 w-full md:w-auto mx-0 md:mx-4 overflow-x-auto no-scrollbar mask-gradient-x">
                    {/* Horizontal Stages Bar */}
                    <div className="flex items-center gap-2 md:gap-3 w-max px-2 py-1">
                        {STAGES.map((stage, index) => {
                            const isActive = index === currentStageIndex;
                            const isPast = index < currentStageIndex;

                            return (
                                <div key={stage.id} className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'opacity-100 scale-110' : 'opacity-50 scale-95'}`}>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-lg border-2 shadow-sm shrink-0
                                        ${isActive ? 'bg-indigo-600 border-indigo-200 text-white' :
                                            isPast ? 'bg-emerald-500 border-emerald-300 text-white' : 'bg-white border-slate-200 text-slate-300'}
                                     `}>
                                        {stage.icon}
                                    </div>
                                    {isActive && <div className="h-1 w-1 bg-indigo-600 rounded-full hidden md:block"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 shrink-0">
                    <div className="text-sm font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                        Stage {currentStageIndex + 1} / 8
                    </div>
                </div>
            </div>

            {/* Main Split View */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-slate-100">

                {/* Left Panel: Reading Passage */}
                <div className="flex-1 md:w-1/2 bg-white border-b-4 border-slate-200 md:border-b-0 md:border-r overflow-hidden flex flex-col shadow-sm relative z-10">
                    <div className="flex items-center justify-between p-2 md:p-3 bg-white border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                            <span className="bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">📖 Reading Passage</span>
                        </div>
                        <button
                            onClick={toggleHighlighter}
                            className={`p-1.5 rounded-lg transition-all flex items-center gap-2 text-[10px] md:text-xs font-bold ${isHighlighterActive
                                ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400 ring-offset-1'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                            title="Toggle Highlighter"
                        >
                            <Highlighter size={14} className="md:w-3.5 md:h-3.5" />
                            <span className="hidden sm:inline">Highlight</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 prose prose-indigo prose-sm md:prose-lg max-w-none custom-scrollbar">
                        {LEARNING_QUEST_PASSAGE.split('\n').map((paragraph, idx) => {
                            if (paragraph.startsWith('# ')) {
                                return <h1 key={idx} className="text-xl md:text-3xl font-extrabold text-slate-900 mb-4 md:mb-6 leading-tight mt-0">{paragraph.replace('# ', '')}</h1>
                            }
                            if (paragraph.startsWith('**')) {
                                return <h3 key={idx} className="text-base md:text-xl font-bold text-indigo-700 mt-4 md:mt-6 mb-2 md:mb-3">{paragraph.replaceAll('**', '')}</h3>
                            }
                            return (
                                <p
                                    key={idx}
                                    className={`mb-3 md:mb-4 text-slate-600 leading-relaxed text-sm md:text-lg ${isHighlighterActive ? 'cursor-text selection:bg-yellow-200' : ''}`}
                                    onMouseUp={() => addHighlight(QUEST_PASSAGE_ID, idx, paragraph)}
                                    onTouchEnd={() => addHighlight(QUEST_PASSAGE_ID, idx, paragraph)}
                                >
                                    {renderHighlightedText(paragraph, QUEST_PASSAGE_ID, idx)}
                                </p>
                            )
                        })}
                        {/* Spacing at bottom to ensure last text is readable */}
                        <div className="h-8"></div>
                    </div>
                </div>

                {/* Right Panel: Question (Bottom on Mobile, Right on Desktop) */}
                <div className="flex-1 md:w-1/2 relative z-20 overflow-hidden flex flex-col bg-gradient-to-br from-[#1E3A8A] to-[#E0E7FF]">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <div className="max-w-2xl mx-auto flex flex-col justify-center min-h-full">
                            {feedback ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
                                >
                                    <div className={`inline-block p-4 rounded-full mb-4 shadow-lg ${feedback === 'correct' ? 'bg-[#22C55E] text-white' : 'bg-[#EF4444] text-white'}`}>
                                        {feedback === 'correct' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        )}
                                    </div>
                                    <h2 className="text-xl md:text-3xl font-black mb-2 text-white drop-shadow-md">
                                        {feedback === 'correct' ? 'Correct!' : 'Incorrect'}
                                    </h2>
                                    <p className="text-indigo-100 mb-6 text-sm md:text-lg font-medium">
                                        {feedback === 'correct'
                                            ? "Great job! Ready for the next stage?"
                                            : `Answer: ${currentQuestion.options.find(o => o.id === currentQuestion.correctAnswerId)?.text}`
                                        }
                                    </p>
                                    <button
                                        onClick={handleContinue}
                                        className="font-bold py-3 md:py-4 px-8 md:px-12 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 text-base md:text-lg w-full md:w-auto text-[#1E3A8A] bg-white hover:bg-slate-100"
                                    >
                                        Next Stage
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col h-full justify-start md:justify-center">
                                    <div className="mb-4 md:mb-8 text-white">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 inline-block border border-white/10">
                                            Question {currentStageIndex + 1}
                                        </span>
                                        <h3 className="text-lg md:text-2xl font-bold leading-snug drop-shadow-sm">
                                            {currentQuestion.question}
                                        </h3>
                                    </div>

                                    <div className={`grid gap-3 ${isThreeOption ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'} pb-8 md:pb-0`}>
                                        {currentQuestion.options.map((opt) => {
                                            const isSelected = selectedOption === opt.id;

                                            // Determine Button Color based on ID
                                            let bgClass = "bg-white/90";
                                            let textClass = "text-slate-700";
                                            let borderClass = "border-white/50";
                                            let activeClass = "";

                                            if (opt.id === 'T' || opt.id === 'True') {
                                                // True: #22C55E
                                                activeClass = "bg-[#22C55E] text-white border-[#22C55E]";
                                            } else if (opt.id === 'F' || opt.id === 'False') {
                                                // False: #EF4444
                                                activeClass = "bg-[#EF4444] text-white border-[#EF4444]";
                                            } else if (opt.id === 'DS' || opt.id === 'Doesn\'t say') {
                                                // Doesn't Say: #6366F1
                                                activeClass = "bg-[#6366F1] text-white border-[#6366F1]";
                                            } else {
                                                // Default for A, B, C, D
                                                activeClass = "bg-[#4F46E5] text-white border-[#4F46E5]";
                                            }

                                            return (
                                                <button
                                                    key={opt.id}
                                                    disabled={selectedOption !== null}
                                                    onClick={() => handleAnswer(opt.id)}
                                                    className={`p-3 md:p-5 rounded-xl border-2 text-left font-medium transition-all duration-200 flex sm:flex-col md:flex-row items-center justify-start gap-3 group shadow-lg hover:scale-[1.02]
                                                        ${isSelected
                                                            ? activeClass
                                                            : `${bgClass} ${textClass} ${borderClass} hover:bg-white`
                                                        }
                                                    `}
                                                >
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors 
                                                        ${isSelected
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                                        }`}>
                                                        {opt.id}
                                                    </span>
                                                    <span className={`text-sm md:text-lg ${isThreeOption ? 'font-bold' : ''}`}>{opt.text}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
