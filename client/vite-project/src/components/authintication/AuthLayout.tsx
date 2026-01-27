// layouts/AuthLayout.tsx
import React from "react";
import { useTheme } from "../context/ThemeContext";
import DarkModeToggle from "../authintication/DarkModeToggle";

type Props = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
  const { darkMode } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#020617" : "#f8fafc",
        color: darkMode ? "#f8fafc" : "#0f172a",
        transition: "all 0.3s",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* 🌙 Dark Mode Toggle */}
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <DarkModeToggle />
      </div>

      {children}
    </div>
  );
}
