import { useState, useEffect } from "react";

interface ProgressCardProps {
  title: string;
  level: number;
  progress: number;
  icon: string;
  url?: string;
  solved?: number;
  total?: number;
  onClick?: () => void;
}

export default function ProgressCard({
  title,
  level,
  progress,
  icon,
  url = "",
  solved,
  total,
  onClick,
}: ProgressCardProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedProgress(progress), 80);
    return () => clearTimeout(timeout);
  }, [progress]);

  const go = () => {
    if (onClick) return onClick();
    if (url) window.location.href = url;
  };

  return (
    <div
      onClick={go}
      className="
        relative group p-6 rounded-3xl shadow-xl border cursor-pointer
        hover:scale-[1.02] transition-transform
        bg-white text-slate-900 border-slate-200
        dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700
      "
    >
      <div
        className="
          absolute top-0 right-0 p-5 opacity-20 text-7xl
          grayscale transition-all duration-500
          group-hover:opacity-50 group-hover:grayscale-0 group-hover:rotate-6
        "
      >
        {icon}
      </div>

      <div className="relative z-10">
        <div className="flex justify-between mb-3 items-center">
          <h3 className="text-xl font-bold capitalize">{title}</h3>
          <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold">
            Level {level}
          </span>
        </div>

        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-4 mb-3">
          <div
            className="bg-green-600 h-4 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>

        <span className="text-gray-500 dark:text-slate-300">
          {progress}% Completed
          {typeof solved === "number" && typeof total === "number" ? ` • ${solved}/${total}` : ""}
        </span>
      </div>
    </div>
  );
}
