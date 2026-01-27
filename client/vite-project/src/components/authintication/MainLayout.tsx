import React from "react";
import { useTheme } from "../context/ThemeContext";
import DarkModeToggle from "./DarkModeToggle";
import LogoutButton from "./LogoutButton";
import BackButton from "./BackButton";


// Main layout wrapper for authenticated pages
// Provides global header, theme styling, and navigation actions
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Access current theme state
  const { darkMode } = useTheme();

  return (
    <div
      style={{
        background: darkMode ? "#020617" : "#f8fafc",// Page background based on theme
        color: darkMode ? "#f8fafc" : "#0f172a",      // Text color based on theme
        minHeight: "100vh",
        transition: "all 0.3s",
      }}
    >
      {/* Top application header */}
     <header
  style={{
    background: darkMode ? "#020617" : "#86e07f",
    padding: "0.75rem 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
    transition: "all 0.3s",
  }}
>
  {/* Application title */}
  <h1
    style={{
      color: darkMode ? "#f8fafc" : "#ffffff",
      margin: 0,
      transition: "color 0.3s",
    }}
  >
    PlayLearn
  </h1>

  {/* Header action buttons */}
  <div style={{ display: "flex", gap: "12px" }}>
    <BackButton />
    <LogoutButton />
    <DarkModeToggle />
  </div>
</header>


      {/* Main page content */}
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
};

export default MainLayout;
