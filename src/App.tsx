import { useState, useCallback } from "react";
import WelcomeScreen from "./components/WelcomeScreen";
import GameScreen from "./components/GameScreen";
import ResultsScreen from "./components/ResultsScreen";
import TeacherPanel from "./components/TeacherPanel";
import { generateProblems } from "./utils/problems";
import type { GameMode, GameState, LevelConfig } from "./types";

const LEVELS: LevelConfig[] = [
  {
    id: "place-value",
    title: "Place Value Power",
    emoji: "🧱",
    description: "Add using expanded form — hundreds, tens, and ones!",
    standard: "Place value strategies",
    questions: 5,
  },
  {
    id: "no-regroup",
    title: "Easy Street",
    emoji: "🛤️",
    description: "Add 3-digit numbers with no regrouping needed.",
    standard: "Without regrouping",
    questions: 5,
  },
  {
    id: "regroup",
    title: "Regrouping Rescue",
    emoji: "🦸",
    description: "Carry ones and tens when columns add up to 10 or more!",
    standard: "With regrouping",
    questions: 5,
  },
  {
    id: "word-problems",
    title: "Story Time Math",
    emoji: "📖",
    description: "Solve real-world word problems with 3-digit addition.",
    standard: "Word problems",
    questions: 5,
  },
  {
    id: "mixed",
    title: "Mix Master Challenge",
    emoji: "🎯",
    description: "A fun mix of everything — the ultimate review!",
    standard: "Mixed review",
    questions: 8,
  },
];

type Screen = "welcome" | "game" | "results";

function createInitialGame(mode: GameMode, playerName: string): GameState {
  const level = LEVELS.find((l) => l.id === mode)!;
  return {
    mode,
    problems: generateProblems(mode, level.questions),
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    playerName,
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [playerName, setPlayerName] = useState("");
  const [game, setGame] = useState<GameState | null>(null);
  const [teacherLoggedIn, setTeacherLoggedIn] = useState(false);

  const currentLevel = game ? LEVELS.find((l) => l.id === game.mode)! : null;

  const startGame = useCallback(
    (mode: GameMode) => {
      setGame(createInitialGame(mode, playerName.trim()));
      setScreen("game");
    },
    [playerName],
  );

  const handleAnswer = useCallback((correct: boolean) => {
    setGame((prev) => {
      if (!prev) return prev;

      const newStreak = correct ? prev.streak + 1 : 0;
      const basePoints = correct ? 100 : 0;
      const streakBonus = correct ? newStreak * 10 : 0;
      const points = basePoints + streakBonus;

      const updated: GameState = {
        ...prev,
        score: prev.score + (correct ? points : 0),
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        correct: prev.correct + (correct ? 1 : 0),
        currentIndex: prev.currentIndex + 1,
      };

      if (updated.currentIndex >= prev.problems.length) {
        setTimeout(() => setScreen("results"), 0);
      }

      return updated;
    });
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (!game) return;
    setGame(createInitialGame(game.mode, game.playerName));
    setScreen("game");
  }, [game]);

  return (
    <div className="app">
      <TeacherPanel
        isLoggedIn={teacherLoggedIn}
        onLogin={() => setTeacherLoggedIn(true)}
        onLogout={() => setTeacherLoggedIn(false)}
      />

      {!teacherLoggedIn && (
        <>
          {screen === "welcome" && (
            <WelcomeScreen
              playerName={playerName}
              onNameChange={setPlayerName}
              levels={LEVELS}
              onStart={startGame}
            />
          )}

          {screen === "game" &&
            game &&
            currentLevel &&
            game.currentIndex < game.problems.length && (
              <GameScreen
                game={game}
                level={currentLevel}
                onAnswer={handleAnswer}
                onQuit={() => setScreen("welcome")}
              />
            )}

          {screen === "results" && game && currentLevel && (
            <ResultsScreen
              game={game}
              level={currentLevel}
              onPlayAgain={handlePlayAgain}
              onChooseLevel={() => setScreen("welcome")}
            />
          )}
        </>
      )}
    </div>
  );
}
