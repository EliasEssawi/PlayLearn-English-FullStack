interface AchievementProps {
  icon: string;
  title: string;
  description: string;
  color?: string;
}
// RECENT ACHIEVEMENT CARD

export default function RecentAchievement({ icon, title, description, color = "yellow-100" }: AchievementProps) {
  return (
    <div className={`bg-blue-200 p-6 rounded-2xl flex items-center gap-4 border border-gray-100`}>
      <div className={`p-3 rounded-full text-2xl bg-${color}`}>{icon}</div>
      <div>      {/* Achievement text */}

        <p className="font-bold text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
