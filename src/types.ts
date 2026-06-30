export type GameMode =
  | "place-value"
  | "no-regroup"
  | "regroup"
  | "word-problems"
  | "mixed";

export type ProblemType =
  | "standard"
  | "expanded"
  | "word"
  | "missing-digit";

export interface Problem {
  id: string;
  type: ProblemType;
  a: number;
  b: number;
  answer: number;
  wordProblem?: string;
  missingPosition?: "a" | "b" | "answer";
  hint: string;
  needsRegroup: boolean;
}

export interface LevelConfig {
  id: GameMode;
  title: string;
  emoji: string;
  description: string;
  standard: string;
  questions: number;
}

export interface GameState {
  mode: GameMode;
  problems: Problem[];
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  correct: number;
  playerName: string;
}

export interface StudentReportInput {
  studentName: string;
  levelTitle: string;
  levelEmoji: string;
  mode: GameMode;
  correct: number;
  total: number;
  accuracy: number;
  score: number;
  stars: number;
  bestStreak: number;
}
