type AnswerButtonProps = {
  index: number
  text: string
  state: "idle" | "correct" | "wrong" | "disabled"
  onClick: () => void
  darkMode: boolean
}

export default function AnswerButton({
  index,
  text,
  state,
  onClick,
  darkMode,
}: AnswerButtonProps) {
  const base =
    "w-full flex items-center gap-4 px-4 py-4 rounded-xl font-semibold text-lg transition-all select-none"

  // הגדרת סגנונות לפי darkMode ומצב הכפתור
  const getStylesByState = () => {
    switch (state) {
      case "correct":
        return "bg-[#243b2f] border-2 border-lime-500 text-lime-400 shadow-[0_6px_0_#1a2c22]";
      case "wrong":
        return "bg-[#3a2424] border-2 border-red-500 text-red-400 shadow-[0_6px_0_#2a1a1a]";
      case "disabled":
        return `${darkMode ? "bg-[#1f2d33]" : "bg-[#86e07f]"} border-2 border-transparent text-gray-500 opacity-60`;
      case "idle":
      default:
        return darkMode 
          ? "bg-[#1f2d33] border-2 border-[#2f3f46] text-white shadow-[0_6px_0_#162227] hover:-translate-y-0.5 hover:shadow-[0_8px_0_#162227]"
          : "bg-[#86e07f] border-2 border-[#6bc465] text-[#0f172a] shadow-[0_6px_0_#58a352] hover:-translate-y-0.5 hover:shadow-[0_8px_0_#58a352]";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={state !== "idle"}
      className={`${base} ${getStylesByState()}`}
    >
      {/* מספר זיהוי (Badge) */}
      <div className="w-8 h-8 flex items-center justify-center rounded-md border border-current text-sm font-bold shrink-0">
        {index}
      </div>

      {/* טקסט התשובה */}
      <span className="flex-1 text-right lg:text-center">{text}</span>
    </button>
  )
}