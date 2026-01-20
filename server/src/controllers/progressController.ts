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
};

function lower(x: any) {
  return String(x || "").toLowerCase();
}

// ✅ solved = UNIQUE correct questionId per (level,type)
function getSolvedCount(progress: any, level: number, type: ExerciseType): number {
  if (!Array.isArray(progress)) return 0;

  const wantedType = lower(type);
  const solvedIds = new Set<string>();

  for (const item of progress as AnswerEvent[]) {
    if (Number(item?.level) !== level) continue;
    if (lower(item?.type) !== wantedType) continue;
    if (item?.correct !== true) continue;

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
      return res.status(400).json({ message: "Missing email or profileName" });
    }

    // ✅ only READ
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const profiles = (user.profiles ?? []) as any[];
    const profile = profiles.find((p) => p.profileName === profileName);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // ✅ your real mongo shape: progress is an array of answer events
    const progressArr: AnswerEvent[] = Array.isArray(profile.progress) ? profile.progress : [];

    // ----------------------------
    // 1) Totals per (level,type)
    // ----------------------------
    const totalsLT = (await Exercise.aggregate([
      { $group: { _id: { level: "$level", type: "$type" }, total: { $sum: 1 } } },
    ])) as TotalRowLT[];

    const totalMapLT = new Map<string, number>();
    for (const t of totalsLT) {
      totalMapLT.set(`${t._id.level}:${lower(t._id.type)}`, t.total);
    }

    // ----------------------------
    // 2) Totals per (level,topic,type)  ✅ for topic pages
    // ----------------------------
    const totalsLTT = (await Exercise.aggregate([
      { $group: { _id: { level: "$level", topic: "$topic", type: "$type" }, total: { $sum: 1 } } },
    ])) as TotalRowLTT[];

    // totalsByLevelTopicType[level][topic][type] = total
    const totalsByLevelTopicType: Record<string, Record<string, Record<string, number>>> = {};
    for (const row of totalsLTT) {
      const lvl = String(row._id.level);
      const topic = String(row._id.topic || "Other").trim().toLowerCase();
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
    // 3) Cards for Progress page (level+type)
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
        const solved = getSolvedCount(progressArr, level, type);
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
    // 4) Topic summary: byLevelTopicType  reuse in other pages
    // byLevelTopicType[level][topic][type] = { solved,total,percent }
    // ----------------------------
    const byLevelTopicType: Record<
      string,
      Record<string, Record<string, { solved: number; total: number; percent: number }>>
    > = {};

    // Build solved sets per group (level|topic|type)
    const solvedSets: Record<string, Set<string>> = {};
    for (const item of progressArr) {
      if (item?.correct !== true) continue;

      const lvl = String(Number(item?.level));
      if (!lvl || lvl === "NaN") continue;

      const topic = String(item?.topic || "Other").trim().toLowerCase();
      const type = lower(item?.type);
      if (!type) continue;

      const qid = String(item?.questionId || "");
      if (!qid) continue;

      const k = `${lvl}|${topic}|${type}`;
      solvedSets[k] ??= new Set<string>();
      solvedSets[k].add(qid);
    }

 // Use totals as baseline so every topic/type that exists in DB appears
for (const lvl of Object.keys(totalsByLevelTopicType)) {
  const topicsObj = totalsByLevelTopicType[lvl] ?? {}; //  fallback
  byLevelTopicType[lvl] ??= {};

  for (const topic of Object.keys(topicsObj)) {
    const typesObj = topicsObj[topic] ?? {}; //  fallback
    byLevelTopicType[lvl][topic] ??= {};

    for (const typeKey of Object.keys(typesObj)) {
      //  total for THIS (level+topic+type)
      const total = typesObj[typeKey] ?? 0;

      const solved = solvedSets[`${lvl}|${topic}|${typeKey}`]?.size ?? 0;
      const percent = total === 0 ? 0 : Math.round((solved / total) * 100);

      byLevelTopicType[lvl][topic][typeKey] = { solved, total, percent };
    }
  }
}

    // Return both (cards for progress page + topic summary for other pages)
    return res.json({ success: true, cards, byLevelTopicType });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}
