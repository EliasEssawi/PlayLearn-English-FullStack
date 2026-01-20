import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ProgressCard from "./ProgressCard";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const TYPES = ["translate", "complete", "listening", "talking", "reading"] as const;
type ExerciseType = (typeof TYPES)[number];

type Card = {
  title: ExerciseType | string;
  level: number;
  progress: number;
  icon: string;
  url: string;
  solved: number;
  total: number;
};

type ByLevelTopicType = Record<
  string,
  Record<string, Record<string, { solved: number; total: number; percent: number }>>
>;

type ApiResponse = {
  success: boolean;
  cards: Card[];
  byLevelTopicType: ByLevelTopicType;
};

function cap(x: any) {
  return String(x || "").trim();
}

export default function Progress({ email, profileName }: { email: string; profileName: string }) {
  // ------------------------
  // Filters state
  // ------------------------
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<ExerciseType | "all">("all");

  // Date filter (optional)
  const [from, setFrom] = useState<string>(""); // YYYY-MM-DD
  const [to, setTo] = useState<string>(""); // YYYY-MM-DD

  // Expand/collapse UI
  const [openLevel, setOpenLevel] = useState<number | null>(null);

  // Data
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [byLevelTopicType, setByLevelTopicType] = useState<ByLevelTopicType>({});

  // ------------------------
  // Fetch (date aware)
  // ------------------------
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (from) params.from = new Date(from).toISOString();
        if (to) params.to = new Date(to).toISOString();

        const url = `${API_BASE}/profiles/${encodeURIComponent(email)}/${encodeURIComponent(
          profileName
        )}/progress-summary`;

        const res = await axios.get<ApiResponse>(url, { withCredentials: true, params });

        if (res.data?.success) {
          setCards(res.data.cards || []);
          setByLevelTopicType(res.data.byLevelTopicType || {});
        }
      } catch (e) {
        console.error("Failed to load progress", e);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [email, profileName, from, to]);

  // ------------------------
  // Topics list (depends on selectedLevel)
  // ------------------------
  const topics = useMemo(() => {
    const out = new Set<string>();
    const levels = Object.keys(byLevelTopicType || {});
    for (const lvl of levels) {
      if (selectedLevel !== "all" && String(selectedLevel) !== lvl) continue;
      const topicsObj = byLevelTopicType[lvl] || {};
      Object.keys(topicsObj).forEach((t) => out.add(t));
    }
    return ["all", ...Array.from(out).sort()];
  }, [byLevelTopicType, selectedLevel]);

  // ------------------------
  // Filtered cards (level + type)
  // ------------------------
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (selectedLevel !== "all" && c.level !== selectedLevel) return false;
      if (selectedType !== "all" && String(c.title).toLowerCase() !== selectedType) return false;
      return true;
    });
  }, [cards, selectedLevel, selectedType]);

  // ------------------------
  // Compute topic summary based on filters
  // ------------------------
  const topicSummary = useMemo(() => {
    // returns rows: { level, topic, type, solved,total,percent }
    const rows: Array<{
      level: number;
      topic: string;
      type: string;
      solved: number;
      total: number;
      percent: number;
    }> = [];

    for (const lvlStr of Object.keys(byLevelTopicType || {})) {
      const lvl = Number(lvlStr);
      if (selectedLevel !== "all" && lvl !== selectedLevel) continue;

      const topicsObj = byLevelTopicType[lvlStr] || {};
      for (const topic of Object.keys(topicsObj)) {
        if (selectedTopic !== "all" && topic !== selectedTopic) continue;

        const typesObj = topicsObj[topic] || {};
        for (const typeKey of Object.keys(typesObj)) {
          if (selectedType !== "all" && typeKey !== selectedType) continue;

          const node = typesObj[typeKey];
          rows.push({
            level: lvl,
            topic,
            type: typeKey,
            solved: node.solved,
            total: node.total,
            percent: node.percent,
          });
        }
      }
    }

    return rows;
  }, [byLevelTopicType, selectedLevel, selectedTopic, selectedType]);

  // ------------------------
  // UI helpers
  // ------------------------
  const resetFilters = () => {
    setSelectedLevel("all");
    setSelectedTopic("all");
    setSelectedType("all");
    setFrom("");
    setTo("");
    setOpenLevel(null);
  };

  const LevelRow = ({ level }: { level: number }) => {
    const isOpen = openLevel === level;

    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button
          onClick={() => setOpenLevel(isOpen ? null : level)}
          className="
            w-full flex items-center justify-between px-5 py-4
            bg-slate-50 dark:bg-slate-800
            hover:bg-slate-100 dark:hover:bg-slate-700
            transition
          "
        >
          <div className="font-bold text-lg">Level {level}</div>
          <div className="text-green-500 font-extrabold text-xl">{isOpen ? "▼" : "➜"}</div>
        </button>

        {isOpen && (
          <div className="p-5 bg-white dark:bg-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TYPES.map((t) => {
                const card = cards.find(
                  (c) => c.level === level && String(c.title).toLowerCase() === t
                );

                const progress = card?.progress ?? 0;
                const solved = card?.solved ?? 0;
                const total = card?.total ?? 0;
                const icon =
                  card?.icon ??
                  (t === "translate"
                    ? "🌍"
                    : t === "complete"
                    ? "✍️"
                    : t === "listening"
                    ? "🎧"
                    : t === "talking"
                    ? "🗣️"
                    : "📖");

                return (
                  <ProgressCard
                    key={`${level}-${t}`}
                    title={t}
                    level={level}
                    progress={progress}
                    icon={icon}
                    solved={solved}
                    total={total}
                    onClick={() => setSelectedType((prev) => (prev === t ? "all" : t))}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ------------------------
  // Render
  // ------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-extrabold">📊 Progress</h1>
          <p className="text-slate-600 dark:text-slate-300">
            {cap(profileName)} • {cap(email)}
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 mb-7">
          <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
            {/* Level */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-500 dark:text-slate-300">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedLevel(v === "all" ? "all" : Number(v));
                  setOpenLevel(null);
                }}
                className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="all">All Levels</option>
                {[1, 2, 3, 4, 5].map((l) => (
                  <option key={l} value={l}>
                    Level {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-500 dark:text-slate-300">Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All Topics" : t}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercise */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-500 dark:text-slate-300">Exercise</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="all">All Exercises</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From/To */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-500 dark:text-slate-300">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-500 dark:text-slate-300">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <button
              onClick={resetFilters}
              className="px-5 py-3 rounded-xl bg-green-600 text-white font-bold hover:opacity-90"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 text-sm text-slate-500 dark:text-slate-300">
            Tip: click a Level row ➜ then click an exercise card to filter by that exercise.
          </div>
        </div>

        {/* Level lines with --> */}
        <div className="flex flex-col gap-4 mb-8">
          {[1, 2, 3, 4, 5]
            .filter((l) => (selectedLevel === "all" ? true : l === selectedLevel))
            .map((l) => (
              <LevelRow key={l} level={l} />
            ))}
        </div>

        {/* Summary section (Level/Topic/Type table) */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold">📌 Filtered Summary</h2>
            {loading && <span className="text-sm text-slate-500">Loading...</span>}
          </div>

          {topicSummary.length === 0 ? (
            <div className="text-slate-500 dark:text-slate-300">No data for this filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-sm text-slate-500 dark:text-slate-300">
                  <tr>
                    <th className="py-2">Level</th>
                    <th className="py-2">Topic</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Solved</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {topicSummary.map((r, idx) => (
                    <tr key={idx} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-2 font-bold">{r.level}</td>
                      <td className="py-2 capitalize">{r.topic}</td>
                      <td className="py-2 capitalize">{r.type}</td>
                      <td className="py-2">{r.solved}</td>
                      <td className="py-2">{r.total}</td>
                      <td className="py-2 font-bold text-green-600">{r.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cards grid view (optional quick view) */}
        <div className="mt-8">
          <h2 className="text-xl font-extrabold mb-4">✨ Quick Cards View</h2>

          {loading ? (
            <div className="text-slate-500 dark:text-slate-300">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredCards.map((c) => (
                <ProgressCard
                  key={`${c.level}-${c.title}`}
                  title={String(c.title)}
                  level={c.level}
                  progress={c.progress}
                  icon={c.icon}
                  solved={c.solved}
                  total={c.total}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
