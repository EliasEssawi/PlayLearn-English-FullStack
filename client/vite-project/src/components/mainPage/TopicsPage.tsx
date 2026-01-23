import { useEffect, useRef, useState } from "react";
import TopicCard, { TopicLevel } from "./TopicCard";
import FillBlankGame from "./FillBlankGame";
import ListeningGame from "./ListeningGame";
import SpeakingGame from "./SpeakingGame";
import { getProfileQuestions, Question, saveProgress, getProgress  } from "../../utils/questionService";

type Props = {
  exercisesType: string;
  darkMode: boolean;
};

export default function TopicsPage({ exercisesType, darkMode }: Props) {
  const savingRef = useRef(false);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState(1);
  const [showExe, setShowExe] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const questionStartRef = useRef<number>(Date.now());
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const savedUserRaw = localStorage.getItem("loggedInUser");
  const profileStr = localStorage.getItem("activeProfile");

  if (!savedUserRaw || !profileStr) return null;

 const profileObj = JSON.parse(profileStr);

const profileName =
  profileObj.profileName ?? profileObj.email?.profileName;

if (!profileName) return null;

  // Reset state when exercisesType changes
  useEffect(() => {
    setShowExe(false);
    setTopic("");
    setLevel(1);
    setQuestions([]);
    setCurrentIndex(0);
  }, [exercisesType]);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentIndex]);

  useEffect(() => {
  const load = async () => {
    try {
      
      const res = await getProgress(profileName);
      if (res.success) {
        setProgress(res.unlocked || {});
        console.log("GET PROGRESS RES:", res);
      }
    } catch (e) {
      console.error("Failed to load progress", e);
    }
  };
  load();
}, [profileName]);

  const [progress, setProgress] = useState<Record<string, number>>({});

  const normalizeType = (t: string) => {
    if (t === "Fill the blank") return "complete";
    return t.toLowerCase(); // Talking -> talking, Listening -> listening, etc.
  };

  const keyFor = (topicName: string) => `${topicName}|${normalizeType(exercisesType)}`;

  
