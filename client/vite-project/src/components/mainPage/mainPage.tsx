import React, { useEffect, useState } from "react";
import Sidebar from "../mainPage/Sidebar";
import Header from "../mainPage/Header";
import Progrees from "../mainPage/ProgressChild";
import ChatBot from "../mainPage/chatbot";
import VocabularyHome from "../vocabulary/vocabularyHome";
import { MenuItem } from "../../Types/Section";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";
import MainLayout from "../authintication/MainLayout";
import TopicsPage from "./TopicsPage";
import { useTheme } from "../context/ThemeContext";

export default function MainPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  /* 🔐 Check login */
  useEffect(() => {
    isLoggedIn().then(ok => {
      if (!ok) navigate("/login");
    });
  }, [navigate]);

  const menuItems: MenuItem[] = [
    { name: "Talking", icon: "🗣️" },
    { name: "Reading", icon: "📖" },
    { name: "Listening", icon: "🎧" },
    { name: "Translate", icon: "🔤" },
    { name: "Fill the blank", icon: "🔤" },
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

  /* 📦 localStorage */
  const activeProfileRaw = localStorage.getItem("activeProfile");
  const activeProfile = activeProfileRaw ? JSON.parse(activeProfileRaw) : null;

  const parentEmail = localStorage.getItem("loggedInUser");
  const childName = activeProfile?.email?.profileName;

  const [points, setPoints] = useState(0);

  // ⏱ initial load (for refresh / first entry)
  function calculatePointsFromLocalStorage(): number {
    const raw = localStorage.getItem("activeProfile");
    if (!raw) return 0;

    const profile = JSON.parse(raw);
    const answers = profile?.email?.progress?.answers;

    if (!Array.isArray(answers)) return 0;

    const solvedIds = new Set<string>();
    for (const a of answers) {
      if (a?.correct === true && a?.questionId) {
        solvedIds.add(String(a.questionId));
      }
    }

    return solvedIds.size * 10;
  }

  useEffect(() => {
    setPoints(calculatePointsFromLocalStorage());
  }, []);

  // ⭐⭐⭐ THIS IS THE FIX – live points update ⭐⭐⭐
  useEffect(() => {
    const onPointsUpdated = (e: any) => {
      const delta = Number(e?.detail?.delta ?? 0);
      if (delta > 0) {
        setPoints(prev => prev + delta);
      }
    };

    window.addEventListener("points-updated", onPointsUpdated);
    return () => {
      window.removeEventListener("points-updated", onPointsUpdated);
    };
  }, []);
  // ⭐⭐⭐ END FIX ⭐⭐⭐

  const renderMainContent = () => {
    switch (activeSection) {
      case "View Progress":
        if (!parentEmail || !childName) {
          return (
            <div style={{ color: "#6b7280", fontStyle: "italic" }}>
              Please select a child profile first 👶
            </div>
          );
        }
        return <Progrees parentEmail={parentEmail} childName={childName} />;

      case "AI Chat":
        return <ChatBot darkMode={darkMode} />;

      case "Vocabulary":
        return <VocabularyHome />;

      case "Talking":
        return <TopicsPage exercisesType="Talking" darkMode={darkMode} />;

      case "Listening":
        return <TopicsPage exercisesType="Listening" darkMode={darkMode} />;

      case "Fill the blank":
        return <TopicsPage exercisesType="Fill the blank" darkMode={darkMode} />;

      case "Translate":
        return <TopicsPage exercisesType="Translate" darkMode={darkMode} />;

      case "Reading":
        return <TopicsPage exercisesType="Reading" darkMode={darkMode} />;

      default:
        return (
          <div style={{ color: darkMode ? "#d1d5db" : "#6b7280", fontStyle: "italic" }}>
            This section is coming soon 🚧
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div
        className="flex w-full max-w-7xl h-[85vh] mx-auto rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: darkMode ? "#020617" : "#ffffff",
          border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
          marginTop: "20px",
        }}
      >
        <Sidebar
          menuItems={menuItems}
          title="Menu"
          activeSection={activeSection}
          onSelect={setActiveSection}
          secondaryMenu={menuItemsSecondry}
          bottomAction={{ section: "Shop", label: "Go to Shop", icon: "🛒" }}
          darkMode={darkMode}
        />

        <main className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col gap-8">
          <Header
            title={activeMenuItem ? `${activeMenuItem.name} ${activeMenuItem.icon}` : activeSection}
            subtitle="Welcome back! You are doing great."
            points={points}
            imgUrl="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
          />

          <div className="flex-1">{renderMainContent()}</div>
        </main>
      </div>
    </MainLayout>
  );
}
