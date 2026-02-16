import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Award, BarChart2, Settings, Brain, ChevronRight,
  CheckCircle, XCircle, RefreshCw, MessageCircle, Clock, Key, LogOut, Zap
} from './components/GameIcons';
import { TimeAttackGame } from './components/TimeAttackGame';
import useSound from 'use-sound';
import { AnswerFeedback, LevelUpModal } from './components/GameFeedback';
import { DEFAULT_PASSAGES, INITIAL_PROGRESS, SOUNDS } from './constants';
import { AppSettings, Passage, UserProgress, GameSession, Question, QuestionType, MODELS } from './types';
import { GeminiService } from './services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
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
        <div className="bg-blue-600 text-white p-2 rounded-lg">
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
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'stats' | 'time-attack'>('home');
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

  // Sounds
  const [playCorrect] = useSound(SOUNDS.correct);
  const [playIncorrect] = useSound(SOUNDS.incorrect);
  const [playLevelUp] = useSound(SOUNDS.levelUp);
  // const [playClick] = useSound(SOUNDS.click); // Optional for buttons

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

    // Level Calculation: Level 1 + sqrt(points / 100)
    // 0pts = L1, 100pts = L2, 400pts = L3, 900pts = L4
    const newLevel = 1 + Math.floor(Math.sqrt(newProgress.totalPoints / 100));

    if (newLevel > (newProgress.level || 1)) {
      newProgress.level = newLevel;
      if (settings.soundEnabled) playLevelUp();
      setLevelUpModalOpen(true);
    } else {
      // Ensure level is set even if not leveling up (migration)
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
      // showToast('Correct! +10 Points', 'success'); // Replaced by AnswerFeedback
    } else {
      if (settings.soundEnabled) playIncorrect();
      setLastFeedbackType('incorrect');
      // showToast('Incorrect. Try to review.', 'error'); // Replaced by AnswerFeedback
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
            correctAnswerId: q.correctAnswerId.toString(), // ensure string
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

  const handleTimeAttackComplete = (score: number) => {
    updateProgress(score, false);
    setActiveTab('home');
    showToast(`Time Attack Complete! +${score} pts`, 'success');
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
                <p className="text-blue-100">Ready to master "New Ways to Learn"?</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/20 flex flex-col items-center min-w-[80px]">
                <Award className="text-yellow-300 mb-1" size={28} />
                <span className="font-bold text-xl">{currentLevel}</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Level</span>
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 mb-6">
              <div className="flex justify-between text-sm font-medium mb-2 text-blue-100">
                <span>Level {currentLevel}</span>
                <span>{Math.round(progressToNext)}% to Level {currentLevel + 1}</span>
              </div>
              <div className="h-3 bg-indigo-900/40 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                />
              </div>
              <div className="mt-2 text-xs text-blue-200 text-right">
                {Math.round(pointsForNextLevel - progress.totalPoints)} pts needed
              </div>
            </div>

            <button
              onClick={() => setActiveTab('learn')}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-50 transition-transform active:scale-95 flex items-center gap-2"
            >
              Start Learning <ChevronRight size={20} />
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
            <Brain size={240} />
          </div>
        </div>

        {/* Time Attack Card */}
        <div
          onClick={() => setActiveTab('time-attack')}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-yellow-200" size={24} />
                <h2 className="text-2xl font-bold">Time Attack Mode</h2>
              </div>
              <p className="text-amber-100 max-w-sm">Race against the clock! Answer as many questions as you can in 60 seconds.</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <ChevronRight size={32} />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
            <Clock size={120} />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Available Lessons</h2>
            <button
              onClick={handleGenerateQuiz}
              disabled={isLoading}
              className="text-sm bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 flex items-center gap-2 transition-colors"
            >
              {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <Brain size={16} />}
              Generate with AI
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {passages.map(passage => {
              const isCompleted = progress.completedPassages.includes(passage.id);
              return (
                <div key={passage.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" onClick={() => handleStartSession(passage.id)}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded">{passage.topic}</span>
                    {isCompleted && <CheckCircle size={20} className="text-emerald-500" />}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{passage.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{passage.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>{passage.questions.length} Questions</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-colors"
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
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <h3 className="font-bold text-slate-700 truncate">{currentPassage.title}</h3>
            <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">Text</span>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 prose prose-slate max-w-none">
            {currentPassage.content.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 text-slate-600 leading-relaxed text-lg">
                {paragraph.replace(/^# /, '').trim()}
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
                    className={`h-2 w-2 rounded-full ${idx === currentQuestionIndex ? 'bg-blue-600' :
                      idx < currentQuestionIndex ? 'bg-blue-200' : 'bg-slate-200'
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
                  btnClass += "bg-white border-slate-100 hover:border-blue-300 hover:bg-blue-50 text-slate-700 ";
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
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4 border border-blue-100">
                    <p className="font-bold flex items-center gap-2 mb-1"><Brain size={16} /> Explanation:</p>
                    {currentQuestion.explanation}
                  </div>
                )}
                <button
                  onClick={nextQuestion}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
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
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-xl text-white font-medium animate-in slide-in-from-right fade-in duration-300 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
          {toast.message}
        </div>
      )}

      <LevelUpModal isOpen={levelUpModalOpen} level={progress.level} onClose={() => setLevelUpModalOpen(false)} />

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">API Key (Gemini)</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="password"
                value={settings.apiKey}
                onChange={(e) => saveSettings({ ...settings, apiKey: e.target.value })}
                placeholder="Enter your Google Gemini API Key"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Get your key from Google AI Studio. Stored locally.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">AI Model</label>
            <select
              value={settings.selectedModel}
              onChange={(e) => saveSettings({ ...settings, selectedModel: e.target.value })}
              className="w-full p-2 border rounded-lg text-sm bg-white"
            >
              {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-slate-700">Sound Effects</span>
            <button
              onClick={() => saveSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full mt-4 flex items-center justify-center gap-2 text-red-500 text-sm hover:bg-red-50 p-2 rounded transition-colors"
          >
            <LogOut size={16} /> Reset App Data
          </button>
        </div>
      </Modal>

      {/* Chat Drawer */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setChatOpen(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full md:w-[400px] bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Brain size={20} />
                <h3 className="font-bold">AI Tutor</h3>
              </div>
              <button onClick={() => setChatOpen(false)}><XCircle /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {chatMessages.length === 0 && (
                <div className="text-center text-slate-400 mt-10">
                  <p>👋 Hi! Ask me anything about the reading.</p>
                  <p className="text-xs mt-2">Example: "Explain 'blended learning' simply."</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border rounded-tl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={bottomChatRef} />
            </div>
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                  placeholder="Ask a question..."
                  className="flex-1 border rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  onClick={handleChat}
                  className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Header
        points={progress.totalPoints}
        streak={progress.streakDays}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'learn' && renderGame()}
        {activeTab === 'time-attack' && (
          <TimeAttackGame
            passages={passages}
            onComplete={handleTimeAttackComplete}
            onExit={() => setActiveTab('home')}
          />
        )}
        {activeTab === 'stats' && renderStats()}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 md:hidden flex justify-around items-center h-16 z-40">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <BookOpen size={20} />
          <span className="text-xs font-medium">Learn</span>
        </button>
        <button
          onClick={() => {
            if (activeSession) setActiveTab('learn');
            else showToast('Select a lesson first', 'error');
          }}
          className="bg-blue-600 text-white -mt-8 p-4 rounded-full shadow-lg border-4 border-slate-50"
        >
          <ChevronRight size={24} />
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'stats' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <BarChart2 size={20} />
          <span className="text-xs font-medium">Progress</span>
        </button>
      </nav>
    </div>
  );
}