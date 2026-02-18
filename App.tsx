import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Award, BarChart2, Settings, Brain, ChevronRight,
  CheckCircle, XCircle, RefreshCw, MessageCircle, Clock, Key, LogOut, Zap, Trophy, Map, Highlighter
} from './components/GameIcons';
import useSound from 'use-sound';
import { useHighlighter } from './hooks/useHighlighter';
import { AnswerFeedback, LevelUpModal } from './components/GameFeedback';
import { DEFAULT_PASSAGES, INITIAL_PROGRESS, SOUNDS } from './constants';
import { AppSettings, Passage, UserProgress, GameSession, MODELS, OceanLeaderboardEntry } from './types';
import { GeminiService } from './services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// Learning Quest Components
import { LearningQuestIntro } from './components/LearningQuestIntro';
import { LearningQuestMap } from './components/LearningQuestMap';
import { LearningQuestGameOver } from './components/LearningQuestGameOver';
import { LearningQuestWin } from './components/LearningQuestWin';
import { LearningQuestLeaderboard } from './components/LearningQuestLeaderboard';

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const Header = ({
  points,
  streak,
  onOpenSettings
}: {
  points: number;
  streak: number;
  onOpenSettings: () => void
}) => (
  <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 text-white p-2 rounded-lg">
          <BookOpen size={20} />
        </div>
        <span className="font-bold text-slate-800 hidden sm:block">Eng10: New Ways to Learn</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">
          <span className="text-lg">🔥</span>
          <span className="font-bold">{streak}</span>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
          <Award size={18} />
          <span className="font-bold">{points} pts</span>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  </header>
);

