import React from "react";
import Layout from "../components/NavigationAndSwitcher/Layout";
import { useTheme } from "../context/ThemeContext";

type Page = "login" | "register" | "index";

const StarterPage: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

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
    <div className="page">
      {/* HEADER */}
      <header className="header">
        <div className="container header-row">
          <h1 className="header-title">PlayLearn English</h1>

          <nav className="nav">
            <button
              type="button"
              onClick={() => goToPage("login")}
              className="nav-btn nav-btn-login"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => goToPage("register")}
              className="nav-btn nav-btn-register"
            >
              Register
            </button>

            <button
              type="button"
              onClick={() => goToPage("index")}
              className="nav-btn nav-btn-register"
            >
              Vocabulary
            </button>

            {/* 🌙 DARK MODE BUTTON */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="nav-btn"
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="section hero">
        <h2 className="hero-title">Learn English the Fun Way!</h2>

        <p className="hero-sub">
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
        <h3 className="features-title">What You Can Do</h3>

        <div className="grid">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="card card-pad card-hover"
              role="button"
              tabIndex={0}
            >
              <img src={f.icon} className="feature-icon" alt={f.title} />
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © 2025 PlayLearn English — Learn &amp; Play!
      </footer>
    </div>
  );
};

export default StarterPage;
