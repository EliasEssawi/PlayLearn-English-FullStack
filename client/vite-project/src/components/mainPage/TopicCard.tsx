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
  completedUpTo?: number;
  onLevelClick: (levelId: number) => void;
  darkMode: boolean;
};
// Props for TopicCard component

export default function TopicCard({
  title,
  emoji,
  levels,
  unlockedLevel,
  completedUpTo = 0,
  onLevelClick,
  darkMode,
}: TopicCardProps) {
  return (
    <div
      className="rounded-2xl p-6 shadow-lg transition-colors duration-300"
      style={{
        backgroundColor: darkMode ? "#000000" : "#86e07f",
      }}
    >
      {/* Topic title */}
      <h2     
        className="text-center text-xl font-bold mb-6"
        style={{ color: darkMode ? "#ffffff" : "#132229" }}
      >
        {emoji} {title}
      </h2>
            {/* Levels container */}

      <div className="flex flex-col gap-8">
        {levels.map((level, index) => {
          const isCompleted = level.id <= completedUpTo;

          return (
            <div key={level.id} className="flex justify-center">
              <LevelButton
                icon={level.icon}
                locked={level.id > unlockedLevel}
                direction={index % 2 === 0 ? "left" : "right"}
                onClick={() => onLevelClick(level.id)}
                darkMode={darkMode}
                completed={isCompleted}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
