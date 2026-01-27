import React from "react";
import { useTheme } from "../context/ThemeContext";

// Props for the authentication header component
// - title: main heading text
// - subtitle: supporting descriptive text
type Props = {
  title?: string;
  subtitle?: string;
};

// Reusable header component for authentication screens (login, register, etc.)
export default function LoginHeader({
  title = "Login",
  subtitle = "Enter your credentials to continue",
}: Props) {
  const { darkMode } = useTheme();

  return (
    <>
      {/* Main title of the authentication form */}
      <h2
        className="auth-title"
        style={{
          color: darkMode ? "#86e07f" : "#16a34a", // ירוק תואם למערכת
          transition: "color 0.3s ease",
        }}
      >
        {title}
      </h2>

      {/* Subtitle providing additional guidance to the user */}
      <p
        className="auth-subtitle"
        style={{
          color: darkMode ? "#cbd5f5" : "#475569",
          transition: "color 0.3s ease",
        }}
      >
        {subtitle}
      </p>
    </>
  );
}
