import React, { useState } from "react";
import TranslateQuestion from "./TranslateQuestion";

type Question = {
  word: string;
  correct: string;
  options: string[];
};

const QUESTIONS: Question[] = [
  {
    word: "Dog",
    correct: "כלב",
    options: ["חתול", "כלב", "ציפור", "סוס"],
  },
  {
    word: "Apple",
    correct: "תפוח",
    options: ["בננה", "תפוח", "ענב", "אגס"],
  },
  {
    word: "House",
    correct: "בית",
    options: ["עץ", "אוטו", "בית", "ספר"],
  },
];

const TranslateGame: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (answer: string) => {
    const current = QUESTIONS[index];

    if (answer === current.correct) {
      setScore((s) => s + 10);
    }

    if (index + 1 < QUESTIONS.length) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <h1 className="header-title">Translate Game</h1>
      </header>

      {/* ✅ WHITE CARD */}
      <div className="translate-card">
        {!finished ? (
          <>
            <div className="translate-score">
              Score: {score}
            </div>

            <TranslateQuestion
              question={QUESTIONS[index]}
              onAnswer={handleAnswer}
            />
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <h2>🎉 Great Job!</h2>
            <p>
              Your score: <strong>{score}</strong>
            </p>

            <button
              className="btn btn-primary"
              onClick={() => {
                setIndex(0);
                setScore(0);
                setFinished(false);
              }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslateGame;
