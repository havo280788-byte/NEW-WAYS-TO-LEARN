import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LEARNING_QUEST_POOL, LEARNING_QUEST_PASSAGE } from '../constants';
import { useHighlighter } from '../hooks/useHighlighter';
import {
    Highlighter,
    BookOpen,
    Smartphone,
    Lightbulb,
    Monitor,
    Bot,
    Headphones,
    Brain,
    Globe,
    Clock,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Zap,
    Trophy,
    BarChart2
} from './GameIcons';
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
    onWin: (score: number, answers: Record<string, string>) => void;
    isTeacherMode?: boolean;
    onShowStats?: () => void;
    onShowLeaderboard?: () => void;
    onStartReview?: () => void;
}

const STAGES = [
    { id: 1, name: "Digital Spark", icon: <BookOpen size={20} /> },
    { id: 2, name: "Smart Apps", icon: <Smartphone size={20} /> },
    { id: 3, name: "Virtual Class", icon: <Lightbulb size={20} /> },
    { id: 4, name: "Cloud Library", icon: <Monitor size={20} /> },
    { id: 5, name: "Blended Learning", icon: <Bot size={20} /> },
    { id: 6, name: "AI Assistant", icon: <Headphones size={20} /> },
    { id: 7, name: "Global Classroom", icon: <Brain size={20} /> },
    { id: 8, name: "Innovation Lab", icon: <Globe size={20} /> },
];

const STAGE_MESSAGES = [
    "🌟 Great start!",
    "👍 Keep going!",
    "💡 Smart move!",
    "🚀 You’re halfway there!",
    "🧠 Brilliant thinking!",
    "🌐 Strong understanding!",
    "🎯 Almost there!",
    "🏆 Outstanding performance!"
];

