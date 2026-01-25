import React from "react";
import { LuSun, LuMoon } from "react-icons/lu";
import { useTheme } from "../context/ThemeContext";

const DarkModeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      style={{
        background: darkMode ? "#1e293b" : "#ffffff",
        color: darkMode ? "#f8fafc" : "#0f172a",
        border: "1px solid #e2e8f0",

        /* 🔽 השינוי היחיד */
        borderRadius: "9999px",   // צורה עגולה / pill
        padding: "8px 16px",
        height: "38px",

        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
      }}
    >
      {darkMode ? <LuSun size={16} /> : <LuMoon size={16} />}
      {darkMode ? "Light" : "Dark"}
    </button>
  );
};

export default DarkModeToggle;
