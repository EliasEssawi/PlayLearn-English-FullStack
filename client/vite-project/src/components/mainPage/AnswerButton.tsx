type AnswerButtonProps = {
  index: number
  text: string
  state: "idle" | "correct" | "wrong" | "disabled"
  onClick: () => void
}

export default function AnswerButton({
  index,
  text,
  state,
  onClick,
}: AnswerButtonProps) {
  const base =
    "w-full flex items-center gap-4 px-4 py-4 rounded-xl font-semibold text-lg transition-all select-none"

  const styles = {
    idle:
      "bg-[#1f2d33] border-2 border-[#2f3f46] text-white " +
      "shadow-[0_6px_0_#162227] hover:-translate-y-0.5 hover:shadow-[0_8px_0_#162227]",
    correct:
      "bg-[#243b2f] border-2 border-lime-500 text-lime-400 " +
      "shadow-[0_6px_0_#1a2c22]",
    wrong:
      "bg-[#3a2424] border-2 border-red-500 text-red-400 " +
      "shadow-[0_6px_0_#2a1a1a]",
    disabled:
      "bg-[#1f2d33] border-2 border-[#2f3f46] text-gray-500 opacity-60",
  }

  return (
    <button
      onClick={onClick}
      disabled={state !== "idle"}
      className={`${base} ${styles[state]}`}
    >
      {/* number badge */}
      <div className="w-8 h-8 flex items-center justify-center rounded-md border border-current text-sm">
        {index}
      </div>

      {text}
    </button>
  )
}
