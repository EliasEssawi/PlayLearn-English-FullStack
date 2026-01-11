import React from "react";
import { LuSun, LuMoon } from "react-icons/lu";

interface Props {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const DarkModeToggle: React.FC<Props> = ({ darkMode, setDarkMode }) => {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      style={{
        background: darkMode ? "#1e293b" : "#ffffff",
        color: darkMode ? "#f8fafc" : "#0f172a",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "6px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px"
      }}
    >
      {darkMode ? <LuSun size={18} /> : <LuMoon size={18} />}
      <span style={{ fontSize: "0.9rem" }}>{darkMode ? "Light" : "Dark"}</span>
    </button>
  );
};

export default DarkModeToggle;