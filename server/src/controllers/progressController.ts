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
  answeredAt?: any; // ✅ important for date filtering (exists in your DB events)
};

function lower(x: any) {
  return String(x || "").toLowerCase();
}

function toDateOrUndef(v: any): Date | undefined {
  if (!v) return undefined;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

// ✅ If no from/to => accept all
function passesDateFilter(item: AnswerEvent, from?: Date, to?: Date): boolean {
  if (!from && !to) return true; // ✅ no date filter
  const d = toDateOrUndef((item as any).answeredAt);
  if (!d) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

// ✅ solved = UNIQUE correct questionId per (level,type), with date filter support
function getSolvedCount(
  progress: any,
  level: number,
  type: ExerciseType,
  from?: Date,
  to?: Date
): number {
  if (!Array.isArray(progress)) return 0;

  const wantedType = lower(type);
  const solvedIds = new Set<string>();

  for (const item of progress as AnswerEvent[]) {
    if (Number(item?.level) !== level) continue;
    if (lower(item?.type) !== wantedType) continue;
    if (item?.correct !== true) continue;

    // ✅ date filter applied here
    if (!passesDateFilter(item, from, to)) continue;

    const qid = String(item?.questionId || "");
    if (qid) solvedIds.add(qid);
  }

  return solvedIds.size;
}

type TotalRowLT = { _id: { level: number; type: string }; total: number };
type TotalRowLTT = { _id: { level: number; topic: string; type: string }; total: number };

export async function getProfileProgressSummary(req: Request, res: Response) {
  try {
    const email = req.params.email;
    const profileName = req.params.profileName;

    if (!email || !profileName) {
      return res.status(400).json({ success: false, message: "Missing email or profileName" });
    }

    // ✅ read optional date filters
    const from = toDateOrUndef(req.query.from);
    const to = toDateOrUndef(req.query.to);

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const profiles = (user.profiles ?? []) as any[];
    const profile = profiles.find((p) => p.profileName === profileName);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    // ✅ your real mongo shape: progress is an array of answer events
    const progressArr: AnswerEvent[] = Array.isArray(profile.progress) ? profile.progress : [];

    // ----------------------------
    // 1) Totals per (level,type) from Exercises collection
    // ----------------------------
    const totalsLT = (await Exercise.aggregate([
      { $group: { _id: { level: "$level", type: "$type" }, total: { $sum: 1 } } },
    ])) as TotalRowLT[];

    const totalMapLT = new Map<string, number>();
    for (const t of totalsLT) {
      totalMapLT.set(`${t._id.level}:${lower(t._id.type)}`, t.total);
    }

    // ----------------------------
    // 2) Totals per (level,topic,type)
    // ----------------------------
    const totalsLTT = (await Exercise.aggregate([
      { $group: { _id: { level: "$level", topic: "$topic", type: "$type" }, total: { $sum: 1 } } },
    ])) as TotalRowLTT[];

    const totalsByLevelTopicType: Record<string, Record<string, Record<string, number>>> = {};
    for (const row of totalsLTT) {
      const lvl = String(row._id.level);
      const topic = String(row._id.topic || "other").trim().toLowerCase();
      const type = lower(row._id.type);

      totalsByLevelTopicType[lvl] ??= {};
      totalsByLevelTopicType[lvl][topic] ??= {};
      totalsByLevelTopicType[lvl][topic][type] = row.total;
    }

    // ----------------------------
    // Icons (typed, never undefined)
    // ----------------------------
    const icons: Record<ExerciseType, string> = {
      translate: "🌍",
      complete: "✍️",
      listening: "🎧",
      talking: "🗣️",
      reading: "📖",
    };

    // ----------------------------
    // 3) Cards for Progress page (level+type) ✅ date-aware
    // ----------------------------
    const cards: Array<{
      title: string;
      level: number;
      progress: number;
      icon: string;
      url: string;
      solved: number;
      total: number;
    }> = [];

    for (let level = 1; level <= 5; level++) {
      for (const type of TYPES) {
        const solved = getSolvedCount(progressArr, level, type, from, to);
        const total = totalMapLT.get(`${level}:${lower(type)}`) ?? 0;
        const percent = total === 0 ? 0 : Math.round((solved / total) * 100);

        cards.push({
          title: type,
          level,
          progress: percent,
          icon: icons[type],
          url: "",
          solved,
          total,
        });
      }
    }

    // ----------------------------
    // 4) Topic summary: byLevelTopicType ✅ date-aware
    // ----------------------------
    const byLevelTopicType: Record<
      string,
      Record<string, Record<string, { solved: number; total: number; percent: number }>>
    > = {};

    // Build solved sets per (level|topic|type) with date filter
    const solvedSets: Record<string, Set<string>> = {};

    for (const item of progressArr) {
      if (item?.correct !== true) continue;

      // ✅ date filter here too
      if (!passesDateFilter(item, from, to)) continue;

      const lvl = String(Number(item?.level));
      if (!lvl || lvl === "NaN") continue;

      const topic = String(item?.topic || "other").trim().toLowerCase();
      const type = lower(item?.type);
      if (!type) continue;

      const qid = String(item?.questionId || "");
      if (!qid) continue;

      const k = `${lvl}|${topic}|${type}`;
      solvedSets[k] ??= new Set<string>();
      solvedSets[k].add(qid);
    }

    // Use totals as baseline so everything in DB appears
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
      filtersApplied: {
        from: from ? from.toISOString() : null,
        to: to ? to.toISOString() : null,
      },
      cards,
      byLevelTopicType,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
