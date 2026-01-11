import React from "react";
import DarkModeToggle from "./DarkModeToggle"; // וודא ששם הקובץ בתיקייה תואם
import LogoutButton from "./LogoutButton";

type LayoutProps = {
  children: React.ReactNode;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
};

const MainLayout: React.FC<LayoutProps> = ({ children, darkMode, setDarkMode }) => {
  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{
        background: darkMode ? "#020617" : "#f8fafc",
        color: darkMode ? "#f8fafc" : "#0f172a",
        minHeight: "100vh"
      }}
    >
      <header style={{
        background: "#86e07f",
        padding: "0.75rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "1.5rem" }}>PlayLearn</h1>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          <LogoutButton />
        </div>
      </header>

      <main style={{ padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;