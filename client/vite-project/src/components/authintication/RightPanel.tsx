import React from "react";
import { useTheme } from "../context/ThemeContext";

type Props = {
  title?: string;
  description?: string;
  footer?: string;
};

export default function LoginRightPanel({
  title = "Welcome Back 👋",
  description = "Continue your learning journey and track your progress across talking, reading, listening and vocabulary.",
  footer = "© 2025 Your App",
}: Props) {
  const { darkMode } = useTheme();

  return (
    // Right side of the auth card (welcome/info panel)
    <div
      className="auth-right"
      style={{
        backgroundColor: darkMode ? "#000000" : "#4aa27a",
        color: "#ffffff",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Main title / greeting */}
      <h1 className="welcome-title">{title}</h1>

      {/* Short description under the title */}
      <p className="welcome-text">{description}</p>

      {/* Footer text at the bottom */}
      <div className="welcome-footer">{footer}</div>
    </div>
  );
}
