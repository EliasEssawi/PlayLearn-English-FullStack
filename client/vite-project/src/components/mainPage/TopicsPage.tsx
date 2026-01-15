import { useEffect, useState } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(0);

  const savedUserRaw = localStorage.getItem("loggedInUser");
  const profileStr = localStorage.getItem("activeProfile");

  if (!savedUserRaw || !profileStr) return null;

  const profile = JSON.parse(profileStr);
  if (!profile.email.profileName) return null;

  // Reset state when exercisesType changes
  useEffect(() => {
    setShowExe(false);
    setTopic("");
    setLevel(1);
    setQuestions([]);
    setCurrentIndex(0);
  }, [exercisesType]);

  const [progress, setProgress] = useState({
    animals: 2,
    weather: 1,
    transportation:3,
    jobs: 4,
    furniture: 5,
    colors: 6
  });

  const handleLevelClick = (topicName: string, levelId: number) => {
    setTopic(topicName);
    setLevel(levelId);
    setShowExe(true);

    let exeType = exercisesType;
    if(exercisesType === "Fill the blank")
      exeType = "complete"
    
    fetchQuestions(
      profile.email.profileName,
      topicName,
      levelId,
      exeType,
      10
    );

    setProgress((prev) => ({
      ...prev,
      [topicName]: Math.max(prev[topicName as keyof typeof prev], levelId + 1),
    }));
  };

  const fetchQuestions = async (
    profileName: string,
    topicParam: string,
    levelParam: number,
    type: string,
    numberOfQuestions: number
  ) => {
    try {
      type = type.toLowerCase();
      const res = await getProfileQuestions(profileName, levelParam, topicParam, type, numberOfQuestions);
      if (res.success) {
        setQuestions(res.questions);
        setCurrentIndex(0); // start from first question
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

  const transportationLevels: TopicLevel[] = [
    { id: 1, icon: "🚶" }, // walking
    { id: 2, icon: "🚲" }, // bicycle
    { id: 3, icon: "🚗" }, // car
    { id: 4, icon: "🚌" }, // public transport
    { id: 5, icon: "✈️" }, // air travel
  ];

  const jobsLevels: TopicLevel[] = [
    { id: 1, icon: "🧑‍🎓" }, // student
    { id: 2, icon: "🧑‍🍳" }, // cook
    { id: 3, icon: "🧑‍🔧" }, // mechanic
    { id: 4, icon: "🧑‍🏫" }, // teacher
    { id: 5, icon: "🧑‍💼" }, // office professional
  ];

  const furnitureLevels: TopicLevel[] = [
    { id: 1, icon: "🪑" }, // chair
    { id: 2, icon: "🛋" }, // sofa
    { id: 3, icon: "🛏" }, // bed
    { id: 4, icon: "🪟" }, // window
    { id: 5, icon: "🚪" }, // door
  ];

  const colorsLevels: TopicLevel[] = [
    { id: 1, icon: "🔴" }, // red
    { id: 2, icon: "🟡" }, // yellow
    { id: 3, icon: "🔵" }, // blue
    { id: 4, icon: "🟢" }, // green
    { id: 5, icon: "🟣" }, // purple
  ];

  const currentQuestion = questions[currentIndex];

  return (
    <div 
      className="min-h-screen p-6 space-y-8 transition-colors duration-300"
      style={{ 
        backgroundColor: darkMode ? "#020617" : "#f8fafc", 
        color: darkMode ? "#f8fafc" : "#0f172a" 
      }}
    >
      {/* Topics selection */}
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
            onLevelClick={(id) => handleLevelClick("environment", id)}
            darkMode={darkMode}
          />
          <TopicCard
            title="Transportation"
            emoji="🚗"
            levels={transportationLevels}
            unlockedLevel={progress.transportation}
            onLevelClick={(id) => handleLevelClick("transportation", id)}
            darkMode={darkMode}
          />

          <TopicCard
            title="Jobs"
            emoji="🧑‍🍳"
            levels={jobsLevels}
            unlockedLevel={progress.jobs}
            onLevelClick={(id) => handleLevelClick("jobs", id)}
            darkMode={darkMode}
          />

          <TopicCard
            title="Furniture"
            emoji="🚪"
            levels={furnitureLevels}
            unlockedLevel={progress.furniture}
            onLevelClick={(id) => handleLevelClick("furniture", id)}
            darkMode={darkMode}
          />

          <TopicCard
            title="Colors"
            emoji="🚪"
            levels={colorsLevels}
            unlockedLevel={progress.colors}
            onLevelClick={(id) => handleLevelClick("colors", id)}
            darkMode={darkMode}
          />
        </div>
      )}

      {/* Exercise */}
      {showExe && (
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => setShowExe(false)}
            className="mb-4 text-sm underline opacity-70 hover:opacity-100 transition-colors"
            style={{ color: darkMode ? "#94a3b8" : "#475569" }}
          >
            Back to Topics
          </button>

          {/* Fill in the blank / Translate / Reading */}
          {(exercisesType === "Translate" || exercisesType === "Fill the blank" || exercisesType === "Reading") &&
            currentQuestion && (
              <FillBlankGame
                title={`Question ${currentIndex + 1} / ${questions.length}`}
                question={currentQuestion.prompt}
                correctAnswer={currentQuestion.answer}
                options={currentQuestion.options}
                darkMode={darkMode}
                onContinue={(isCorrect) => {
                  console.log(`Question ${currentIndex + 1} answered:`, isCorrect);

                  if (currentIndex + 1 < questions.length) {
                    setCurrentIndex(prev => prev + 1); // go to next question
                  } else {
                    setShowExe(false); // finished all questions
                    console.log("Exercise finished!");
                  }
                }}
              />
            )
          }

          {/* Listening */}
          {exercisesType === "Listening" && currentQuestion && (
            <ListeningGame
              title={`Question ${currentIndex + 1} / ${questions.length}`}
              textToRead={currentQuestion.prompt}
              correctAnswer={currentQuestion.prompt}
              options={currentQuestion.options}
              darkMode={darkMode}
              onContinue={(isCorrect) => {
                  console.log(`Question ${currentIndex + 1} answered:`, isCorrect);

                  if (currentIndex + 1 < questions.length) {
                    setCurrentIndex(prev => prev + 1); // go to next question
                  } else {
                    setShowExe(false); // finished all questions
                    console.log("Exercise finished!");
                  }
                }}
            />
          )}

          {/* Talking */}
          {exercisesType === "Talking" && currentQuestion &&(
            <SpeakingGame
              title={`Question ${currentIndex + 1} / ${questions.length}`}
              answer={currentQuestion.prompt}
              onContinue={(isCorrect, spoken) => {
                  console.log(`Question ${currentIndex + 1} answered:`, isCorrect);

                  if (currentIndex + 1 < questions.length) {
                    setCurrentIndex(prev => prev + 1); // go to next question
                  } else {
                    setShowExe(false); // finished all questions
                    console.log("Exercise finished!");
                  }
                }}
              darkMode={darkMode}
            />
          )}
        </div>
      )}
    </div>
  );
}
