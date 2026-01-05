import GameCard from "../../components/vocabulary/GameCard";

const VocabularyHome = () => {
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
          title="Choose Picture"
          description="Pick the correct image"
          emoji="🖼️"
          path="/vocabulary/picture"
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
};

export default VocabularyHome;
