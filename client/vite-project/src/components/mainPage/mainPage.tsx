import React, { useState, useEffect } from "react";
import Sidebar from "../mainPage/Sidebar";
import Header from "../mainPage/Header";
import Progrees from "../mainPage/Progress";
import ChatBot from "../mainPage/chatbot";
import VocabularyHome from "../vocabulary/vocabularyHome";
import { MenuItem } from "../../Types/Section";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";
import MainLayout from "../authintication/MainLayout"; 
import TopicsPage from "./TopicsPage";


export default function MainPage() {
  const navigate = useNavigate();

  // בדיקה ראשונית: האם המשתמש כבר בחר Dark Mode בדף קודם?
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  /* 🔐 Check login */
  useEffect(() => {
    isLoggedIn().then(ok => {
      if (!ok) navigate("/login");
    });
  }, [navigate]);

  // בכל פעם ש-darkMode משתנה, נשמור את הבחירה
  const handleToggleDarkMode = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem("theme", val ? "dark" : "light");
  };

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

  const renderMainContent = () => {
    switch (activeSection) {
      case "View Progress":
        return <Progrees onSelectSection={setActiveSection} />;
      case "AI Chat":
        return <ChatBot darkMode={darkMode} />;
      case "Vocabulary":
        return <VocabularyHome />;
      case "Talking":
          return <TopicsPage exercisesType="Talking"/>;
      case "Listening":
        return <TopicsPage exercisesType="Listening"/>;
      case "Fill the blank":
        return <TopicsPage exercisesType="Fill the blank"/>;
      case "Translate":
        return <TopicsPage exercisesType="Translate"/>;
      case "Reading":
        return <TopicsPage exercisesType="Reading"/>;  
      default:
        return (
          <div style={{ color: darkMode ? "#d1d5db" : "#6b7280", fontStyle: "italic" }}>
            This section is coming soon 🚧
          </div>
        );
    }
  };

  return (
    <MainLayout darkMode={darkMode} setDarkMode={handleToggleDarkMode}>
      <div
        className="flex w-full max-w-7xl h-[85vh] mx-auto rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: darkMode ? "#020617" : "#ffffff",
          border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
          marginTop: "20px"
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
            points={120}
            imgUrl="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
          />
          <div className="flex-1">{renderMainContent()}</div>
        </main>
      </div>
    </MainLayout>
  );
}