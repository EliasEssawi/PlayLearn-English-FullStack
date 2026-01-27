import React from "react";
import { useTheme } from "../context/ThemeContext";

// Wrapper component for the left section of authentication pages
// Used to structure and style the main form content
type Props = {
  children: React.ReactNode;
};

export default function LoginLeftPanel({ children }: Props) {
  const { darkMode } = useTheme();

  return (
    <div
      className="auth-left"
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        // black background in dark mode
        backgroundColor: darkMode ? "#000000" : "#ffffff", 
        color: darkMode ? "#f8fafc" : "#0f172a",
        transition: "all 0.3s ease",
      }}
    >
      {/* Inner container for aligning and spacing auth form elements */}
      <div
        className="auth-left-inner"
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
