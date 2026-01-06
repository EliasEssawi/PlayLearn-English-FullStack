import GameCard from "./GameCard";

export default function VocabularyHome(){
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
          path="/vocabulary/translate"
        />

        <GameCard
          title="Complete Sentence"
          description="Fill in the missing word"
          emoji="✏️"
          path="/vocabulary/sentence"
        />
      </section>
    </div>
  );
}
