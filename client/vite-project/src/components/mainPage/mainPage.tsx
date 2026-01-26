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
import io from "socket.io-client";
import { useMemo } from "react";
import FloatingVideoButton from "../call/FloatingVideoButton";

export default function MainPage() {
  // -------------------------
  // 🎥 Video Call Socket
  // -------------------------
  // Socket server URL (env first, fallback to localhost for dev)
  const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

  // Create the socket instance once (memoized) so it doesn't reconnect on every render
  const socket = useMemo(
    () => io(SOCKET_URL, { transports: ["websocket"] }),
    []
  );
  const navigate = useNavigate();
  const { darkMode } = useTheme();  // Global theme state (dark/light)

  // -------------------------
  // 🔐 Auth Guard
  // -------------------------
  // On mount: verify the user is logged in; if not, redirect to login
  useEffect(() => {
    isLoggedIn().then(ok => {
      if (!ok) navigate("/login");
    });
  }, [navigate]);

  // -------------------------
  // 📌 Sidebar Menu
  // -------------------------
  const menuItems: MenuItem[] = [
    { name: "Talking", icon: "🗣️" },
    { name: "Reading", icon: "📖" },
    { name: "Listening", icon: "🎧" },
    { name: "Translate", icon: "🔤" },
    { name: "Fill the blank", icon: "🔤" },
    { name: "AI Chat", icon: "🤖" },
     { name: "Play Online", icon: "👤" },
  ];

  const menuItemsSecondry: MenuItem[] = [
    { name: "View Progress", icon: "📊" },
   
  ];

  // Which section is currently selected in the sidebar
  const [activeSection, setActiveSection] = useState("Talking");

  // Used to show the current page title + icon in the Header
  const activeMenuItem =
    menuItems.find(m => m.name === activeSection) ||
    menuItemsSecondry.find(m => m.name === activeSection);

  // -------------------------
  // 📦 Active Profile from localStorage
  // -------------------------
  // Child profile (chosen earlier) is stored locally so we can use it across refresh
  const activeProfileRaw = localStorage.getItem("activeProfile");
  const activeProfile = activeProfileRaw ? JSON.parse(activeProfileRaw) : null;

  // Parent email used to build a unique user id for sockets/video calls
  const parentEmail = String(localStorage.getItem("loggedInUser") || "")
    .trim()
    .toLowerCase();

  // Child profile name - supports both shapes (profileName OR email.profileName)
  const childName = String(
    activeProfile?.profileName || activeProfile?.email?.profileName || ""
  ).trim();

  // Unique call/socket id: "parentEmail::childName"
  const myUserId =
    parentEmail && childName
      ? `${parentEmail.toLowerCase()}::${childName.toLowerCase()}`
      : "";
  
  // -------------------------
  // ⭐ Points
  // -------------------------
  const [points, setPoints] = useState(0);

  // Calculate points once based on saved progress in localStorage
  // (counts unique correct questionIds * 10)
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

  // Initial load of points (works after refresh / first entry)
  useEffect(() => {
    setPoints(calculatePointsFromLocalStorage());
  }, []);

  // Listen for a custom event to update points live while the user plays
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


  // -------------------------
  // 🧩 Main content switch
  // -------------------------
  const renderMainContent = () => {
    switch (activeSection) {
      case "View Progress":
        // Require profile selected to view progress page
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

      // Each exercise type loads the same TopicsPage component but with different prop
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
        return <Online darkMode={darkMode} />;
      default:
        // Fallback for any future/unknown sections
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
    className="flex flex-col md:flex-row w-full max-w-7xl md:h-[85vh] mx-auto rounded-3xl overflow-hidden shadow-2xl"
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
      darkMode={darkMode}
    />

    <main className="flex-1 p-3 sm:p-6 md:p-12 overflow-y-auto flex flex-col gap-6 md:gap-8">
      <Header
        title={activeMenuItem ? `${activeMenuItem.name} ${activeMenuItem.icon}` : activeSection}
        subtitle="Welcome back! You are doing great."
        points={points}
        imgUrl="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
      />

      <div className="flex-1">{renderMainContent()}</div>
    </main>
  </div>

  {activeSection === "Play Online" && (
    <>
      <OnlineChatWidget darkMode={darkMode} />
      <FloatingVideoButton socket={socket} myUserId={myUserId} darkMode={darkMode} />
    </>
  )}
</MainLayout>

  );
}
