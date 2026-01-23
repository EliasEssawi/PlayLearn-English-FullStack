import { Request, Response } from "express";
import { User } from "../models/User";
import { Exercise } from "../models/Exercise";

const TYPES = ["translate", "complete", "listening", "talking", "reading"] as const;
type ExerciseType = (typeof TYPES)[number];

type AnswerEvent = {
  questionId: any;
  topic?: string;
  level?: number;
  type?: string;
  correct?: boolean;
  answeredAt?: any;
};

function lower(x: any) {
  return String(x ?? "").trim().toLowerCase();
}

/** Parse "YYYY-MM-DD" or ISO -> Date */
function parseDate(x: any): Date | undefined {
  if (!x) return undefined;
  const d = new Date(String(x));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** inclusive boundaries */
function startOfDay(d?: Date) {
  if (!d) return undefined;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d?: Date) {
  if (!d) return undefined;
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function inRange(dateVal: any, from?: Date, to?: Date) {
  if (!from && !to) return true;
  if (!dateVal) return false;
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

// ✅ normalize ObjectId / string / {$oid}
function normalizeQuestionId(q: any): string {
  if (!q) return "";
  if (typeof q === "string") return q;
  if (q?.$oid) return String(q.$oid);
  // mongoose ObjectId
  if (q?.toHexString && typeof q.toHexString === "function") return q.toHexString();
  if (q?.toString && typeof q.toString === "function") {
    const s = q.toString();
    if (s && s !== "[object Object]") return s;
  }
  if (q?._id) return normalizeQuestionId(q._id);
  return "";
}

function getSolvedCount(
  answers: AnswerEvent[],
  level: number,
  type: ExerciseType,
  filters?: { topic?: string; from?: Date; to?: Date }
): number {
  const wantedType = lower(type);
  const wantedTopic = filters?.topic ? lower(filters.topic) : undefined;

  const solved = new Set<string>();

  for (const a of answers) {
    if (Number(a?.level) !== level) continue;
    if (lower(a?.type) !== wantedType) continue;
    if (a?.correct !== true) continue;

    if (wantedTopic && lower(a?.topic) !== wantedTopic) continue;
    if (!inRange(a?.answeredAt, filters?.from, filters?.to)) continue;

    const qid = normalizeQuestionId(a?.questionId);
    if (qid) solved.add(qid);
  }
  return solved.size;
}

type TotalRowLT = { _id: { level: number; type: string }; total: number };
type TotalRowLTT = { _id: { level: number; topic: string; type: string }; total: number };

export async function getProfileProgressSummary(req: Request, res: Response) {
  try {
    const { email, profileName } = req.params;

    // ---- query filters
    const qLevel = req.query.level ? Number(req.query.level) : undefined;
    const qTopic = req.query.topic ? lower(req.query.topic) : undefined;
    const qType = req.query.type ? lower(req.query.type) : undefined;

    const rawFrom = req.query.dateFrom ?? req.query.from;
    const rawTo = req.query.dateTo ?? req.query.to;

    const from = startOfDay(parseDate(rawFrom));
    const to = endOfDay(parseDate(rawTo)); // ✅ inclusive

    if (!email || !profileName) {
      return res.status(400).json({ success: false, message: "Missing email or profileName" });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const profiles = (user.profiles ?? []) as any[];
    const profile = profiles.find((p) => p.profileName === profileName);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    // ✅ your DB shape: progress.answers
    const answers: AnswerEvent[] = Array.isArray(profile.progress?.answers) ? profile.progress.answers : [];

    // ---- totals from DB exercises (apply level/topic/type filters)
    const match: any = {};
    if (typeof qLevel === "number" && !Number.isNaN(qLevel)) match.level = qLevel;
    if (qTopic) match.topic = qTopic;
    if (qType) match.type = qType;

const dupes = await Exercise.aggregate([
  { $match: { level: 3, topic: "furniture" } },
  { $group: { _id: { type: "$type", prompt: "$prompt" }, c: { $sum: 1 } } },
  { $match: { c: { $gt: 1 } } },
  { $limit: 20 },
]);

console.log("DUPES sample:", dupes);
//end check

  const totalsLT = (await Exercise.aggregate([
  { $match: match },

  // dedupe questions first (same prompt counted once per level+type)
  {
    $group: {
      _id: { level: "$level", type: "$type", prompt: "$prompt" },
    },
  },

  // now count unique prompts per level+type
  {
    $group: {
      _id: { level: "$_id.level", type: "$_id.type" },
      total: { $sum: 1 },
    },
  },
])) as TotalRowLT[];
    const totalMapLT = new Map<string, number>();
    for (const t of totalsLT) totalMapLT.set(`${t._id.level}:${lower(t._id.type)}`, t.total);

    const totalsLTT = (await Exercise.aggregate([
  { $match: match },

  // dedupe questions first (same prompt counted once per level+topic+type)
  {
    $group: {
      _id: { level: "$level", topic: "$topic", type: "$type", prompt: "$prompt" },
    },
  },

  //  now count unique prompts per level+topic+type
  {
    $group: {
      _id: { level: "$_id.level", topic: "$_id.topic", type: "$_id.type" },
      total: { $sum: 1 },
    },
  },
])) as TotalRowLTT[];

    const totalsByLevelTopicType: Record<string, Record<string, Record<string, number>>> = {};
    for (const row of totalsLTT) {
      const lvl = String(row._id.level);
      const topic = lower(row._id.topic || "other");
      const type = lower(row._id.type);
      totalsByLevelTopicType[lvl] ??= {};
      totalsByLevelTopicType[lvl][topic] ??= {};
      totalsByLevelTopicType[lvl][topic][type] = row.total;
    }

    // ---- cards
    const icons: Record<ExerciseType, string> = {
      translate: "🌍",
      complete: "✍️",
      listening: "🎧",
      talking: "🗣️",
      reading: "📖",
    };

    const levelsToShow =
      typeof qLevel === "number" && !Number.isNaN(qLevel) ? [qLevel] : [1, 2, 3, 4, 5];

    const typesToShow: readonly ExerciseType[] = qType ? TYPES.filter((t) => lower(t) === qType) : TYPES;

    const cards: Array<{
      title: string;
      level: number;
      progress: number;
      icon: string;
      solved: number;
      total: number;
    }> = [];

    for (const lvl of levelsToShow) {
      for (const type of typesToShow) {
        const total = totalMapLT.get(`${lvl}:${lower(type)}`) ?? 0;
        const filters: { topic?: string; from?: Date; to?: Date } = {};
        if (qTopic) filters.topic = qTopic;
        if (from) filters.from = from;
        if (to) filters.to = to;

        const solved = getSolvedCount(answers, lvl, type, filters);
        const percent = total === 0 ? 0 : Math.round((solved / total) * 100);

        cards.push({ title: type, level: lvl, progress: percent, icon: icons[type], solved, total });
      }
    }

    // ---- byLevelTopicType (baseline = totals; solved respects date)
    const byLevelTopicType: Record<
      string,
      Record<string, Record<string, { solved: number; total: number; percent: number }>>
    > = {};

    // solved sets with ALL filters
    const solvedSets: Record<string, Set<string>> = {};
    for (const a of answers) {
      if (a?.correct !== true) continue;

      const lvl = Number(a?.level);
      if (!lvl || Number.isNaN(lvl)) continue;
      if (typeof qLevel === "number" && !Number.isNaN(qLevel) && lvl !== qLevel) continue;

      const topic = lower(a?.topic || "other");
      if (qTopic && topic !== qTopic) continue;

      const type = lower(a?.type);
      if (!type) continue;
      if (qType && type !== qType) continue;

      if (!inRange(a?.answeredAt, from, to)) continue;

      const qid = normalizeQuestionId(a?.questionId);
      if (!qid) continue;

      const k = `${lvl}|${topic}|${type}`;
      solvedSets[k] ??= new Set<string>();
      solvedSets[k].add(qid);
    }

    // baseline from totals (already filtered by match)
    for (const lvl of Object.keys(totalsByLevelTopicType)) {
      const topicsObj = totalsByLevelTopicType[lvl] ?? {};
      byLevelTopicType[lvl] ??= {};

      for (const topic of Object.keys(topicsObj)) {
        const typesObj = topicsObj[topic] ?? {};
        byLevelTopicType[lvl][topic] ??= {};

        for (const typeKey of Object.keys(typesObj)) {
          const total = typesObj[typeKey] ?? 0;
          const solved = solvedSets[`${lvl}|${topic}|${typeKey}`]?.size ?? 0;
          const percent = total === 0 ? 0 : Math.round((solved / total) * 100);
          byLevelTopicType[lvl][topic][typeKey] = { solved, total, percent };
        }
      }
    }

    return res.json({
      success: true,
      cards,
      byLevelTopicType,
      filtersApplied: { level: qLevel, topic: qTopic, type: qType, dateFrom: from, dateTo: to },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
