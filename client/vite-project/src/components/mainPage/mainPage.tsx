import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Progrees from "./Progress";


import ChatBot from "./chatbot";
import { MenuItem, SidebarAction } from "../../Types/Section";

import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";
import { useTheme } from "../../context/ThemeContext";

export default function MainPage() {
  const navigate = useNavigate();

  useEffect(() => {
    isLoggedIn().then(ok => {
      if (!ok) navigate("/login");
    });
  }, []);

  const { darkMode, toggleDarkMode } = useTheme();

  const menuItems: MenuItem[] = [
    { name: "Talking", icon: "🗣️" },
    { name: "Reading", icon: "📖" },
    { name: "Listening", icon: "🎧" },
    { name: "Vocabulary", icon: "🔤" },
    { name: "AI Chat", icon: "🤖" },
  ];

  const menuItemsSecondry: MenuItem[] = [
    { name: "View Progress", icon: "📊" },
    { name: "Profile", icon: "👤" }
  ];

  const [activeSection, setActiveSection] = useState("Talking");

  const activeMenuItem =
    menuItems.find(m => m.name === activeSection) ||
    menuItemsSecondry.find(m => m.name === activeSection);

  const renderMainContent = () => {
    switch (activeSection) {
      case "View Progress":

        return(<Progrees onSelectSection={setActiveSection} />)
      

      case "Talking":
      case "Reading":
      case "Listening":
      case "Vocabulary":
      case "AI Chat":return (<ChatBot/>);
    

      default:
        return (
          <div className="text-[var(--text-muted)] text-lg italic">
            This section is coming soon 🚧
          </div>
        );
    }
  };

  return (
    /* 🌍 רקע כללי של כל המסך */
    <div
      className="
        h-screen w-full flex items-center justify-center p-4 overflow-hidden
        font-[Poppins]
        bg-[var(--bg-main)]
        text-[var(--text-main)]
      "
    >
      {/* 🧱 הקארד המרכזי */}
      <div
        className="
          flex w-full max-w-7xl h-[95vh]
          rounded-3xl overflow-hidden
          shadow-2xl
          bg-[var(--bg-card)]
          border border-[var(--border)]
        "
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
            icon: "🛒",
          }}
        />

        <main className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col gap-8">
          {/* 🌙 כפתור Dark Mode */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="
                px-4 py-2 rounded-full text-sm font-semibold
                bg-[var(--bg-card)]
                border border-[var(--border)]
                hover:opacity-80 transition
              "
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
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

          <div>
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
