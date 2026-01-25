import React from "react";
import { LuSun, LuMoon } from "react-icons/lu";
import { useTheme } from "../context/ThemeContext";

// Toggle button for switching between light mode and dark mode
const DarkModeToggle: React.FC = () => {
  // Access current theme state and toggle function from ThemeContext
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode} // Toggles the global dark mode state
      style={{
        background: darkMode ? "#1e293b" : "#ffffff", // Background adapts to theme
        color: darkMode ? "#f8fafc" : "#0f172a",      // Text color adapts to theme
        border: "1px solid #e2e8f0",

        borderRadius: "9999px",   // Rounded pill-shaped button
        padding: "8px 16px",
        height: "38px",

        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
      }}
    >
      {/* Icon and label change according to the current theme */}
      {darkMode ? <LuSun size={16} /> : <LuMoon size={16} />}
      {darkMode ? "Light" : "Dark"}
    </button>
  );
};

export default DarkModeToggle;
