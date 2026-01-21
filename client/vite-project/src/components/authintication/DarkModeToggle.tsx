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
        borderRadius: "8px",
        padding: "6px 12px",
        display: "flex",
        gap: "6px",
        alignItems: "center",
        cursor: "pointer"
      }}
    >
      {darkMode ? <LuSun /> : <LuMoon />}
      {darkMode ? "Light" : "Dark"}
    </button>
  );
};

export default DarkModeToggle;
