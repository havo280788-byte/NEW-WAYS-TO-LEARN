export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE'
}

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
  correctAnswerId: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Passage {
  id: string;
  title: string;
  content: string; // Markdown or plain text
  questions: Question[];
  topic: string;
  estimatedTime: number; // in minutes
}

export interface TimeAttackStats {
  bestScore: number;
  bestTime: number; // Max time survived or questions answered
  gamesPlayed: number;
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  timeAttackStats?: TimeAttackStats;
  completedPassages: string[];
  streakDays: number;
  lastActiveDate: string;
  accuracy: number; // 0-100
  totalQuestionsAnswered: number;
  weakTopics: string[];
}

export interface GameSession {
  passageId: string;
  answers: Record<string, string>; // questionId -> optionId
  score: number;
  startTime: number;
  isCompleted: boolean;
}

export interface AppSettings {
  apiKey: string;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  selectedModel: string;
}

export const MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash'
];

export interface QuestParticipant {
  name: string;
  className: string; // 'class' is reserved
  startTime: number;
}

export interface QuestLeaderboardEntry {
  id?: string; // Firestore Doc ID
  name: string;
  className: string;
  time: number; // seconds
  score: number; // Max 80
  date: string; // YYYY-MM-DD HH:MM
}