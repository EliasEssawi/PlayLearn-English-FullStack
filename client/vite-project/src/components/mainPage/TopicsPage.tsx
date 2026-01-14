import { useState } from "react";
import TopicCard, { TopicLevel } from "./TopicCard";
import FillBlankGame from "./FillBlankGame";
import ListeningGame from "./ListeningGame";
import SpeakingGame from "./SpeakingGame";
import { getProfileQuestions, Question } from "../../utils/questionService";

type Props = {
  exercisesType: string;
  darkMode: boolean; 
};

export default function TopicsPage({ exercisesType, darkMode }: Props) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState(1);
  const [showExe, setShowExe] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [progress, setProgress] = useState({
    animals: 2,
    weather: 1,
  });

  const handleLevelClick = (topic: string, levelId: number) => {
    setTopic(topic);
    setLevel(levelId);
    setShowExe(true);

    // pass dynamic values
    fetchQuestions("default", topic, levelId, exercisesType === "Fill the blank" ? "complete" : "otherType"); 

    setProgress((prev) => ({
      ...prev,
      [topic]: Math.max(prev[topic as keyof typeof prev], levelId + 1),
    }));
  };

  const fetchQuestions = async (
    profileName: string,
    topicParam: string,
    levelParam: number,
    type: string = "complete",
    numberOfQuestions: number = 5
  ) => {
    try {
      const res = await getProfileQuestions(profileName, levelParam, topicParam, type, numberOfQuestions);
      if (res.success) {
        setQuestions(res.questions);
      } else {
        console.error(res.message);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };


  const animalsLevels: TopicLevel[] = [
    { id: 1, icon: "⭐" },
    { id: 2, icon: "🐶" },
    { id: 3, icon: "🐱" },
    { id: 4, icon: "🐘" },
    { id: 5, icon: "🏆" },
  ];

  const weatherLevels: TopicLevel[] = [
    { id: 1, icon: "☀️" },
    { id: 2, icon: "🌤" },
    { id: 3, icon: "🌧" },
    { id: 4, icon: "⛈" },
    { id: 5, icon: "❄️" },
  ];

  return (
    <div 
      className="min-h-screen p-6 space-y-8 transition-colors duration-300"
      style={{ 
        backgroundColor: darkMode ? "#020617" : "#f8fafc", 
        color: darkMode ? "#f8fafc" : "#0f172a" 
      }}
    >
      {!showExe && (
        <div className="space-y-6">
          <TopicCard
            title="Animals"
            emoji="🐾"
            levels={animalsLevels}
            unlockedLevel={progress.animals}
            onLevelClick={(id) => handleLevelClick("animals", id)}
            darkMode={darkMode} 
          />

          <TopicCard
            title="Weather"
            emoji="🌦"
            levels={weatherLevels}
            unlockedLevel={progress.weather}
            onLevelClick={(id) => handleLevelClick("weather", id)}
            darkMode={darkMode}
          />
        </div>
      )}

      {showExe && (
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => setShowExe(false)}
            className="mb-4 text-sm underline opacity-70 hover:opacity-100 transition-colors"
            style={{ color: darkMode ? "#94a3b8" : "#475569" }}
          >
            Back to Topics
          </button>

          {(exercisesType === "Translate" || exercisesType === "Fill the blank" || exercisesType === "Reading") && (
            <FillBlankGame
              title="Fill the blank:"
              question={"bob"}
              correctAnswer="barber"
              options={["barber", "shop", "sea", "cut"]}
              darkMode={darkMode} 
            />
          )}

          {exercisesType === "Listening" && (
            <ListeningGame
              textToRead="boost your energy"
              correctAnswer="boost your energy"
              options={["boost your energy", "change your password", "saleeem"]}
              darkMode={darkMode} // הוספנו כאן
            />
          )}

          {exercisesType === "Talking" && (
            <SpeakingGame
              answer="I want to boost my energy"
              onContinue={(correct, spoken) => {
                console.log(correct, spoken);
              }}
              darkMode={darkMode} // הוספנו כאן
            />
          )}
        </div>
      )}
    </div>
  );
}