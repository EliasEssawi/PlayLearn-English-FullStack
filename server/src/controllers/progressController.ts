import { Request, Response } from "express";
import { User } from "../models/User";
import { Exercise } from "../models/Exercise";

const TYPES = ["translate", "complete", "listening", "talking", "reading"] as const;
type ExerciseType = (typeof TYPES)[number];

function getSolvedCount(progress: any, level: number, type: ExerciseType): number {
  if (!progress) return 0;

  const lvl = progress[level] ?? progress[String(level)] ?? progress[`level${level}`];
  if (!lvl) return 0;

  const node = lvl[type] ?? lvl[String(type).toLowerCase()];
  if (node == null) return 0;

  if (typeof node === "number") return node;
  if (Array.isArray(node)) return node.length;

  if (typeof node === "object") {
    if (typeof node.solved === "number") return node.solved;
    if (Array.isArray(node.solvedIds)) return node.solvedIds.length;
    if (Array.isArray(node.done)) return node.done.length;
  }

  return 0;
}

type TotalRow = { _id: { level: number; type: string }; total: number };

export async function getProfileProgress(req: Request, res: Response) {
  try {
    const email = req.params.email;
    const profileName = req.params.profileName;

    // Express params can be undefined in types → guard
    if (!email || !profileName) {
      return res.status(400).json({ message: "Missing email or profileName" });
    }

    //  lean() avoids heavy mongoose doc typing issues when you only READ
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // profiles might be undefined in typings → safe default
    const profiles = (user.profiles ?? []) as any[];
    const profile = profiles.find((p) => p.profileName === profileName);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const totals = (await Exercise.aggregate([
      { $group: { _id: { level: "$level", type: "$type" }, total: { $sum: 1 } } },
    ])) as TotalRow[];

    const totalMap = new Map<string, number>();
    for (const t of totals) {
      totalMap.set(`${t._id.level}:${String(t._id.type).toLowerCase()}`, t.total);
    }

    const icons: Record<ExerciseType, string> = {
      translate: "🌍",
      complete: "✍️",
      listening: "🎧",
      talking: "🗣️",
      reading: "📖",
    };

    const cards: Array<{ title: string; level: number; progress: number; icon: string; url: string }> = [];

    for (let level = 1; level <= 5; level++) {
      for (const type of TYPES) {
        const solved = getSolvedCount(profile.progress, level, type);

        //  totalMap key uses lowercase type, keep consistent
        const total = totalMap.get(`${level}:${type}`) ?? 0;

        const percent = total === 0 ? 0 : Math.round((solved / total) * 100);

        cards.push({
          title: `${type}`,
          level,
          progress: percent,
          icon: icons[type], // ✅ now guaranteed string
          url: "",
        });
      }
    }

    return res.json({ cards });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}
