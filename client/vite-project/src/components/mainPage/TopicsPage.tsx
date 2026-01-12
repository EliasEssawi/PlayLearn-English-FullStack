import { useState } from "react";
import TopicCard, { TopicLevel } from "./TopicCard";
import QuestionCardWithOptions from "./QuestionCardWithOptions"
import FillBlankGame from "./FillBlankGame";
import ListeningGame from "./ListeningGame";
import SpeakingGame from "./SpeakingGame";

type Props = {
  exercisesType:string,

};

export default function TopicsPage({exercisesType}:Props ) {
  const [exeType,setExercisesType] = useState(exercisesType);
  const [topic,setTopic] = useState("");
  const [level,setLevel] = useState(1);
  const [showExe, setShowExe] = useState<true|false>(false);


  const [progress, setProgress] = useState({
    animals: 2,
    weather: 1,
  });

  const handleLevelClick = (topic: string, levelId: number) => {
    console.log(topic + "" + levelId);
    setTopic(topic);
    setLevel(levelId);
    setShowExe(true);
    setProgress((prev) => ({
      ...prev,
      [topic]: Math.max(prev[topic as keyof typeof prev], levelId + 1),
    }));
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

  const handleAnswer = (isCorrect: boolean) => {
    console.log(isCorrect ? "Correct!" : "Wrong!");
  };

  return (
    <div className="min-h-screen bg-[#0f1b1f] p-6 space-y-8">
      {!showExe && (
          <div>
            <TopicCard
              title="Animals"
              emoji="🐾"
              levels={animalsLevels}
              unlockedLevel={progress.animals}
              onLevelClick={(id) => handleLevelClick("animals", id)}
            />

            <TopicCard
              title="Weather"
              emoji="🌦"
              levels={weatherLevels}
              unlockedLevel={progress.weather}
              onLevelClick={(id) => handleLevelClick("weather", id)}
            />
          </div>
        )}

        {showExe && (
          <>
            {(exercisesType === "Translate" || exercisesType === "Fill the blank" || exercisesType === "Reading") && <FillBlankGame
                title="Fill the blank:"
                question={"bob"}
                correctAnswer="barber"
                options={["barber", "shop", "sea", "cut"]}
              />
            }

            {exercisesType === "Listening" && <ListeningGame
                textToRead="boost your energy"
                correctAnswer="boost your energy"
                options={["boost your energy", "change your password", "saleeem"]}
              />
            }

            {exercisesType === "Talking" && <SpeakingGame
                answer="I want to boost my energy"
                onContinue={(correct, spoken) => {
                  console.log(correct, spoken)
                }}
              />
            }
          </>
        )}
     </div>
  );
}
