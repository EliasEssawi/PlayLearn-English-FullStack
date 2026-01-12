import LevelButton from "./LevelButton";

export type TopicLevel = {
  id: number;
  icon: string;
};

type TopicCardProps = {
  title: string;
  emoji: string;
  levels: TopicLevel[];
  unlockedLevel: number;
  onLevelClick: (levelId: number) => void;
};

export default function TopicCard({
  title,
  emoji,
  levels,
  unlockedLevel,
  onLevelClick,
}: TopicCardProps) {
  return (
    <div className="bg-[#132229] rounded-2xl p-6 shadow-lg">
      {/* Topic Header */}
      <h2 className="text-center text-pink-400 text-xl font-bold mb-6">
        {emoji} {title}
      </h2>

      {/* Levels */}
      <div className="flex flex-col gap-8">
        {levels.map((level, index) => (
          <div key={level.id} className="flex justify-center">
            <LevelButton
              icon={level.icon}
              locked={level.id > unlockedLevel}
              direction={index % 2 === 0 ? "left" : "right"}
              onClick={() => onLevelClick(level.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