// --- Main App ---

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'stats'>('home');
  const [passages, setPassages] = useState<Passage[]>(DEFAULT_PASSAGES);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    theme: 'light',
    soundEnabled: true,
    selectedModel: MODELS[0]
  });

  // Game State
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Feedback State
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [lastFeedbackType, setLastFeedbackType] = useState<'correct' | 'incorrect' | null>(null);

  // Learning Quest State
  const [showQuestIntro, setShowQuestIntro] = useState(false);
  const [questParticipant, setQuestParticipant] = useState<{ name: string, className: string, startTime: number } | null>(null);
  const [questState, setQuestState] = useState<'intro' | 'playing' | 'gameover' | 'win' | 'leaderboard'>('intro');

  // Highlighter State
  const {
    isHighlighterActive,
    toggleHighlighter,
    addHighlight,
    renderHighlightedText
  } = useHighlighter();

  // Sounds
  const [playCorrect] = useSound(SOUNDS.correct);
  const [playIncorrect] = useSound(SOUNDS.incorrect);
  const [playLevelUp] = useSound(SOUNDS.levelUp);

  // Refs
  const bottomChatRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    // Load data from local storage
    const savedSettings = localStorage.getItem('app_settings');
    const savedProgress = localStorage.getItem('app_progress');
    const savedPassages = localStorage.getItem('app_passages');

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    if (savedPassages) setPassages(JSON.parse(savedPassages));
  }, []);

  useEffect(() => {
    if (bottomChatRef.current) {
      bottomChatRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // Helpers
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
  };

  const updateProgress = (points: number, isComplete: boolean) => {
    const newProgress = { ...progress };
    newProgress.totalPoints += points;
    newProgress.totalQuestionsAnswered += 1;

    // Level Calculation
    const newLevel = 1 + Math.floor(Math.sqrt(newProgress.totalPoints / 100));

    if (newLevel > (newProgress.level || 1)) {
      newProgress.level = newLevel;
      if (settings.soundEnabled) playLevelUp();
      setLevelUpModalOpen(true);
    } else {
      newProgress.level = newLevel;
    }

    if (isComplete && activeSession) {
      if (!newProgress.completedPassages.includes(activeSession.passageId)) {
        newProgress.completedPassages.push(activeSession.passageId);
      }
    }
    setProgress(newProgress);
    localStorage.setItem('app_progress', JSON.stringify(newProgress));
  };

  const handleStartSession = (passageId: string) => {
    setActiveSession({
      passageId,
      answers: {},
      score: 0,
      startTime: Date.now(),
      isCompleted: false
    });
    setCurrentQuestionIndex(0);
    setShowFeedback(false);
    setShowExplanation(false);
    setActiveTab('learn');
  };

  const handleAnswer = (optionId: string) => {
    if (!activeSession) return;

    const currentPassage = passages.find(p => p.id === activeSession.passageId);
    if (!currentPassage) return;

    const currentQuestion = currentPassage.questions[currentQuestionIndex];
    const isCorrect = optionId === currentQuestion.correctAnswerId;

    const newAnswers = { ...activeSession.answers, [currentQuestion.id]: optionId };
    let newScore = activeSession.score;

    if (isCorrect) {
      newScore += 10;
      updateProgress(10, false);
      if (settings.soundEnabled) playCorrect();
      setLastFeedbackType('correct');
    } else {
      if (settings.soundEnabled) playIncorrect();
      setLastFeedbackType('incorrect');
    }

    setTimeout(() => setLastFeedbackType(null), 2000);

    setActiveSession({ ...activeSession, answers: newAnswers, score: newScore });
    setShowFeedback(true);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!activeSession) return;
    const currentPassage = passages.find(p => p.id === activeSession.passageId);
    if (!currentPassage) return;

    if (currentQuestionIndex < currentPassage.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
      setShowExplanation(false);
    } else {
      // Finish
      setActiveSession({ ...activeSession, isCompleted: true });
      updateProgress(0, true);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!settings.apiKey) {
      setIsSettingsOpen(true);
      showToast("Please enter your API Key first", 'error');
      return;
    }

    setIsLoading(true);
    const gemini = new GeminiService(settings.apiKey);
    try {
      const jsonStr = await gemini.generateQuiz("Advantages of Online Learning");
      if (jsonStr) {
        const data = JSON.parse(jsonStr);
        const newPassage: Passage = {
          id: `gen_${Date.now()}`,
          title: data.title,
          content: data.content,
          questions: data.questions.map((q: any, idx: number) => ({
            ...q,
            id: `q_gen_${Date.now()}_${idx}`,
            correctAnswerId: q.correctAnswerId.toString(),
            options: q.options.map((o: any) => ({ ...o, id: o.id.toString() }))
          })),
          topic: 'AI Generated',
          estimatedTime: 5
        };
        const newPassages = [newPassage, ...passages];
        setPassages(newPassages);
        localStorage.setItem('app_passages', JSON.stringify(newPassages));
        showToast("New lesson generated successfully!", 'success');
      }
    } catch (e) {
      showToast("Failed to generate content. Check API Key.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !settings.apiKey) return;

    const userMsg = chatInput;
    setChatMessages([...chatMessages, { role: 'user', text: userMsg }]);
    setChatInput('');

    const currentPassage = activeSession ? passages.find(p => p.id === activeSession.passageId) : null;
    const context = currentPassage ? currentPassage.content : "General inquiry about English reading comprehension.";

    const gemini = new GeminiService(settings.apiKey);
    try {
      const reply = await gemini.getTutorHelp(userMsg, context);
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Error connecting to tutor." }]);
    }
  };



  const handleTextSelection = (paragraphIndex: number) => {
    if (!activeSession) return;
    const passage = passages.find(p => p.id === activeSession.passageId);
    if (!passage) return;

    // Pass the actual text content of the paragraph to help with offset calculation if needed
    // For now, the hook handles selection logic
    addHighlight(activeSession.passageId, paragraphIndex, passage.content.split('\n')[paragraphIndex]);
  };



  const handleQuestStart = (name: string, className: string) => {
    setQuestParticipant({ name, className, startTime: Date.now() });
    setShowQuestIntro(false);
    setQuestState('playing');
  };

  const handleQuestGameOver = () => {
    setQuestState('gameover');
  };

  const handleQuestWin = () => {
    setQuestState('win');
  };

  const handleQuestPlayAgain = () => {
    setQuestState('intro');
    setQuestParticipant(null);
    setShowQuestIntro(true);
  };

  const saveQuestToLeaderboard = () => {
    if (!questParticipant) return;
    const elapsedSeconds = Math.round((Date.now() - questParticipant.startTime) / 1000);
    const dateStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const entry: OceanLeaderboardEntry = {
      name: questParticipant.name,
      className: questParticipant.className,
      time: elapsedSeconds,
      date: dateStr
    };

    const saved = localStorage.getItem('leaderboardNEW_WAYS_TO_LEARN');
    let existing: OceanLeaderboardEntry[] = saved ? JSON.parse(saved) : [];

    if (existing.length < 999) {
      existing.push(entry);
      localStorage.setItem('leaderboardNEW_WAYS_TO_LEARN', JSON.stringify(existing));
    }
  };

  // --- Views ---

  const renderHome = () => {
    const currentLevel = progress.level || 1;
    const pointsForCurrentLevel = 100 * Math.pow(currentLevel - 1, 2);
    const pointsForNextLevel = 100 * Math.pow(currentLevel, 2);
    const progressToNext = Math.min(100, Math.max(0,
      ((progress.totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100
    ));

    return (
      <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-r from-indigo-800 to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Welcome back! 👋</h1>
                <p className="text-indigo-200">Ready to unlock your potential?</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex flex-col items-center min-w-[90px]">
                <Award className="text-yellow-300 mb-1" size={32} />
                <span className="font-bold text-2xl">{currentLevel}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-200">Level</span>
              </div>
            </div>

            <div className="bg-black/20 p-5 rounded-2xl backdrop-blur-sm border border-white/5 mb-8">
              <div className="flex justify-between text-sm font-bold mb-3 text-indigo-100">
                <span>Level {currentLevel}</span>
                <span>{Math.round(progressToNext)}% to Level {currentLevel + 1}</span>
              </div>
              <div className="h-4 bg-indigo-900/50 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                />
              </div>
              <div className="mt-3 text-xs font-medium text-indigo-300 text-right">
                {Math.round(pointsForNextLevel - progress.totalPoints)} XP needed
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('learn')}
                className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-50 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2"
              >
                Start Learning <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setShowQuestIntro(true)}
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 border border-white/20"
              >
                <Trophy size={20} />
                <span>QUEST</span>
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 pointer-events-none">
            <Brain size={300} />
          </div>
        </div>

        {/* Learning Quest Card (Big Feature) */}
        <div
          onClick={() => setShowQuestIntro(true)}
          className="bg-white rounded-3xl p-8 shadow-lg border border-indigo-50 relative overflow-hidden cursor-pointer hover:shadow-xl hover:border-indigo-100 transition-all group"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <Map size={32} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">Learning Evolution Quest</h2>
              </div>
              <p className="text-slate-500 text-lg max-w-lg mb-6 leading-relaxed">
                Embark on a journey through 8 stages of educational evolution. Challenge yourself and become a Digital Learning Champion!
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  8 Stages
                </span>
                <span className="flex items-center gap-1 text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  Story Mode
                </span>
                <span className="text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Start Now <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
            <Trophy size={200} className="text-indigo-600 translate-x-10 translate-y-10" />
          </div>
        </div>
      </div>
    );
  };

  const renderGame = () => {
    if (!activeSession) return renderHome();
    const currentPassage = passages.find(p => p.id === activeSession.passageId);
    if (!currentPassage) return null;

    if (activeSession.isCompleted) {
      return (
        <div className="max-w-2xl mx-auto text-center pt-12 animate-in zoom-in duration-300">
          <div className="inline-block p-6 bg-emerald-100 rounded-full text-emerald-600 mb-6">
            <Award size={64} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Lesson Complete!</h2>
          <p className="text-slate-500 mb-8">You scored <span className="font-bold text-emerald-600">{activeSession.score}</span> points.</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-slate-400 mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-slate-800">
                {Math.round((Object.keys(activeSession.answers).filter(qId => {
                  const q = currentPassage.questions.find(ques => ques.id === qId);
                  return q && q.correctAnswerId === activeSession.answers[qId];
                }).length / currentPassage.questions.length) * 100)}%
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-slate-400 mb-1">Time</div>
              <div className="text-2xl font-bold text-slate-800">
                {Math.round((Date.now() - activeSession.startTime) / 1000 / 60)} min
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveSession(null)}
              className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => handleStartSession(currentPassage.id)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition-colors"
            >
              Retry Lesson
            </button>
          </div>
        </div>
      );
    }

    const currentQuestion = currentPassage.questions[currentQuestionIndex];
    const isAnswered = !!activeSession.answers[currentQuestion.id];

    return (
      <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 relative">
        <AnswerFeedback type={lastFeedbackType} />
        {/* Reading Pane */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10" />
          <div className="p-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 truncate flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                {currentPassage.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleHighlighter}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${isHighlighterActive
                  ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400 ring-offset-1'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                title="Toggle Highlighter"
              >
                <Highlighter size={16} />
                <span className="hidden sm:inline">Highlight</span>
              </button>
              <span className="text-xs font-bold font-mono bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100 uppercase tracking-wide">
                Reading Passage
              </span>
            </div>
          </div>
          <div
            className="p-8 overflow-y-auto custom-scrollbar flex-1 prose prose-slate max-w-none prose-lg prose-headings:text-indigo-900 prose-p:text-slate-800 prose-p:leading-loose font-medium"
            style={{
              backgroundImage: `
                linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.6)),
                url('/reading-bg.jpg.png?v=${Date.now()}')
              `,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {currentPassage.content.split('\n').map((paragraph, idx) => (
              <p
                key={idx}
                className={`mb-6 text-slate-800 leading-loose text-lg drop-shadow-sm ${isHighlighterActive ? 'cursor-text selection:bg-red-200 selection:text-red-900' : ''}`}
                onMouseUp={() => handleTextSelection(idx)}
              >
                {renderHighlightedText(paragraph.replace(/^# /, '').trim(), activeSession.passageId, idx)}
              </p>
            ))}
          </div>
        </div>

        {/* Question Pane */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-semibold text-slate-400">
                Question {currentQuestionIndex + 1} of {currentPassage.questions.length}
              </span>
              <div className="flex gap-1">
                {currentPassage.questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-2 rounded-full ${idx === currentQuestionIndex ? 'bg-indigo-600' :
                      idx < currentQuestionIndex ? 'bg-indigo-200' : 'bg-slate-200'
                      }`}
                  />
                ))}
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-6">{currentQuestion.text}</h3>

            <div className="space-y-3 flex-1">
              {currentQuestion.options.map(option => {
                const isSelected = activeSession.answers[currentQuestion.id] === option.id;
                const isCorrect = option.id === currentQuestion.correctAnswerId;

                let btnClass = "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex justify-between items-center ";

                if (showFeedback) {
                  if (isCorrect) btnClass += "bg-emerald-50 border-emerald-500 text-emerald-700 ";
                  else if (isSelected && !isCorrect) btnClass += "bg-red-50 border-red-500 text-red-700 ";
                  else btnClass += "bg-white border-slate-100 text-slate-400 opacity-50 ";
                } else {
                  btnClass += "bg-white border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 ";
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => !isAnswered && handleAnswer(option.id)}
                    disabled={isAnswered}
                    className={btnClass}
                  >
                    <span className="font-medium">{option.text}</span>
                    {showFeedback && isCorrect && <CheckCircle size={20} className="text-emerald-500" />}
                    {showFeedback && isSelected && !isCorrect && <XCircle size={20} className="text-red-500" />}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="mt-6 animate-in slide-in-from-bottom-2">
                {showExplanation && (
                  <div className="bg-indigo-50 p-4 rounded-lg text-sm text-indigo-800 mb-4 border border-indigo-100">
                    <p className="font-bold flex items-center gap-2 mb-1"><Brain size={16} /> Explanation:</p>
                    {currentQuestion.explanation}
                  </div>
                )}
                <button
                  onClick={nextQuestion}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
                >
                  {currentQuestionIndex === currentPassage.questions.length - 1 ? "Finish Lesson" : "Next Question"}
                </button>
              </div>
            )}
          </div>

          {/* AI Tutor Toggle */}
          <button
            onClick={() => setChatOpen(true)}
            className="bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between hover:bg-indigo-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg"><MessageCircle size={20} /></div>
              <div className="text-left">
                <div className="font-bold text-sm">Need help?</div>
                <div className="text-xs text-indigo-200">Ask the AI Tutor about this text</div>
              </div>
            </div>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart2 className="text-blue-500" /> Performance
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Mon', pts: 20 }, { name: 'Tue', pts: 45 }, { name: 'Wed', pts: 30 },
              { name: 'Thu', pts: 50 }, { name: 'Fri', pts: progress.totalPoints > 50 ? progress.totalPoints : 55 }
            ]}>
              <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
              <YAxis fontSize={12} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="pts" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Brain className="text-purple-500" /> Skills Breakdown
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Vocabulary', value: 400 },
                  { name: 'Inference', value: 300 },
                  { name: 'Main Idea', value: 300 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#60a5fa" />
                <Cell fill="#34d399" />
                <Cell fill="#f472b6" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">

      {/* LEARNING QUEST OVERLAYS */}
      {showQuestIntro && (
        <LearningQuestIntro
          onStart={handleQuestStart}
          onClose={() => setShowQuestIntro(false)}
        />
      )}

      {questState === 'playing' && (
        <div className="fixed inset-0 z-50 bg-white">
          <LearningQuestMap
            onGameOver={handleQuestGameOver}
            onWin={handleQuestWin}
          />
        </div>
      )}

      {questState === 'gameover' && (
        <LearningQuestGameOver
          onPlayAgain={handleQuestPlayAgain}
          onBackToMap={() => setQuestState('intro')}
        />
      )}

      {questState === 'win' && questParticipant && (
        <LearningQuestWin
          name={questParticipant.name}
          completionTime={Math.round((Date.now() - questParticipant.startTime) / 1000)}
          onPlayAgain={handleQuestPlayAgain}
          onLeaderboard={() => {
            saveQuestToLeaderboard();
            setQuestState('leaderboard');
          }}
        />
      )}

      {questState === 'leaderboard' && (
        <LearningQuestLeaderboard onClose={handleQuestPlayAgain} />
      )}


      {/* MAIN APP LAYOUT (Hidden if playing quest, or visible behind overlays) */}
      <div className={`transition-all ${questState === 'playing' ? 'blur-sm scale-95 opacity-50 pointer-events-none' : ''}`}>
        <Header
          points={progress.totalPoints}
          streak={progress.streakDays}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit">
            {['home', 'learn', 'stats'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'home' && renderHome()}
          {activeTab === 'learn' && renderGame()}
          {activeTab === 'stats' && renderStats()}
        </div>

        {/* Stats Footer (Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-30 flex justify-around shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col items-center text-slate-400">
            <span className="text-xs font-bold">Level</span>
            <span className="text-indigo-600 font-bold">{progress.level}</span>
          </div>
          <div className="flex flex-col items-center text-slate-400">
            <span className="text-xs font-bold">Streak</span>
            <span className="text-orange-500 font-bold">{progress.streakDays} 🔥</span>
          </div>
          <div className="flex flex-col items-center text-slate-400">
            <span className="text-xs font-bold">PTS</span>
            <span className="text-emerald-500 font-bold">{progress.totalPoints}</span>
          </div>
        </div>
      </div>

      {/* Chat UI */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-lg"><MessageCircle size={20} /></div>
                <div>
                  <h3 className="font-bold">AI Tutor</h3>
                  <p className="text-xs text-indigo-200">Ask about meanings, grammar, or summary</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors"><XCircle /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {chatMessages.length === 0 && (
                <div className="text-center text-slate-400 mt-10">
                  <p>👋 Hi! Im your AI Tutor.</p>
                  <p className="text-sm mt-2">Ask me anything about the lesson!</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-700 shadow-sm rounded-tl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomChatRef} />
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                placeholder="Type your question..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
              <button
                onClick={handleChat}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-3 rounded-xl shadow-xl text-white font-medium animate-in slide-in-from-right fade-in duration-300 flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">API Key (Gemini)</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => saveSettings({ ...settings, apiKey: e.target.value })}
                placeholder="Enter your Google Gemini API Key"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Required for AI features. Stored locally on your device.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => saveSettings({ ...settings, theme: 'light' })}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${settings.theme === 'light' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                Light
              </button>
              <button
                onClick={() => saveSettings({ ...settings, theme: 'dark' })}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${settings.theme === 'dark' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                Dark
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Sound Effects</label>
            <button
              onClick={() => saveSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`w-full py-2 px-4 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${settings.soundEnabled ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
            >
              {settings.soundEnabled ? '🔊 Enabled' : '🔇 Muted'}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-2 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Reset All Progress
            </button>
          </div>
        </div>
      </Modal>

      <LevelUpModal isOpen={levelUpModalOpen} level={progress.level} onClose={() => setLevelUpModalOpen(false)} />
    </div>
  );
}