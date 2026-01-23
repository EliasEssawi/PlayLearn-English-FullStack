type LevelButtonProps = {
  icon: string;
  locked?: boolean;
  direction?: "left" | "right";
  onClick?: () => void;
  darkMode?: boolean; 
  completed?: boolean;
};

export default function LevelButton({
  icon,
  locked = false,
  direction = "left",
  onClick,
  darkMode = false,
}: LevelButtonProps) {
  
  // לוגיקת הצבעים: ב-Dark Mode העיגול לבן והאייקון שחור
  const getDynamicStyles = () => {
    if (locked) {
      return "bg-gray-600 text-gray-300 shadow-[0_6px_0_#374151] cursor-not-allowed";
    }
    if (darkMode) {
      return "bg-white text-black shadow-[0_8px_0_#d1d5db] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_4px_0_#d1d5db]";
    }
    return "bg-pink-400 text-white shadow-[0_8px_0_#be185d] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_4px_0_#be185d]";
  };

  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`
        relative
        w-20 h-20 rounded-full
        flex items-center justify-center
        text-2xl font-bold
        select-none
        transition-all duration-150
        ${direction === "left" ? "-translate-x-10" : "translate-x-10"}
        ${getDynamicStyles()}
      `}
    >
      {icon}
    </button>
  );
}