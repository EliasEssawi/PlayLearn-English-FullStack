import { useEffect, useState } from "react";
import axios from "axios";
import ProgressCard from "./ProgressCard";
import { useTheme } from "../context/ThemeContext";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const TYPES = ["translate", "complete", "listening", "talking", "reading"] as const;
type ExerciseType = (typeof TYPES)[number];

/* ---------- TYPES ---------- */
type ProgressProps = {
  parentEmail: string;
  childName: string;
};

type Card = {
  title: ExerciseType | string;
  level: number;
  progress: number;
  icon?: string;
  solved: number;
  total: number;
};

type ApiResponse = {
  success: boolean;
  cards: Card[];
};

/* ---------- COMPONENT ---------- */
export default function ProgressChild({
  parentEmail,
  childName,
}: ProgressProps) {
  const { darkMode } = useTheme();

  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [openLevel, setOpenLevel] = useState<number | null>(null);

  /* ------------------------
     Fetch progress
  ------------------------ */
  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE}/profiles/${encodeURIComponent(
          parentEmail
        )}/${encodeURIComponent(childName)}/progress-summary`;

        const res = await axios.get<ApiResponse>(url, {
          withCredentials: true,
        });

        if (res.data?.success) {
          setCards(res.data.cards || []);
        }
      } catch (err) {
        console.error("Failed to load progress", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [parentEmail, childName]);

  /* ------------------------
     Level Row
  ------------------------ */
  const LevelRow = ({ level }: { level: number }) => {
    const isOpen = openLevel === level;

    return (
      <div className="rounded-2xl border border-green-200 overflow-hidden shadow-sm">
        <button
          onClick={() => setOpenLevel(isOpen ? null : level)}
          className={`
            w-full flex items-center justify-between px-5 py-4 transition
            ${
              darkMode
                ? "bg-slate-800 hover:bg-slate-700 text-slate-100"
                : "bg-green-50 hover:bg-green-100 text-green-900"
            }
          `}
        >
          <span className="font-extrabold text-lg">Level {level}</span>
          <span className="text-xl font-extrabold">
            {isOpen ? "▼" : "➜"}
          </span>
        </button>

        {isOpen && (
          <div className={darkMode ? "bg-slate-900 p-5" : "bg-white p-5"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TYPES.map((t) => {
                const card = cards.find(
                  (c) =>
                    c.level === level &&
                    String(c.title).toLowerCase() === t
                );

                return (
                  <ProgressCard
                    key={`${level}-${t}`}
                    title={t}
                    level={level}
                    progress={card?.progress ?? 0}
                    solved={card?.solved ?? 0}
                    total={card?.total ?? 0}
                    icon={
                      card?.icon ??
                      (t === "translate"
                        ? "🌍"
                        : t === "complete"
                        ? "✍️"
                        : t === "listening"
                        ? "🎧"
                        : t === "talking"
                        ? "🗣️"
                        : "📖")
                    }
                    url=""
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ------------------------
     Render
  ------------------------ */
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-slate-950 text-slate-100"
          : "bg-gradient-to-b from-green-50 to-green-50 text-slate-900"
      }`}
    >
      <div className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="text-3xl font-extrabold mb-2">📊 Progress</h1>

        <p className={darkMode ? "text-slate-400" : "text-slate-600"}>
          👶 {childName} • 👨 {parentEmail}
        </p>

        {loading ? (
          <div className="text-slate-500 mt-6">Loading levels…</div>
        ) : (
          <div className="flex flex-col gap-4 mt-6">
            {[1, 2, 3, 4, 5].map((l) => (
              <LevelRow key={l} level={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
