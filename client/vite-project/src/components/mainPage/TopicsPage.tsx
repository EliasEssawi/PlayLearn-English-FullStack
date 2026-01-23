import { useEffect, useMemo, useRef, useState } from "react";
import TopicCard, { TopicLevel } from "./TopicCard";
import FillBlankGame from "./FillBlankGame";
import ListeningGame from "./ListeningGame";
import SpeakingGame from "./SpeakingGame";
import { getProfileQuestions, Question, saveProgress, getProgress } from "../../utils/questionService";

type Props = {
  exercisesType: string;
  darkMode: boolean;
};

const normType = (t: string) => (t === "Fill the blank" ? "complete" : t.toLowerCase());

export default function TopicsPage({ exercisesType, darkMode }: Props) {
  const savingRef = useRef(false);

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState(1);
  const [showExe, setShowExe] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [progress, setProgress] = useState<Record<string, number>>({});
  const [remaining, setRemaining] = useState<number | null>(null);
  
  const questionStartRef = useRef<number>(Date.now());

  const profileStr = localStorage.getItem("activeProfile");
  if (!profileStr) return null;

  const profileObj = JSON.parse(profileStr);

  const profileName: string =
    profileObj?.profileName ??
    profileObj?.email?.profileName ??
    profileObj?.email?.profileName?.profileName;

  if (!profileName) return null;

  const typeNorm = useMemo(() => normType(exercisesType), [exercisesType]);
  const keyFor = (topicName: string) => `${topicName}|${typeNorm}`;

  // reset when type changes
  useEffect(() => {
    setShowExe(false);
    setTopic("");
    setLevel(1);
    setQuestions([]);
    setCurrentIndex(0);
    setRemaining(null);
  }, [exercisesType]);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentIndex]);

  // load unlocked levels
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProgress(profileName);
        if (res?.success) setProgress(res.unlocked || {});
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    };
    load();
  }, [profileName]);

  const safeSaveAttempt = async (payload: any) => {
    if (savingRef.current) return null;
    savingRef.current = true;
    try {
      return await saveProgress(payload);
    } finally {
      savingRef.current = false;
    }
  };

  const fetchQuestions = async (topicParam: string, levelParam: number) => {
    try {
      const res = await getProfileQuestions(profileName, levelParam, topicParam, typeNorm, 10);

      if (!res.success) {
        console.error(res.message);
        return;
      }

      // debug logs (keep for now)
      console.log("FETCH:", (res.questions || []).map(q => ({ id: q._id, prompt: q.prompt })));
      console.log("REMAINING:", res.remaining);
      console.log("REQUESTED:", res.requested, "AVAILABLE:", res.available);

      setRemaining(typeof res.remaining === "number" ? res.remaining : null);
      setQuestions(res.questions || []);
      setCurrentIndex(0);

      // if nothing left => go back
      if ((res.questions || []).length === 0) {
        setShowExe(false);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const handleLevelClick = (topicName: string, levelId: number) => {
    const unlocked = progress[keyFor(topicName)] ?? 1;
    if (levelId > unlocked) return;

    setTopic(topicName);
    setLevel(levelId);
    setShowExe(true);
    fetchQuestions(topicName, levelId);
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswered = async (isCorrect: boolean) => {
    if (!currentQuestion) return;

    const timeSpentMs = Date.now() - questionStartRef.current;

    // 1) save EVERY attempt (correct + wrong)
    try {
      const res = await safeSaveAttempt({
        profileName,
        questionId: String(currentQuestion._id), // exercise id
        topic,
        level,
        type: typeNorm,
        correct: isCorrect,
        answeredAt: new Date().toISOString(),
        timeSpentMs,
      });

      // unlock only if correct and saved
     if (res?.saved && isCorrect === true) {
  const key = `${topic}|${typeNorm}`;
  setProgress(prev => ({ ...prev, [key]: res.unlockedLevel }));

  // ⭐ update points immediately (no localStorage needed)
  window.dispatchEvent(new CustomEvent("points-updated", { detail: { delta: 10 } }));
}

    } catch (err) {
      console.error("Failed to save progress", err);
    }

    // 2) UI flow that prevents “same question feeling”
    if (isCorrect) {
      // remove solved question immediately from local list
      setQuestions(prev => prev.filter(q => q._id !== currentQuestion._id));
      // keep currentIndex as-is (next item shifts into this position)
    } else {
      // wrong -> move forward in current round
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(i => i + 1);
        return;
      }
    }

    // 3) if we reached end OR list became short, refresh the pool
    // (after correct, backend should now exclude it)
    if (questions.length <= 1 || currentIndex >= questions.length - 1) {
      await fetchQuestions(topic, level);
    }
  };

  // ---- Levels UI ----
  const animalsLevels: TopicLevel[] = [
    { id: 1, icon: "⭐" }, { id: 2, icon: "🐶" }, { id: 3, icon: "🐱" }, { id: 4, icon: "🐘" }, { id: 5, icon: "🏆" },
  ];
  const weatherLevels: TopicLevel[] = [
    { id: 1, icon: "☀️" }, { id: 2, icon: "🌤" }, { id: 3, icon: "🌧" }, { id: 4, icon: "⛈" }, { id: 5, icon: "❄️" },
  ];
  const transportationLevels: TopicLevel[] = [
    { id: 1, icon: "🚶" }, { id: 2, icon: "🚲" }, { id: 3, icon: "🚗" }, { id: 4, icon: "🚌" }, { id: 5, icon: "✈️" },
  ];
  const jobsLevels: TopicLevel[] = [
    { id: 1, icon: "🧑‍🎓" }, { id: 2, icon: "🧑‍🍳" }, { id: 3, icon: "🧑‍🔧" }, { id: 4, icon: "🧑‍🏫" }, { id: 5, icon: "🧑‍💼" },
  ];
  const furnitureLevels: TopicLevel[] = [
    { id: 1, icon: "🪑" }, { id: 2, icon: "🛋" }, { id: 3, icon: "🛏" }, { id: 4, icon: "🪟" }, { id: 5, icon: "🚪" },
  ];
  const colorsLevels: TopicLevel[] = [
    { id: 1, icon: "🔴" }, { id: 2, icon: "🟡" }, { id: 3, icon: "🔵" }, { id: 4, icon: "🟢" }, { id: 5, icon: "🟣" },
  ];

  return (
    <div
      className="min-h-screen p-6 space-y-8 transition-colors duration-300"
      style={{
        backgroundColor: darkMode ? "#020617" : "#f8fafc",
        color: darkMode ? "#f8fafc" : "#0f172a",
      }}
    >
      {!showExe && (
        <div className="space-y-6">
          <TopicCard title="Animals" emoji="🐾" levels={animalsLevels} unlockedLevel={progress[keyFor("animals")] ?? 1} onLevelClick={(id) => handleLevelClick("animals", id)} darkMode={darkMode} />
          <TopicCard title="Weather" emoji="🌦" levels={weatherLevels} unlockedLevel={progress[keyFor("weather")] ?? 1} onLevelClick={(id) => handleLevelClick("weather", id)} darkMode={darkMode} />
          <TopicCard title="Transportation" emoji="🚗" levels={transportationLevels} unlockedLevel={progress[keyFor("transportation")] ?? 1} onLevelClick={(id) => handleLevelClick("transportation", id)} darkMode={darkMode} />
          <TopicCard title="Jobs" emoji="🧑‍🍳" levels={jobsLevels} unlockedLevel={progress[keyFor("jobs")] ?? 1} onLevelClick={(id) => handleLevelClick("jobs", id)} darkMode={darkMode} />
          <TopicCard title="Furniture" emoji="🚪" levels={furnitureLevels} unlockedLevel={progress[keyFor("furniture")] ?? 1} onLevelClick={(id) => handleLevelClick("furniture", id)} darkMode={darkMode} />
          <TopicCard title="Colors" emoji="🎨" levels={colorsLevels} unlockedLevel={progress[keyFor("colors")] ?? 1} onLevelClick={(id) => handleLevelClick("colors", id)} darkMode={darkMode} />
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

        
          {(exercisesType === "Translate" || exercisesType === "Fill the blank" || exercisesType === "Reading") && currentQuestion && (
            <FillBlankGame
              title={`Question ${currentIndex + 1} / ${questions.length}`}
              question={currentQuestion.prompt}
              correctAnswer={currentQuestion.answer}
              options={currentQuestion.options}
              darkMode={darkMode}
              onContinue={handleAnswered}
            />
          )}

          {exercisesType === "Listening" && currentQuestion && (
            <ListeningGame
              title={`Question ${currentIndex + 1} / ${questions.length}`}
              textToRead={currentQuestion.prompt}
              correctAnswer={currentQuestion.prompt}
              options={currentQuestion.options}
              darkMode={darkMode}
              onContinue={handleAnswered}
            />
          )}

          {exercisesType === "Talking" && currentQuestion && (
            <SpeakingGame
              title={`Question ${currentIndex + 1} / ${questions.length}`}
              answer={currentQuestion.prompt}
              onContinue={handleAnswered}
              darkMode={darkMode}
            />
          )}
        </div>
      )}
    </div>
  );
}
