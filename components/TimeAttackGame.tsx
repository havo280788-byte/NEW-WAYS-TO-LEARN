import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { Clock, Zap, CheckCircle, XCircle, Award } from './GameIcons';
import { SOUNDS } from '../constants';
import { Passage, Question } from '../types';
import { AnswerFeedback } from './GameFeedback';

interface TimeAttackGameProps {
    passages: Passage[];
    onComplete: (score: number) => void;
    onExit: () => void;
}

export const TimeAttackGame: React.FC<TimeAttackGameProps> = ({ passages, onComplete, onExit }) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    // Sounds
    const [playCorrect] = useSound(SOUNDS.correct);
    const [playIncorrect] = useSound(SOUNDS.incorrect);
    const [playLevelUp] = useSound(SOUNDS.levelUp); // Used for game over high score potentially

    // Get all questions flat
    const allQuestions = React.useMemo(() => {
        return passages.flatMap(p => p.questions);
    }, [passages]);

    const getRandomQuestion = () => {
        const randomIndex = Math.floor(Math.random() * allQuestions.length);
        return allQuestions[randomIndex];
    };

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && isPlaying) {
            setIsPlaying(false);
            onComplete(score);
        }
    }, [isPlaying, timeLeft, onComplete, score]);

    const startGame = () => {
        setTimeLeft(60);
        setScore(0);
        setCurrentQuestion(getRandomQuestion());
        setIsPlaying(true);
    };

    const handleAnswer = (optionId: string) => {
        if (!currentQuestion || !isPlaying) return;

        const isCorrect = optionId === currentQuestion.correctAnswerId;

        if (isCorrect) {
            setScore(prev => prev + 10);
            setTimeLeft(prev => Math.min(prev + 2, 60)); // Bonus time cap at 60s
            playCorrect();
            setFeedback('correct');
        } else {
            setScore(prev => Math.max(0, prev - 5));
            setTimeLeft(prev => Math.max(0, prev - 5)); // Penalty time
            playIncorrect();
            setFeedback('incorrect');
        }

        setTimeout(() => {
            setFeedback(null);
            setCurrentQuestion(getRandomQuestion());
        }, 500);
    };

    if (!isPlaying && timeLeft === 60) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center animate-in zoom-in">
                <div className="bg-amber-100 p-6 rounded-full text-amber-600 mb-6">
                    <Zap size={64} />
                </div>
                <h1 className="text-4xl font-black text-slate-800 mb-4">Time Attack Mode</h1>
                <p className="text-slate-500 mb-8 max-w-md text-lg">
                    Answer as many questions as you can in 60 seconds!
                    <br /> Correct answers add time (+2s). Wrong answers subtract time (-5s).
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onExit}
                        className="px-8 py-4 rounded-2xl font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={startGame}
                        className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:brightness-110 active:scale-95 transition-all text-xl"
                    >
                        Start Game!
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="relative max-w-2xl mx-auto pt-10 px-4">
            <AnswerFeedback type={feedback} />

            {/* Header Stats */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                    <Clock className={timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-400'} />
                    <span className={`text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                        {timeLeft}s
                    </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                    <Zap className="text-amber-500" />
                    <span className="text-2xl font-mono font-bold text-slate-700">{score}</span>
                </div>
            </div>

            {/* Question Card */}
            <motion.div
                key={currentQuestion.id}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            >
                <div className="p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
                        {currentQuestion.text}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={option.id}
                                onClick={() => handleAnswer(option.id)}
                                className="w-full text-left p-4 rounded-xl border-2 border-slate-50 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all font-medium flex items-center gap-3 group"
                            >
                                <span className="bg-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-slate-400 group-hover:text-indigo-500 border border-slate-200 group-hover:border-indigo-200">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                {option.text}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-2 bg-slate-100">
                    <motion.div
                        className="h-full bg-amber-500"
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: timeLeft, ease: "linear" }}
                    />
                </div>
            </motion.div>

            <button
                onClick={onExit}
                className="mt-8 mx-auto block text-slate-400 hover:text-slate-600 font-medium"
            >
                Quit Game
            </button>
        </div>
    );
};
