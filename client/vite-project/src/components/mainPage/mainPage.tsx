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
import OnlineChatWidget from "../mainPage/OnlineChatWidget";
import Online from "../mainPage/Online";
import FloatingCallButton from "../call/FloatingCallButton";

export default function MainPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🔐 Auth Guard
  useEffect(() => {
    isLoggedIn().then((ok) => {
      if (!ok) navigate("/login");
    });
  }, [navigate]);

  // Sidebar Menu
  const menuItems: MenuItem[] = [
    { name: "Talking", icon: "🗣️" },
    { name: "Reading", icon: "📖" },
    { name: "Listening", icon: "🎧" },
    { name: "Translate", icon: "🔤" },
    { name: "Fill the blank", icon: "🔤" },
    { name: "AI Chat", icon: "🤖" },
    { name: "Play Online", icon: "👤" },
  ];

  const menuItemsSecondry: MenuItem[] = [{ name: "View Progress", icon: "📊" }];

  const [activeSection, setActiveSection] = useState("Talking");

  const activeMenuItem =
    menuItems.find((m) => m.name === activeSection) ||
    menuItemsSecondry.find((m) => m.name === activeSection);

  // Active Profile from localStorage
  const activeProfileRaw = localStorage.getItem("activeProfile");
  const activeProfile = activeProfileRaw ? JSON.parse(activeProfileRaw) : null;

  const parentEmail = String(localStorage.getItem("loggedInUser") || "")
    .trim()
    .toLowerCase();

  const childName = String(
    activeProfile?.profileName || activeProfile?.email?.profileName || ""
  ).trim();

  // ⭐ Points
  const [points, setPoints] = useState(0);

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

  useEffect(() => {
    const onPointsUpdated = (e: any) => {
      const delta = Number(e?.detail?.delta ?? 0);
      if (delta > 0) setPoints((prev) => prev + delta);
    };
    window.addEventListener("points-updated", onPointsUpdated);
    return () => window.removeEventListener("points-updated", onPointsUpdated);
  }, []);

  // Main content switch
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

      case "Play Online":
        //  NO socket prop. Online should use useCall() to access socket.
        return <Online darkMode={darkMode} />;

      default:
        return (
          <div
            style={{
              color: darkMode ? "#d1d5db" : "#6b7280",
              fontStyle: "italic",
            }}
          >
            This section is coming soon 🚧
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div
        className="
          w-full max-w-7xl mx-auto rounded-3xl shadow-2xl
          overflow-visible md:overflow-hidden
          md:h-[85vh]
        "
        style={{
          background: darkMode ? "#020617" : "#ffffff",
          border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
          marginTop: "20px",
        }}
      >
        {/* Mobile top bar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: darkMode ? "#334155" : "#e2e8f0" }}
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`px-3 py-2 rounded-xl ${
              darkMode ? "bg-white/10 text-white" : "bg-black/10 text-black"
            }`}
          >
            ☰ Menu
          </button>

          <div className={`font-bold ${darkMode ? "text-white" : "text-black"}`}>
            {activeMenuItem
              ? `${activeMenuItem.icon} ${activeMenuItem.name}`
              : activeSection}
          </div>
        </div>

        {/* Layout */}
        <div className="flex md:flex-row w-full md:h-full md:min-h-0">
          <Sidebar
            menuItems={menuItems}
            title="Menu"
            activeSection={activeSection}
            onSelect={setActiveSection}
            secondaryMenu={menuItemsSecondry}
            darkMode={darkMode}
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
          />

          <main className="flex-1 p-3 sm:p-6 md:p-12 flex flex-col gap-6 md:gap-8 md:min-h-0 md:overflow-y-auto">
            <Header
              title={
                activeMenuItem
                  ? `${activeMenuItem.name} ${activeMenuItem.icon}`
                  : activeSection
              }
              subtitle="Welcome back! You are doing great."
              points={points}
              imgUrl="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
            />

            <div className="flex-1">{renderMainContent()}</div>
          </main>
        </div>
      </div>

      {/* ✅ Only show these on Play Online */}
      {activeSection === "Play Online" && (
        <>
          <OnlineChatWidget darkMode={darkMode} />
          <FloatingCallButton darkMode={darkMode} />
        </>
      )}
    </MainLayout>
  );
}
