import React from "react";
import { useTheme } from "../context/ThemeContext";

// Wrapper component for authentication-related content
// Used to provide consistent styling/layout for login and auth forms
type Props = {
  children: React.ReactNode;
};

export default function LoginCard({ children }: Props) {
  const { darkMode } = useTheme();

  return (
    <div
      className="auth-card"
      style={{
        backgroundColor: darkMode ? "#000000" : "#ffffff",
        color: darkMode ? "#f8fafc" : "#0f172a",
        border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {children}
    </div>
  );
}
