import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ProgressCard from "./ProgressCard";
import MainLayout from "../authintication/MainLayout";
import { useTheme } from "../context/ThemeContext"; // ✅ חדש

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
  // Filters (ONLY for summary)
  // ------------------------
  const { darkMode } = useTheme();
  
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<ExerciseType | "all">("all");
  const [from, setFrom] = useState<string>(""); // YYYY-MM-DD
  const [to, setTo] = useState<string>(""); // YYYY-MM-DD

  // Expand/collapse
  const [openLevel, setOpenLevel] = useState<number | null>(null);

  // ------------------------
  // DATA LAYERS:
  // base = always unfiltered (for Level lines)
  // summary = filtered (for table only)
  // ------------------------
  const [baseLoading, setBaseLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [baseCards, setBaseCards] = useState<Card[]>([]);
  const [baseByLevelTopicType, setBaseByLevelTopicType] = useState<ByLevelTopicType>({});

  const [summaryCards, setSummaryCards] = useState<Card[]>([]);
  const [summaryByLevelTopicType, setSummaryByLevelTopicType] = useState<ByLevelTopicType>({});

  // ------------------------
  // 1) Fetch BASE (NO FILTERS) once
  // ------------------------
  useEffect(() => {
    const fetchBase = async () => {
      setBaseLoading(true);
      try {
        const url = `${API_BASE}/profiles/${encodeURIComponent(email)}/${encodeURIComponent(
          profileName
        )}/progress-summary`;

        const res = await axios.get<ApiResponse>(url, { withCredentials: true });

        if (res.data?.success) {
          setBaseCards(res.data.cards || []);
          setBaseByLevelTopicType(res.data.byLevelTopicType || {});
        }
      } catch (e) {
        console.error("Failed to load BASE progress", e);
      } finally {
        setBaseLoading(false);
      }
    };

    if (email && profileName) fetchBase();
  }, [email, profileName]);

  // ------------------------
  // 2) Fetch SUMMARY (FILTERED) whenever filters change
  // ------------------------
  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const params: any = {};

        if (selectedLevel !== "all") params.level = selectedLevel;
        if (selectedTopic !== "all") params.topic = selectedTopic;
        if (selectedType !== "all") params.type = selectedType;

        if (from) params.dateFrom = from;
        if (to) params.dateTo = to;

        const url = `${API_BASE}/profiles/${encodeURIComponent(email)}/${encodeURIComponent(
          profileName
        )}/progress-summary`;

        const res = await axios.get<ApiResponse>(url, { withCredentials: true, params });

        if (res.data?.success) {
          setSummaryCards(res.data.cards || []);
          setSummaryByLevelTopicType(res.data.byLevelTopicType || {});
        }
      } catch (e) {
        console.error("Failed to load FILTERED summary", e);
      } finally {
        setSummaryLoading(false);
      }
    };

    if (email && profileName) fetchSummary();
  }, [email, profileName, selectedLevel, selectedTopic, selectedType, from, to]);

  // ------------------------
  // Topics list for filter dropdown (from BASE so you always see all topics)
  // ------------------------
  const topics = useMemo(() => {
    const out = new Set<string>();
    for (const lvl of Object.keys(baseByLevelTopicType || {})) {
      const topicsObj = baseByLevelTopicType[lvl] || {};
      Object.keys(topicsObj).forEach((t) => out.add(t));
    }
    return ["all", ...Array.from(out).sort()];
  }, [baseByLevelTopicType]);

  // ------------------------
  // Filtered SUMMARY table rows (from filtered response)
  // ------------------------
  const topicSummary = useMemo(() => {
    const rows: Array<{
      level: number;
      topic: string;
      type: string;
      solved: number;
      total: number;
      percent: number;
    }> = [];

    for (const lvlStr of Object.keys(summaryByLevelTopicType || {})) {
      const lvl = Number(lvlStr);
      const topicsObj = summaryByLevelTopicType[lvlStr] || {};

      for (const topic of Object.keys(topicsObj)) {
        const typesObj = topicsObj[topic] || {};

        for (const typeKey of Object.keys(typesObj)) {
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

    // optional: stable order
    rows.sort((a, b) => a.level - b.level || a.topic.localeCompare(b.topic) || a.type.localeCompare(b.type));
    return rows;
  }, [summaryByLevelTopicType]);

  // ------------------------
  // UI helpers
  // ------------------------
  const resetFilters = () => {
    setSelectedLevel("all");
    setSelectedTopic("all");
    setSelectedType("all");
    setFrom("");
    setTo("");
  };

  const LevelRow = ({ level }: { level: number }) => {
    const isOpen = openLevel === level;

    return (
      <div className="rounded-2xl border border-green-200 bg-white overflow-hidden shadow-sm">
        <button
          onClick={() => setOpenLevel(isOpen ? null : level)}
          className="
            w-full flex items-center justify-between px-5 py-4
            bg-green-50 hover:bg-green-100 transition
          "
        >
          <div className="font-extrabold text-lg text-green-900">Level {level}</div>
          <div className="text-green-700 font-extrabold text-xl">{isOpen ? "▼" : "➜"}</div>
        </button>

        {isOpen && (
          <div className="p-5 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TYPES.map((t) => {
                const card = baseCards.find(
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
                    url=""
                    solved={solved}
                    total={total}
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
    <MainLayout>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-gradient-to-b from-green-50 to-green-50 text-slate-900"}`}>
        <div className="max-w-6xl mx-auto px-5 py-8">
          {/* Header */}
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-3xl font-extrabold">📊 Progress</h1>
            <p className={darkMode ? "text-slate-400" : "text-slate-600"}>
              {cap(profileName)} • {cap(email)}
            </p>

            <div className={`mt-2 inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border ${
              darkMode 
                ? "bg-slate-900 border-slate-700 text-green-400" 
                : "bg-white border-green-200 text-green-800"
            }`}>
              ✅ <b>Level 1–5 lines are NOT affected by filters.</b> Filters affect only the <b>Filtered Summary</b>.
            </div>
          </div>

          {/* Layout: Left = levels, Right = filter sidebar + summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: Levels always 1..5 */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {baseLoading ? (
                <div className={darkMode ? "text-slate-400" : "text-slate-600"}>Loading levels...</div>
              ) : (
                [1, 2, 3, 4, 5].map((l) => <LevelRow key={l} level={l} />)
              )}
            </div>

            {/* RIGHT: Sidebar filters + summary */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Filters Sidebar */}
              <div className={`rounded-3xl border p-5 shadow-sm sticky top-4 transition-colors ${
                darkMode ? "bg-slate-900 border-slate-800" : "border-green-200 bg-white"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-extrabold ${darkMode ? "text-slate-100" : "text-green-900"}`}>Filters (Summary only)</h2>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold hover:opacity-90 transition-opacity"
                  >
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Level */}
                  <div className="flex flex-col gap-2">
                    <label className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Level</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value === "all" ? "all" : Number(e.target.value))}
                      className={`px-4 py-3 rounded-xl border outline-none transition-colors ${
                        darkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-green-500" 
                          : "bg-green-50 border-green-200 focus:border-green-400"
                      }`}
                    >
                      <option value="all">All Levels</option>
                      {[1, 2, 3, 4, 5].map((l) => (
                        <option key={l} value={l}>Level {l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Topic */}
                  <div className="flex flex-col gap-2">
                    <label className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Topic</label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className={`px-4 py-3 rounded-xl border outline-none transition-colors ${
                        darkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-green-500" 
                          : "bg-green-50 border-green-200 focus:border-green-400"
                      }`}
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
                    <label className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Exercise</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as any)}
                      className={`px-4 py-3 rounded-xl border outline-none transition-colors ${
                        darkMode 
                          ? "bg-slate-800 border-slate-700 text-slate-100 focus:border-green-500" 
                          : "bg-green-50 border-green-200 focus:border-green-400"
                      }`}
                    >
                      <option value="all">All Exercises</option>
                      {TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>From</label>
                      <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className={`px-4 py-3 rounded-xl border outline-none transition-colors ${
                          darkMode 
                            ? "bg-slate-800 border-slate-700 text-slate-100 color-scheme-dark" 
                            : "bg-green-50 border-green-200"
                        }`}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>To</label>
                      <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className={`px-4 py-3 rounded-xl border outline-none transition-colors ${
                          darkMode 
                            ? "bg-slate-800 border-slate-700 text-slate-100 color-scheme-dark" 
                            : "bg-green-50 border-green-200"
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                    Date filter is inclusive (whole day). If empty → it shows all dates.
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className={`rounded-3xl border p-5 shadow-sm transition-colors ${
                darkMode ? "bg-slate-900 border-slate-800" : "border-green-200 bg-white"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl font-extrabold ${darkMode ? "text-slate-100" : "text-green-900"}`}>📌 Filtered Summary</h2>
                  {summaryLoading && <span className="text-sm text-slate-500">Loading...</span>}
                </div>

                {topicSummary.length === 0 ? (
                  <div className={darkMode ? "text-slate-500" : "text-slate-500"}>No data for this filter.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                        <tr>
                          <th className="py-2">Level</th>
                          <th className="py-2">Topic</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Solved</th>
                          <th className="py-2">Total</th>
                          <th className="py-2">%</th>
                        </tr>
                      </thead>
                      <tbody className={darkMode ? "text-slate-300" : "text-slate-900"}>
                        {topicSummary.map((r, idx) => (
                          <tr key={idx} className={`border-t ${darkMode ? "border-slate-800" : "border-green-100"}`}>
                            <td className="py-2 font-bold">{r.level}</td>
                            <td className="py-2 capitalize">{r.topic}</td>
                            <td className="py-2 capitalize">{r.type}</td>
                            <td className="py-2">{r.solved}</td>
                            <td className="py-2">{r.total}</td>
                            <td className={`py-2 font-extrabold ${darkMode ? "text-green-400" : "text-green-700"}`}>{r.percent}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className={`mt-3 text-xs ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                  Filters apply only here. Levels/cards always show full progress.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
 }