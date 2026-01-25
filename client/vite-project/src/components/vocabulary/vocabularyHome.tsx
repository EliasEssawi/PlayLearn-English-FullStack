import GameCard from "./GameCard";
import TranslateGame from "./translate";
import { useState } from "react";

type ActiveGame = "home" | "translate" | "sentence";

export default function VocabularyHome() {
  const [activeGame, setActiveGame] = useState<ActiveGame>("home");

  //SHOW TRANSLATE GAME
  if (activeGame === "translate") {
    return (
      <>
        <TranslateGame />
        <button
          className="btn btn-secondary"
          onClick={() => setActiveGame("home")}
        >
          ← Back
        </button>
      </>
    );
  }

  //SHOW SENTENCE GAME
  if (activeGame === "sentence") {
    return (
      <>
        {/* <SentenceGame /> */}
        <button
          className="btn btn-secondary"
          onClick={() => setActiveGame("home")}
        >
          ← Back
        </button>
      </>
    );
  }

  
  return (
    <div className="page">
      <header className="header">
        <h1 className="header-title">Vocabulary Games</h1>
      </header>

      <section className="profiles-grid">
        <GameCard
          title="Translate"
          description="Choose the correct translation"
          emoji="🌍"
          onClick={() => setActiveGame("translate")}
        />

        <GameCard
          title="Complete Sentence"
          description="Fill in the missing word"
          emoji="✏️"
          onClick={() => setActiveGame("sentence")}
        />
      </section>
    </div>
  );
}
