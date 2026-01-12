import { useState } from "react";
import TopicCard, { TopicLevel } from "./TopicCard";

type Props = {
  exercisesType:string,

};

export default function TopicsPage({exercisesType}:Props ) {
  const [exeType,setExercisesType] = useState(exercisesType);

  const [progress, setProgress] = useState({
    animals: 2,
    weather: 1,
  });

  const handleLevelClick = (topic: string, levelId: number) => {
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

  return (
    <div className="min-h-screen bg-[#0f1b1f] p-6 space-y-8">
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
  );
}
