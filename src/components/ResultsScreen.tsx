import { useEffect, useRef } from "react";
import type { GameState, LevelConfig } from "../types";
import { saveReport, type ReportInput } from "../utils/reports";

interface ResultsScreenProps {
  game: GameState;
  level: LevelConfig;
  onPlayAgain: () => void;
  onChooseLevel: () => void;
}

function getStars(correct: number, total: number): number {
  const pct = correct / total;
  if (pct >= 1) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.4) return 1;
  return 0;
}

function getMessage(stars: number, name: string): string {
  if (stars === 3) return `Wow ${name}! You're a 3-digit addition superstar! 🌟`;
  if (stars === 2) return `Great work ${name}! You're getting stronger every round! 💪`;
  if (stars === 1) return `Good effort ${name}! Keep practicing — you've got this! 🦊`;
  return `Nice try ${name}! Every mistake helps you learn. Let's go again! 🌈`;
}

export default function ResultsScreen({
  game,
  level,
  onPlayAgain,
  onChooseLevel,
}: ResultsScreenProps) {
  const stars = getStars(game.correct, game.problems.length);
  const accuracy = Math.round((game.correct / game.problems.length) * 100);
  const reportSaved = useRef(false);

  useEffect(() => {
    if (reportSaved.current) return;
    reportSaved.current = true;

    const reportData: ReportInput = {
      studentName: game.playerName,
      levelTitle: level.title,
      levelEmoji: level.emoji,
      mode: game.mode,
      correct: game.correct,
      total: game.problems.length,
      accuracy,
      score: game.score,
      stars,
      bestStreak: game.bestStreak,
    };

    saveReport(reportData).catch(() => {
      // Report submission failed silently — game still works for the student
    });
  }, [game, level, accuracy, stars]);

  return (
    <div className="results-screen">
      <div className="results-card">
        <div className="results-mascot" aria-hidden="true">
          {stars >= 2 ? "🏆" : "🦊"}
        </div>
        <h2>Adventure Complete!</h2>
        <p className="results-level">
          {level.emoji} {level.title}
        </p>

        <div className="stars-display">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`star ${s <= stars ? "star-filled" : "star-empty"}`}
            >
              ★
            </span>
          ))}
        </div>

        <p className="results-message">{getMessage(stars, game.playerName)}</p>

        <div className="results-stats">
          <div className="result-stat">
            <span className="result-stat-value">{game.correct}/{game.problems.length}</span>
            <span className="result-stat-label">Correct</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-value">{accuracy}%</span>
            <span className="result-stat-label">Accuracy</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-value">{game.score}</span>
            <span className="result-stat-label">Points</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-value">{game.bestStreak}</span>
            <span className="result-stat-label">Best Streak</span>
          </div>
        </div>

        <div className="results-actions">
          <button className="btn-primary" onClick={onPlayAgain}>
            Play Again 🔄
          </button>
          <button className="btn-secondary" onClick={onChooseLevel}>
            Choose Another Level 🗺️
          </button>
        </div>

        <p className="standards-note">
          Skills practiced: place value, regrouping, expanded form, word
          problems — Arkansas 3.CAR.1
        </p>
      </div>
    </div>
  );
}
