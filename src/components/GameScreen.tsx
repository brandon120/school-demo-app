import { useState, useEffect, useRef } from "react";
import type { GameState, LevelConfig } from "../types";
import PlaceValueHelper from "./PlaceValueHelper";
import { getExpandedBreakdown } from "../utils/problems";

interface GameScreenProps {
  game: GameState;
  level: LevelConfig;
  onAnswer: (correct: boolean) => void;
  onQuit: () => void;
}

export default function GameScreen({
  game,
  level,
  onAnswer,
  onQuit,
}: GameScreenProps) {
  const problem = game.problems[game.currentIndex];
  const [answer, setAnswer] = useState("");
  const [showPlaceValue, setShowPlaceValue] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAnswer("");
    setShowPlaceValue(false);
    setFeedback(null);
    inputRef.current?.focus();
  }, [game.currentIndex]);

  const progress = (game.currentIndex / game.problems.length) * 100;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAnswer = parseInt(answer, 10);
    if (isNaN(numAnswer)) return;

    let expected = problem.answer;
    if (problem.type === "missing-digit" && problem.missingPosition) {
      expected =
        problem.missingPosition === "a" ? problem.a : problem.b;
    }

    if (numAnswer === expected) {
      setFeedback("correct");
      setTimeout(() => {
        onAnswer(true);
      }, 1200);
    } else {
      setFeedback("wrong");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  function renderEquation() {
    if (problem.type === "word") return null;

    if (problem.type === "expanded") {
      const a = getExpandedBreakdown(problem.a);
      const b = getExpandedBreakdown(problem.b);
      return (
        <div className="equation expanded-equation">
          <div className="expanded-row">
            <span>{a.hundreds}</span>
            <span>+</span>
            <span>{a.tens}</span>
            <span>+</span>
            <span>{a.ones}</span>
          </div>
          <div className="expanded-row">
            <span>{b.hundreds}</span>
            <span>+</span>
            <span>{b.tens}</span>
            <span>+</span>
            <span>{b.ones}</span>
          </div>
          <div className="equation-line" />
          <div className="expanded-label">Add the parts!</div>
        </div>
      );
    }

    if (problem.type === "missing-digit") {
      const missing = problem.missingPosition;
      return (
        <div className="equation missing-equation">
          <span>{missing === "a" ? "?" : problem.a}</span>
          <span className="op">+</span>
          <span>{missing === "b" ? "?" : problem.b}</span>
          <span className="op">=</span>
          <span>{problem.answer}</span>
        </div>
      );
    }

    return (
      <div className="equation standard-equation">
        <div className="eq-row">
          <span className="eq-num">{problem.a}</span>
        </div>
        <div className="eq-row">
          <span className="eq-op">+</span>
          <span className="eq-num">{problem.b}</span>
        </div>
        <div className="equation-line" />
      </div>
    );
  }

  const questionLabel =
    problem.type === "word"
      ? problem.wordProblem
      : problem.type === "missing-digit"
        ? "Find the missing number!"
        : problem.type === "expanded"
          ? "What is the total?"
          : "What is the sum?";

  return (
    <div className="game-screen">
      <div className="game-top-bar">
        <button className="btn-quit" onClick={onQuit} type="button">
          ← Back
        </button>
        <div className="game-stats">
          <span className="stat">⭐ {game.score}</span>
          <span className="stat">🔥 {game.streak}</span>
          <span className="stat">
            {game.currentIndex + 1}/{game.problems.length}
          </span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="game-card">
        <div className="level-tag">
          {level.emoji} {level.title}
        </div>

        <p className="question-label">{questionLabel}</p>

        {problem.type === "word" && (
          <div className="word-equation">
            <span>{problem.a}</span>
            <span>+</span>
            <span>{problem.b}</span>
            <span>=</span>
            <span>?</span>
          </div>
        )}

        {renderEquation()}

        <form
          onSubmit={handleSubmit}
          className={`answer-form ${shake ? "shake" : ""} ${feedback === "correct" ? "celebrate" : ""}`}
        >
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            className="answer-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            disabled={feedback === "correct"}
            aria-label="Your answer"
          />
          <button
            type="submit"
            className="btn-submit"
            disabled={!answer || feedback === "correct"}
          >
            Check! ✓
          </button>
        </form>

        {feedback === "correct" && (
          <div className="feedback correct-feedback">
            <span className="feedback-emoji">🎉</span>
            <span>Awesome job, {game.playerName}!</span>
          </div>
        )}

        {feedback === "wrong" && (
          <div className="feedback wrong-feedback">
            <span className="feedback-emoji">💪</span>
            <span>Not quite — try again! You can do it!</span>
          </div>
        )}

        <div className="helper-buttons">
          <button
            type="button"
            className="btn-helper btn-helper-single"
            onClick={() => setShowPlaceValue(!showPlaceValue)}
          >
            🧱 {showPlaceValue ? "Hide Blocks" : "Place Value Blocks"}
          </button>
        </div>

        {showPlaceValue && (
          <PlaceValueHelper a={problem.a} b={problem.b} />
        )}
      </div>
    </div>
  );
}