const handleLevelClick = (topicName: string, levelId: number) => {
  const key = keyFor(topicName);
  const unlocked = progress[key] ?? 1;

  if (levelId > unlocked) return; //  don't allow opening locked level

  setTopic(topicName);
  setLevel(levelId);
  setShowExe(true);

  const exeType = normalizeType(exercisesType);
  fetchQuestions(profileName, topicName, levelId, exeType, 10);
};
const fetchQuestions = async (
  profileName: string,
  topicParam: string,
  levelParam: number,
  type: string,
  numberOfQuestions: number
) => {
  try {
    const data = await getProfileQuestions(
      profileName,
      levelParam,
      topicParam,
      type,
      numberOfQuestions
    );

    if (!data.success) {
      console.error(data.message);
      return;
    }

    setQuestions(data.questions ?? []);
    setCurrentIndex(0);

    // ✅ THIS is where isCompleted is USED
    if (data.isCompleted === true) {
      const key = `${topicParam}|${type}`;
      setCompleted((prev) => ({
        ...prev,
        [key]: Math.max(prev[key] ?? 0, levelParam),
      }));
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
    { id: 1, icon: "🚶" },
    { id: 2, icon: "🚲" },
    { id: 3, icon: "🚗" },
    { id: 4, icon: "🚌" },
    { id: 5, icon: "✈️" },
  ];

  const jobsLevels: TopicLevel[] = [
    { id: 1, icon: "🧑‍🎓" },
    { id: 2, icon: "🧑‍🍳" },
    { id: 3, icon: "🧑‍🔧" },
    { id: 4, icon: "🧑‍🏫" },
    { id: 5, icon: "🧑‍💼" },
  ];

  const furnitureLevels: TopicLevel[] = [
    { id: 1, icon: "🪑" },
    { id: 2, icon: "🛋" },
    { id: 3, icon: "🛏" },
    { id: 4, icon: "🪟" },
    { id: 5, icon: "🚪" },
  ];

  const colorsLevels: TopicLevel[] = [
    { id: 1, icon: "🔴" },
    { id: 2, icon: "🟡" },
    { id: 3, icon: "🔵" },
    { id: 4, icon: "🟢" },
    { id: 5, icon: "🟣" },
  ];

  const currentQuestion = questions[currentIndex];

  return (
    <div
      className="min-h-screen p-6 space-y-8 transition-colors duration-300"
      style={{
        backgroundColor: darkMode ? "#020617" : "#f8fafc",
        color: darkMode ? "#f8fafc" : "#0f172a",
      }}
    >
      {/* Topics selection */}
      {!showExe && (
        <div className="space-y-6">
          <TopicCard
            title="Animals"
            emoji="🐾"
            levels={animalsLevels}
            unlockedLevel={progress[keyFor("animals")] ?? 1}
            onLevelClick={(id) => handleLevelClick("animals", id)}
            darkMode={darkMode}
          />

          <TopicCard
            title="Weather"
            emoji="🌦"
            levels={weatherLevels}
            unlockedLevel={progress[keyFor("weather")] ?? 1}
            onLevelClick={(id) => handleLevelClick("weather", id)}
            darkMode={darkMode}
          />

          <TopicCard
            title="Transportation"
            emoji="🚗"
            levels={transportationLevels}
            unlockedLevel={progress[keyFor("transportation")] ?? 1}
            onLevelClick={(id) => handleLevelClick("transportation", id)}
            darkMode={darkMode}
          />

          <TopicCard
            title="Jobs"
            emoji="🧑‍🍳"
            levels={jobsLevels}
            unlockedLevel={progress[keyFor("jobs")] ?? 1}
            onLevelClick={(id) => handleLevelClick("jobs", id)}
            darkMode={darkMode}
          />

          <TopicCard
            title="Furniture"
            emoji="🚪"
            levels={furnitureLevels}
            unlockedLevel={progress[keyFor("furniture")] ?? 1}
            onLevelClick={(id) => handleLevelClick("furniture", id)}
            darkMode={darkMode}
          />

          <TopicCard
            title="Colors"
            emoji="🎨"
            levels={colorsLevels}
            unlockedLevel={progress[keyFor("colors")] ?? 1}
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
          {(exercisesType === "Translate" ||
            exercisesType === "Fill the blank" ||
            exercisesType === "Reading") &&
            currentQuestion && (
              <FillBlankGame
                title={`Question ${currentIndex + 1} / ${questions.length}`}
                question={currentQuestion.prompt}
                correctAnswer={currentQuestion.answer}
                options={currentQuestion.options}
                darkMode={darkMode}
                onContinue={async (isCorrect) => {
                  
                  const timeSpentMs = Date.now() - questionStartRef.current;

                  try {
                    const res = await saveProgress({
                      profileName: profileName,
                      questionId: currentQuestion._id,
                      topic,
                      level,
                      type: normalizeType(exercisesType),
                      correct: isCorrect,
                      answeredAt: new Date().toISOString(),
                      timeSpentMs,
                    });

                    const key = `${topic}|${normalizeType(exercisesType)}`;
                   if (res.saved&& isCorrect === true) {
                  setProgress((prev) => ({
                    ...prev,
                    [key]: res.unlockedLevel,
                  }));
                }
                  } 
                  catch (err) {
                    console.error("Failed to save progress", err);
                  }

                  if (currentIndex + 1 < questions.length) {
                    setCurrentIndex((i) => i + 1);
                  } else {
                    setShowExe(false);
                  }
                }}
              />
            )}

          {/* Listening */}
          {exercisesType === "Listening" && currentQuestion && (
            <ListeningGame
              title={`Question ${currentIndex + 1} / ${questions.length}`}
              textToRead={currentQuestion.prompt}
              correctAnswer={currentQuestion.prompt}
              options={currentQuestion.options}
              darkMode={darkMode}
              onContinue={async (isCorrect) => {
                const timeSpentMs = Date.now() - questionStartRef.current;

                try {
                  const res = await saveProgress({
                    profileName: profileName,
                    questionId: currentQuestion._id,
                    topic,
                    level,
                    type: normalizeType(exercisesType), // "listening"
                    correct: isCorrect,
                    answeredAt: new Date().toISOString(),
                    timeSpentMs,
                  });

                  const key = `${topic}|${normalizeType(exercisesType)}`;
                if (res.saved&& isCorrect === true) {
  setProgress((prev) => ({
    ...prev,
    [key]: res.unlockedLevel,
  }));
}
                } catch (err) {
                  console.error("Failed to save progress", err);
                }

                if (currentIndex + 1 < questions.length) {
                  setCurrentIndex((prev) => prev + 1);
                } else {
                  setShowExe(false);
                }
              }}
            />
          )}

          {/* Talking */}
          {exercisesType === "Talking" && currentQuestion && (
            <SpeakingGame
              title={`Question ${currentIndex + 1} / ${questions.length}`}
              answer={currentQuestion.prompt}
              onContinue={async (isCorrect, spokenText) => {
                const timeSpentMs = Date.now() - questionStartRef.current;

                try {
                  const res = await saveProgress({
                    profileName: profileName,
                    questionId: currentQuestion._id,
                    topic,
                    level,
                    type: normalizeType(exercisesType), // "talking"
                    correct: isCorrect,
                    answeredAt: new Date().toISOString(),
                    timeSpentMs,
                    // אם תרצה לשמור spokenText בעתיד, אפשר להוסיף לשדה נוסף בשרת
                  });

                  const key = `${topic}|${normalizeType(exercisesType)}`;
                 if (res.saved&& isCorrect === true) {
  setProgress((prev) => ({
    ...prev,
    [key]: res.unlockedLevel,
  }));
}
                } catch (err) {
                  console.error("Failed to save progress", err);
                }

                if (currentIndex + 1 < questions.length) {
                  setCurrentIndex((prev) => prev + 1);
                } else {
                  setShowExe(false);
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
