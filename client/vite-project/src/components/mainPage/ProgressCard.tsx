import { useState, useEffect } from "react";

interface ProgressCardProps {
  title: string;
  level: number;
  progress: number;
  icon: string;
  url: string;
  onClick?: () => void; // ✅ optional onClick handler
}

export default function ProgressCard({
  title,
  level,
  progress,
  icon,
  url,
  onClick,
}: ProgressCardProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timeout);
  }, [progress]);

  const navigate = (url: string) => {
    window.location.href = url;
  };

  return (
    <div
      onClick={onClick ? onClick : () => navigate(url)}
      className="
        relative group p-8 rounded-3xl shadow-xl border cursor-pointer
        hover:scale-105 transition-transform
        bg-white text-slate-900 border-slate-200
        dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700
      "
    >
      {/* Emoji */}
      <div className="
          absolute top-0 right-0 p-6 opacity-20 text-8xl text-green-600 grayscale transition-all duration-500
          group-hover:opacity-50 group-hover:grayscale-0 group-hover:rotate-12 group-hover:scale-110
        ">
        {icon}
      </div>

      <div className="relative z-10">
        <div className="flex justify-between mb-4">
          <h3 className="text-2xl font-bold">{title}</h3>
          <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-bold">
            Level {level}
          </span>
        </div>

        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-4 mb-4">
          <div
            className="bg-green-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(65,157,120,0.5)]"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
        <span className="text-gray-500 dark:text-slate-300">{progress}% Completed</span>
      </div>
    </div>
  );
}
