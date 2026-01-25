import React from "react";
import { useTheme } from "../context/ThemeContext";
import DarkModeToggle from "./DarkModeToggle";
import LogoutButton from "./LogoutButton";
import BackButton from "./BackButton";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { darkMode } = useTheme();

  return (
    <div
      style={{
        background: darkMode ? "#020617" : "#f8fafc",
        color: darkMode ? "#f8fafc" : "#0f172a",
        minHeight: "100vh",
        transition: "all 0.3s",
      }}
    >
      <header style={{
        background: "#86e07f",
        padding: "0.75rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h1 style={{ color: "white", margin: 0 }}>PlayLearn</h1>

        <div style={{ display: "flex", gap: "12px" }}>
          <BackButton />
          <LogoutButton />

          <DarkModeToggle />

        </div>
      </header>

      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
};

export default MainLayout;
