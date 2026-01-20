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

function toDateOrUndef(x: any): Date | undefined {
  if (!x) return undefined;
  const d = new Date(x);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function inRange(dateVal: any, from?: Date, to?: Date) {
  if (!from && !to) return true; // no date filter
  if (!dateVal) return false;
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

// ✅ normalize questionId (ObjectId or string or {$oid:...})
function normalizeQuestionId(q: any): string {
  if (!q) return "";
  if (typeof q === "string") return q;
  if (q?.toString && typeof q.toString === "function") {
    const s = q.toString();
    // ObjectId.toString() is ok, but [object Object] is not
    if (s && s !== "[object Object]") return s;
  }
  if (q?.$oid) return String(q.$oid);
  if (q?._id) return normalizeQuestionId(q._id);
  return "";
}

// ✅ count UNIQUE correct questionId per (level,type) with optional filters
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

    // optional filters from query string
    const qLevel = req.query.level ? Number(req.query.level) : undefined;
    const qTopic = req.query.topic ? String(req.query.topic) : undefined;
    const qType = req.query.type ? lower(req.query.type) : undefined; // translate/talking...
    const from = toDateOrUndef(req.query.dateFrom);
    const to = toDateOrUndef(req.query.dateTo);

    if (!email || !profileName) {
      return res.status(400).json({ success: false, message: "Missing email or profileName" });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const profiles = (user.profiles ?? []) as any[];
    const profile = profiles.find((p) => p.profileName === profileName);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    // ✅ REAL saved shape
    const answers: AnswerEvent[] = Array.isArray(profile.progress?.answers)
      ? profile.progress.answers
      : [];

    // ----------------------------
    // Totals from Exercises (DB truth)
    // IMPORTANT: Only apply filters that are safe.
    // topic + level are safe, type might be stored with different casing in DB.
    // If your Exercise.type is stored lowercase, you can keep matchLT.type=qType.
    // ----------------------------
    const matchLT: any = {};
    if (typeof qLevel === "number" && !Number.isNaN(qLevel)) matchLT.level = qLevel;
    if (qTopic) matchLT.topic = lower(qTopic); // assume stored lowercase
    // If your DB stores type lowercase, uncomment next line:
    // if (qType) matchLT.type = qType;

    const totalsLT = (await Exercise.aggregate([
      { $match: matchLT },
      { $group: { _id: { level: "$level", type: "$type" }, total: { $sum: 1 } } },
    ])) as TotalRowLT[];

    const totalMapLT = new Map<string, number>();
    for (const t of totalsLT) {
      totalMapLT.set(`${t._id.level}:${lower(t._id.type)}`, t.total);
    }

    const matchLTT: any = {};
    if (typeof qLevel === "number" && !Number.isNaN(qLevel)) matchLTT.level = qLevel;
    if (qTopic) matchLTT.topic = lower(qTopic);
    // If your DB stores type lowercase, uncomment next line:
    // if (qType) matchLTT.type = qType;

    const totalsLTT = (await Exercise.aggregate([
      { $match: matchLTT },
      { $group: { _id: { level: "$level", topic: "$topic", type: "$type" }, total: { $sum: 1 } } },
    ])) as TotalRowLTT[];

    // totalsByLevelTopicType[level][topic][type] = total
    const totalsByLevelTopicType: Record<string, Record<string, Record<string, number>>> = {};
    for (const row of totalsLTT) {
      const lvl = String(row._id.level);
      const topic = lower(row._id.topic || "other");
      const type = lower(row._id.type);

      totalsByLevelTopicType[lvl] ??= {};
      totalsByLevelTopicType[lvl][topic] ??= {};
      totalsByLevelTopicType[lvl][topic][type] = row.total;
    }

    // ----------------------------
    // Cards (Level + Type)
    // ----------------------------
    const icons: Record<ExerciseType, string> = {
      translate: "🌍",
      complete: "✍️",
      listening: "🎧",
      talking: "🗣️",
      reading: "📖",
    };

    const levelsToShow =
      typeof qLevel === "number" && !Number.isNaN(qLevel) ? [qLevel] : [1, 2, 3, 4, 5];

    // ✅ FIX: keep readonly, no casting
    const typesToShow: readonly ExerciseType[] = qType
      ? TYPES.filter((t) => lower(t) === qType)
      : TYPES;

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
        // If user asked for type filter but DB type is case-messy,
        // still compute solved correctly (we normalized), but total might be 0
        const total = totalMapLT.get(`${lvl}:${lower(type)}`) ?? 0;

        const solved = getSolvedCount(answers, lvl, type, { topic: qTopic, from, to });
        const percent = total === 0 ? 0 : Math.round((solved / total) * 100);

        cards.push({
          title: type,
          level: lvl,
          progress: percent,
          icon: icons[type],
          solved,
          total,
        });
      }
    }

    // ----------------------------
    // byLevelTopicType: Level -> Topic -> Type -> solved/total/percent
    // ----------------------------
    const byLevelTopicType: Record<
      string,
      Record<string, Record<string, { solved: number; total: number; percent: number }>>
    > = {};

    // solvedSets per (lvl|topic|type) respecting date filter + optional filters
    const solvedSets: Record<string, Set<string>> = {};

    for (const a of answers) {
      if (a?.correct !== true) continue;

      const lvl = Number(a?.level);
      if (!lvl || Number.isNaN(lvl)) continue;
      if (typeof qLevel === "number" && !Number.isNaN(qLevel) && lvl !== qLevel) continue;

      const topic = lower(a?.topic || "other");
      if (qTopic && topic !== lower(qTopic)) continue;

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

    // baseline from totals so UI can show everything even if solved=0
    for (const lvl of Object.keys(totalsByLevelTopicType)) {
      const topicsObj = totalsByLevelTopicType[lvl] ?? {};
      byLevelTopicType[lvl] ??= {};

      for (const topic of Object.keys(topicsObj)) {
        const typesObj = topicsObj[topic] ?? {};
        byLevelTopicType[lvl][topic] ??= {};

        for (const typeKey of Object.keys(typesObj)) {
          // ✅ correct total for THIS (level,topic,type)
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
      filtersApplied: {
        level: qLevel,
        topic: qTopic,
        type: qType,
        dateFrom: from,
        dateTo: to,
      },
      totalsDebug: totalsLT,
      answersDebug: { totalAnswers: answers.length },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