export const LearningQuestMap: React.FC<LearningQuestMapProps> = ({
    onGameOver,
    onWin,
    isTeacherMode,
    onShowStats,
    onShowLeaderboard,
    onStartReview
}) => {
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState<typeof LEARNING_QUEST_POOL>([]);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(420); // 7 minutes = 420 seconds
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const {
        isHighlighterActive,
        toggleHighlighter,
        addHighlight,
        clearHighlights,
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

    // Timer Logic
    useEffect(() => {
        if (timeLeft <= 0) {
            onGameOver();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onGameOver]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (isTeacherMode) {
            setSelectedOption(answers[shuffledQuestions[currentStageIndex]?.id] || null);
        }
    }, [currentStageIndex, isTeacherMode, shuffledQuestions, answers]);

    const handleReveal = () => {
        if (isTeacherMode) {
            const currentQ = shuffledQuestions[currentStageIndex];
            setSelectedOption(currentQ.correctAnswerId);
            setFeedback('correct');
            setAnswers(prev => ({ ...prev, [currentQ.id]: currentQ.correctAnswerId }));
        }
    };

    const handleOptionSelect = (optionId: string) => {
        if (!isTeacherMode && feedback) return;

        setSelectedOption(optionId);

        if (isTeacherMode) {
            const currentQ = shuffledQuestions[currentStageIndex];
            const isCorrect = optionId === currentQ.correctAnswerId;
            setFeedback(isCorrect ? 'correct' : 'incorrect');
            setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }));

            // Auto update score for teacher mode simulation if needed
            if (isCorrect && answers[currentQ.id] !== optionId) {
                setScore(prev => prev + 10);
            }
        }
    };

    const handleCheckAnswer = () => {
        if (!selectedOption || feedback) return;

        const currentQ = shuffledQuestions[currentStageIndex];
        setAnswers(prev => ({ ...prev, [currentQ.id]: selectedOption }));

        if (selectedOption === currentQ.correctAnswerId) {
            setScore(prev => prev + 10);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    const handleContinue = () => {
        setFeedback(null);
        setSelectedOption(null);
        if (currentStageIndex < 7) {
            if (!isTeacherMode) playLevelUp();
            setCurrentStageIndex(prev => prev + 1);
        } else {
            onWin(score, answers);
        }
    };

    const handlePrev = () => {
        if (currentStageIndex > 0) {
            setFeedback(null);
            setCurrentStageIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentStageIndex < 7) {
            setFeedback(null);
            setCurrentStageIndex(prev => prev + 1);
        }
    };

    if (shuffledQuestions.length === 0) return <div>Loading...</div>;

    const currentQuestion = shuffledQuestions[currentStageIndex];
    // Check if options are T/F/DS (3 options) or Multiple Choice (4 options)
    const isThreeOption = currentQuestion.options.length === 3;

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden font-sans text-slate-800 antialiased">
            {/* Header / Stats */}
            <div className="bg-[#0F172A] shadow-md z-30 sticky top-0 shrink-0 text-white py-3">

                {/* Top Row: Title & Timer */}
                <div className="p-4 pb-2 flex flex-col md:grid md:grid-cols-3 items-center gap-4 border-b border-white/10">

                    {/* Empty Left Col (Desktop) for centering balance */}
                    <div className="hidden md:block"></div>

                    {/* Title Section (Centered) */}
                    <div className="text-center w-full">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight drop-shadow-md">English 10 – New Ways to Learn</h1>
                        <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Smart Learning Challenge</p>
                    </div>

                    {/* Timer (Right on Desktop, Centered/Below on Mobile) */}
                    <div className="flex justify-center md:justify-end w-full">
                        {!isTeacherMode && (
                            <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 shadow-inner w-fit">
                                <Clock size={20} className="text-amber-300 animate-pulse" />
                                <div className="flex flex-col items-end leading-none">
                                    <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Time Left</span>
                                    <span className="text-xl font-mono font-bold text-white tabular-nums">{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        )}
                        {isTeacherMode && (
                            <div className="flex items-center gap-2 bg-emerald-500/30 px-4 py-2 rounded-xl border border-emerald-400/30">
                                <span className="text-xs font-black uppercase tracking-widest text-emerald-50">🟢 Teacher Preview</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Row: Progress Bar (Below Header) */}
                <div className="w-full overflow-x-auto no-scrollbar mask-gradient-x flex justify-center py-3 bg-black/5">
                    <div className="flex items-center gap-4 md:gap-8 px-4 min-w-max">
                        {STAGES.map((stage, index) => {
                            const isActive = index === currentStageIndex;
                            const isCompleted = index < currentStageIndex;

                            return (
                                <div key={stage.id} className="flex flex-col items-center gap-2 group relative">
                                    <div
                                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-2
                                            ${isActive
                                                ? 'bg-[#22D3EE] border-[#22D3EE] text-[#1E3A8A] scale-110 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                                                : isCompleted
                                                    ? 'bg-[#A78BFA] border-[#A78BFA] text-white opacity-90'
                                                    : 'bg-slate-200/10 border-white/10 text-slate-400'
                                            }
                                        `}
                                    >
                                        {React.cloneElement(stage.icon, {
                                            size: isActive ? 24 : 20,
                                            strokeWidth: isActive ? 2.5 : 2
                                        })}
                                    </div>
                                    {/* Stage Name (Visible on Desktop or Active) */}
                                    <div className={`hidden md:block text-[10px] uppercase font-bold tracking-wider transition-colors duration-300
                                        ${isActive ? 'text-[#22D3EE]' : isCompleted ? 'text-indigo-200' : 'text-slate-400'}
                                    `}>
                                        {stage.name}
                                    </div>
                                    {/* Mobile Active Stage Name Overlay */}
                                    <div className={`md:hidden absolute -bottom-4 whitespace-nowrap text-[10px] font-bold tracking-wider transition-opacity duration-300
                                        ${isActive ? 'opacity-100 text-[#22D3EE]' : 'opacity-0'}
                                    `}>
                                        {stage.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Split View */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-slate-100 gap-4 md:gap-5 p-3 md:p-5">

                {/* Left Panel: Reading Passage */}
                <div className="flex-1 md:w-[40%] bg-white rounded-2xl md:rounded-3xl border border-slate-200 overflow-hidden flex flex-col shadow-sm relative z-10 max-h-[60vh] md:max-h-[50vh]">
                    <div className="flex items-center justify-between p-3 md:p-4 bg-white border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                            <span className="bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 italic">📖 Reading</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isTeacherMode && (
                                <button
                                    onClick={() => clearHighlights(QUEST_PASSAGE_ID)}
                                    className="p-1.5 rounded-lg transition-all flex items-center gap-2 text-[10px] md:text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                                    title="Clear All Highlights"
                                >
                                    <RotateCcw size={14} className="md:w-3.5 md:h-3.5" />
                                    <span className="hidden sm:inline">Xóa Highlight</span>
                                </button>
                            )}
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
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 md:p-5 prose prose-emerald max-w-none custom-scrollbar-thin">
                        {LEARNING_QUEST_PASSAGE.split('\n').map((paragraph, idx) => {
                            if (paragraph.startsWith('# ')) {
                                return <h1 key={idx} className="text-xl md:text-3xl font-extrabold text-slate-900 mb-4 md:mb-6 leading-tight mt-0">{paragraph.replace('# ', '')}</h1>
                            }
                            if (paragraph.startsWith('**')) {
                                return <h3 key={idx} className="text-base md:text-xl font-bold text-emerald-700 mt-4 md:mt-6 mb-2 md:mb-3">{paragraph.replaceAll('**', '')}</h3>
                            }
                            return (
                                <p
                                    key={idx}
                                    className={`mb-3 md:mb-4 text-[#334155] font-normal text-sm leading-[1.6] ${isHighlighterActive ? 'cursor-text selection:bg-yellow-200' : ''}`}
                                    onMouseUp={() => addHighlight(QUEST_PASSAGE_ID, idx, paragraph)}
                                    onTouchEnd={() => addHighlight(QUEST_PASSAGE_ID, idx, paragraph)}
                                >
                                    {renderHighlightedText(paragraph, QUEST_PASSAGE_ID, idx)}
                                </p>
                            )
                        })}
                        <div className="h-4 md:h-8"></div>
                    </div>
                </div>

                {/* Right Panel: Question (Bottom on Mobile, Right on Desktop) */}
                <div className="flex-1 md:w-[60%] relative z-20 overflow-hidden flex flex-col bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-lg">
                    {isTeacherMode && (
                        <div className="p-3 bg-emerald-600 text-white flex justify-between items-center shrink-0">
                            <button onClick={handlePrev} disabled={currentStageIndex === 0} className="p-2 hover:bg-white/20 rounded-lg disabled:opacity-30">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-bold text-xs uppercase tracking-widest">Question Control</span>
                            <button onClick={handleNext} disabled={currentStageIndex === 7} className="p-2 hover:bg-white/20 rounded-lg disabled:opacity-30">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden p-3 space-y-2 custom-scrollbar-thin flex flex-col">
                        <div className="max-w-2xl mx-auto flex flex-col h-full">
                            {feedback && !isTeacherMode ? (
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
                                    <p className="text-emerald-50 mb-6 text-sm md:text-lg font-medium">
                                        {feedback === 'correct'
                                            ? STAGE_MESSAGES[currentStageIndex] || "Great job!"
                                            : "✔ Incorrect. Please review the passage."
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
                                    <div className="mb-4 md:mb-8 text-slate-800">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-emerald-200">
                                                Stage {currentStageIndex + 1}
                                            </span>
                                            {isTeacherMode && (
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-emerald-200">
                                                        TEACHER PREVIEW
                                                    </span>
                                                    <button
                                                        onClick={handleReveal}
                                                        className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-emerald-200 hover:bg-emerald-200 transition-colors"
                                                    >
                                                        Reveal Answer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold leading-snug text-slate-900">
                                            {currentQuestion.question}
                                        </h3>
                                    </div>

                                    <div className={`grid gap-3 ${isThreeOption ? 'grid-cols-1 sm:grid-cols-1' : 'grid-cols-1 sm:grid-cols-1'} pb-8 md:pb-0`}>
                                        {currentQuestion.options.map((opt) => {
                                            const isSelected = selectedOption === opt.id;
                                            const isCorrect = opt.id === currentQuestion.correctAnswerId;

                                            let borderClass = "border-slate-200";
                                            let bgClass = "bg-white hover:bg-slate-50";
                                            let textClass = "text-slate-700";
                                            let iconWrapperClass = "bg-slate-100 text-slate-500";

                                            if (isSelected) {
                                                if (isTeacherMode) {
                                                    if (isCorrect) {
                                                        bgClass = "bg-emerald-50";
                                                        borderClass = "border-emerald-500 scale-[1.02]";
                                                        textClass = "text-emerald-900";
                                                        iconWrapperClass = "bg-emerald-500 text-white";
                                                    } else {
                                                        bgClass = "bg-red-50";
                                                        borderClass = "border-red-500 scale-[1.02]";
                                                        textClass = "text-red-900";
                                                        iconWrapperClass = "bg-red-500 text-white";
                                                    }
                                                } else {
                                                    bgClass = "bg-[#F59E0B]";
                                                    borderClass = "border-[#F59E0B] scale-[1.02]";
                                                    textClass = "text-white";
                                                    iconWrapperClass = "bg-white/20 text-white";
                                                }
                                            }

                                            return (
                                                <button
                                                    key={opt.id}
                                                    disabled={!isTeacherMode && feedback !== null}
                                                    onClick={() => handleOptionSelect(opt.id)}
                                                    className={`p-3 md:p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-start gap-4 group shadow-sm
                                                        ${bgClass} ${borderClass} ${textClass}
                                                    `}
                                                >
                                                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${iconWrapperClass}`}>
                                                        {opt.id}
                                                    </span>
                                                    <span className={`text-sm md:text-base font-medium`}>{opt.text}</span>
                                                    {isTeacherMode && isSelected && (
                                                        <div className="ml-auto">
                                                            {isCorrect ? <div className="bg-emerald-500 text-white p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div> : <div className="bg-red-500 text-white p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>}
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* NAVIGATION FOR TEACHER OR CONTINUE FOR STUDENT */}
                                    {isTeacherMode ? (
                                        <div className="mt-8 flex gap-4">
                                            <button
                                                onClick={handleContinue}
                                                className="flex-1 font-bold py-4 rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 text-lg bg-emerald-600 text-white hover:bg-emerald-700 uppercase tracking-wide"
                                            >
                                                {currentStageIndex === 7 ? "View Results" : "Submit & Continue"}
                                            </button>
                                        </div>
                                    ) : (
                                        selectedOption && !feedback && (
                                            <div className="mt-8 flex justify-center">
                                                <button
                                                    onClick={handleCheckAnswer}
                                                    className="font-bold py-4 px-12 rounded-2xl shadow-xl transition-all transform hover:scale-[1.05] active:scale-95 text-lg bg-[#F59E0B] text-white hover:bg-[#D97706] border-b-4 border-amber-700 uppercase tracking-widest"
                                                >
                                                    Check Answer
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-thin::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}} />
        </div>
    );
};

