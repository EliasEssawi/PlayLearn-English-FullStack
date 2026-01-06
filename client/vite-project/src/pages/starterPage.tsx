import React, { useState } from "react";
import { LuSun, LuMoon } from "react-icons/lu";

type Page = "login" | "register" | "index";

const StarterPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const goToPage = (page: Page): void => {
    if (page === "login") window.location.href = "/login";
    if (page === "register") window.location.href = "/register";
    if (page === "index") window.location.href = "/vocabulary/index";
  };

  const features = [
    { icon: "https://cdn-icons-png.flaticon.com/512/5293/5293973.png", title: "Choose Topic", desc: "Animals, Food, School & more" },
    { icon: "https://cdn-icons-png.flaticon.com/512/1048/1048949.png", title: "Vocabulary Games", desc: "Translate, choose picture, complete sentence" },
    { icon: "https://cdn-icons-png.flaticon.com/512/833/833472.png", title: "Listening", desc: "Hear English stories & words" },
    { icon: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png", title: "Reading", desc: "Short stories for kids" },
    { icon: "https://cdn-icons-png.flaticon.com/512/387/387561.png", title: "Speaking", desc: "Practice pronunciation" },
    { icon: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png", title: "Chat With Bot", desc: "Speak with your AI friend" },
  ];

  return (
    <div
      className="min-h-screen w-full font-[Poppins]"
      style={{
        background: darkMode ? "#020617" : "#f8fafc",
        color: darkMode ? "#f8fafc" : "#0f172a",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#86e07f",
          borderBottom: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
        }}
      >
        <div className="container header-row">
          <h1 className="header-title" style={{ color: "#ffffff" }}>
            PlayLearn English
          </h1>

          <nav className="nav">
            {["login", "register", "index"].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p as Page)}
                className="nav-btn"
                style={{
                  background: darkMode ? "#020617" : "#ffffff",
                  color: darkMode ? "#f8fafc" : "#0f172a",
                  border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
                }}
              >
                {p === "index" ? "Vocabulary" : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}

            {/* DARK MODE BUTTON */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="nav-btn flex items-center gap-2"
              style={{
                background: darkMode ? "#020617" : "#ffffff",
                color: darkMode ? "#f8fafc" : "#0f172a",
                border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
              }}
            >
              {darkMode ? <LuSun size={18} /> : <LuMoon size={18} />}
              {darkMode ? "Light" : "Dark"}
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="section hero">
        <h2 style={{ color: darkMode ? "#86e07f" : "#3fa16a" }}>
          Learn English the Fun Way!
        </h2>

        <p
          style={{
            color: darkMode ? "#e5e7eb" : "#6b7280",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          Play games, practice vocabulary, listen to stories, and chat with our AI friend.
        </p>

        <div style={{ marginTop: "1.75rem" }}>
          <button className="btn btn-primary" type="button">
            Start Learning
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <h3
          style={{
            color: darkMode ? "#f8fafc" : "#0f172a",
            marginBottom: "2rem",
          }}
        >
          What You Can Do
        </h3>

        <div className="grid">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="card card-pad card-hover"
              style={{
                background: darkMode ? "#020617" : "#ffffff",
                border: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
              }}
            >
              <img src={f.icon} className="feature-icon" alt={f.title} />
              <div style={{ color: "#86e07f", fontWeight: 600 }}>
                {f.title}
              </div>
              <div
                style={{
                  color: darkMode ? "#d1d5db" : "#6b7280",
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: "1rem",
          color: darkMode ? "#d1d5db" : "#6b7280",
          borderTop: darkMode ? "1px solid #334155" : "1px solid #e2e8f0",
        }}
      >
        © 2025 PlayLearn English — Learn &amp; Play!
      </footer>
    </div>
  );
};

export default StarterPage;
