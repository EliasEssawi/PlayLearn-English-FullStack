import { useEffect } from "react";

type ResultBarProps = {
  correct: boolean;
  onContinue: () => void;
};

export default function ResultBar({ correct, onContinue }: ResultBarProps) {

  // Automatically continue after a delay (10 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between
      ${correct ? "bg-[#1f3b2a]" : "bg-[#3b1f1f]"}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center
          ${correct ? "bg-lime-500" : "bg-red-500"}`}
        >
          ✓
        </div>
        <span className="text-lg font-bold text-white">
          {correct ? "Nice!" : "Oops!"}
        </span>
      </div>

      {/* Continue button (optional, auto-continue is enabled) */}
      <button
        onClick={onContinue}
        className="bg-lime-500 text-black px-6 py-2 rounded-full font-bold hover:bg-lime-400"
      >
        CONTINUE
      </button>
    </div>
  );
}
