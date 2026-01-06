import React, { useState, useEffect } from "react";
import { LuSun, LuMoon } from "react-icons/lu";

import Sidebar from "../components/mainPage/Sidebar";
import Header from "../components/mainPage/Header";
import Progrees from "../components/mainPage/Progress";
import ChatBot from "../pages/chatbot";

import { MenuItem } from "../Types/Section";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export default function MainPage() {
  const navigate = useNavigate();

  /* 🔐 Check login */
  useEffect(() => {
    isLoggedIn().then(ok => {
      if (!ok) navigate("/login");
    });
  }, [navigate]);

  /* 🌙 Dark Mode – LOCAL */
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const menuItems: MenuItem[] = [
    { name: "Talking", icon: "🗣️" },
    { name: "Reading", icon: "📖" },
    { name: "Listening", icon: "🎧" },
    { name: "Vocabulary", icon: "🔤" },
    { name: "AI Chat", icon: "🤖" },
  ];

  const menuItemsSecondry: MenuItem[] = [
    { name: "View Progress", icon: "📊" },
    { name: "Profile", icon: "👤" },
  ];

  const [activeSection, setActiveSection] = useState("Talking");

  const activeMenuItem =
    menuItems.find(m => m.name === activeSection) ||
    menuItemsSecondry.find(m => m.name === activeSection);

  const renderMainContent = () => {
    switch (activeSection) {
      case "View Progress":
        return <Progrees onSelectSection={setActiveSection} />;

      case "Talking":
      case "Reading":
      case "Listening":
      case "Vocabulary":
      case "AI Chat":
        return <ChatBot darkMode={darkMode} />;

      default:
        return (
          <div
            style={{
              color: darkMode ? "#d1d5db" : "#6b7280",
              fontStyle: "italic",
              fontSize: "1.1rem",
            }}
          >
            This section is coming soon 🚧
          </div>
        );
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center p-4 overflow-hidden font-[Poppins]"
      style={{
        background: darkMode ? "#020617" : "#f8fafc",
        color: darkMode ? "#f8fafc" : "#0f172a",
      }}
    >
      {/* 🧱 Main Card */}
      <div
        className="flex w-full max-w-7xl h-[95vh] rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: darkMode ? "#020617" : "#ffffff",
          border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
        }}
      >
        <Sidebar
          menuItems={menuItems}
          title="Menu"
          activeSection={activeSection}
          onSelect={setActiveSection}
          secondaryMenu={menuItemsSecondry}
          bottomAction={{
                section: "Shop",
                label: "Go to Shop",
                icon: "🛒", }}
         darkMode={darkMode}
         />
  

        <main className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col gap-8">
          {/* 🌙☀️ Dark Mode Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition"
              style={{
                background: darkMode ? "#020617" : "#ffffff",
                color: darkMode ? "#f8fafc" : "#0f172a",
                border: darkMode
                  ? "1px solid #334155"
                  : "1px solid #e2e8f0",
              }}
            >
              {darkMode ? <LuSun size={18} /> : <LuMoon size={18} />}
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>

          <Header
            title={
              activeMenuItem
                ? `${activeMenuItem.name} ${activeMenuItem.icon}`
                : activeSection
            }
            subtitle="Welcome back! You are doing great."
            points={120}
            imgUrl="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
          />

          <div>{renderMainContent()}</div>
        </main>
      </div>
    </div>
  );
}
