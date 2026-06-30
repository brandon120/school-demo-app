import type { LevelConfig } from "../types";

interface WelcomeScreenProps {
  playerName: string;
  onNameChange: (name: string) => void;
  levels: LevelConfig[];
  onStart: (levelId: LevelConfig["id"]) => void;
}

export default function WelcomeScreen({
  playerName,
  onNameChange,
  levels,
  onStart,
}: WelcomeScreenProps) {
  return (
    <div className="welcome">
      <header className="welcome-header">
        <div className="mascot" aria-hidden="true">
          🐻
        </div>
        <h1>Addition Adventure!</h1>
        <p className="tagline">
          Master 3-digit addition with Foxy the Math Fox
        </p>
        <div className="standard-badge">
          <span>📚</span>
          <span>
            Aligned to Arkansas Standard <strong>3.CAR.1</strong> — Add &
            subtract 3-digit numbers using place value strategies
          </span>
        </div>
      </header>

      <div className="name-input-wrap">
        <label htmlFor="player-name">What's your name?</label>
        <input
          id="player-name"
          type="text"
          placeholder="Type your name here..."
          value={playerName}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={20}
        />
      </div>

      <section className="level-grid">
        <h2>Choose Your Adventure</h2>
        <div className="levels">
          {levels.map((level) => (
            <button
              key={level.id}
              className="level-card"
              onClick={() => onStart(level.id)}
              disabled={!playerName.trim()}
            >
              <span className="level-emoji">{level.emoji}</span>
              <span className="level-title">{level.title}</span>
              <span className="level-desc">{level.description}</span>
              <span className="level-meta">
                {level.questions} questions · {level.standard}
              </span>
            </button>
          ))}
        </div>
      </section>

      {!playerName.trim() && (
        <p className="name-hint">Enter your name to start playing!</p>
      )}
    </div>
  );
}
