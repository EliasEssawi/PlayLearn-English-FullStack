import React, { useState, useEffect } from "react";
import Sidebar from "../components/mainPage/Sidebar";
import Header from "../components/mainPage/Header";
import Progrees from "../components/mainPage/Progress";
import { MenuItem, SidebarAction } from "../Types/Section";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export default function MainPage() {
  //resirect to login page if user is not logged in
  const navigate = useNavigate(); 
  useEffect(() => {
    isLoggedIn().then(ok => {
      if (!ok) navigate("/login");
    });
  }, []);
  
  const menuItems:MenuItem[]  = [
    { name: "Talking", icon: "🗣️" },
    { name: "Reading", icon: "📖" },
    { name: "Listening", icon: "🎧" },
    { name: "Vocabulary", icon: "🔤" },
    { name: "AI Chat", icon: "🤖" },
  ];

  const menuItemsSecondry:MenuItem[] = [
    { name: "View Progress", icon: "📊"},
    { name: "Profile", icon: "👤"}
  ]

  // Active section is a full MenuItem
  const [activeSection, setActiveSection] = useState("Talking");
  // Find the active menu item in primary or secondary menu
  const activeMenuItem =
    menuItems.find((m) => m.name === activeSection) ||
    menuItemsSecondry.find((m) => m.name === activeSection);

  const renderMainContent = () => {
    switch (activeSection) {
      case "View Progress":
        return(<Progrees onSelectSection={setActiveSection} />)

      case "Talking":
      case "Reading":
      case "Listening":
      case "Vocabulary":
      case "AI Chat":

      default:
        return (
          <div className="text-gray-400 text-lg italic">
            This section is coming soon 🚧
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-100 h-screen w-full flex items-center justify-center p-4 overflow-hidden font-[Poppins]">
      <div className="flex w-full max-w-7xl h-[95vh] bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
        <div className="flex">
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
            <Header 
                title = {activeMenuItem ? `${activeMenuItem.name} ${activeMenuItem.icon}` : activeSection}
                subtitle="Welcome back! You are doing great." 
                points={120}
                imgUrl="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
            />
            
            <div id="main content">
              {renderMainContent()}
            </div>

            </main>
        </div>
      </div>
    </div>
  );
}
