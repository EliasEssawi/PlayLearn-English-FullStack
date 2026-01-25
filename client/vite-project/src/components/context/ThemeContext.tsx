import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  darkMode: boolean;          // current theme state (true = dark)
  toggleDarkMode: () => void; // function to flip dark/light mode
};

// Create a context to share theme state across the app
const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage (persisted between refreshes)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Persist theme choice whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Toggle helper used by UI (e.g., a dark mode button)
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    // Provide darkMode + toggle function to all components under this provider
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for consuming the theme context
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  
  // Safety: ensure hook is used only inside <ThemeProvider>
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
