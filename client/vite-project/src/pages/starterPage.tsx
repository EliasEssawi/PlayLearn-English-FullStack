import React from "react";
import { useTheme } from "../context/ThemeContext";

type Page = "login" | "register";

const StarterPage: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  const goToPage = (page: Page): void => {
    if (page === "login") window.location.href = "/login";
    if (page === "register") window.location.href = "/register";
  };

  const features = [
    { icon: "https://cdn-icons-png.flaticon.com/512/5293/5293973.png", title: "Choose Topic", desc: "Animals, Food, School & more" },
    { icon: "https://cdn-icons-png.flaticon.com/512/1048/1048949.png", title: "Vocabulary Games", desc: "Translate, choose picture, complete sentence" },
    { icon: "https://cdn-icons-png.flaticon.com/512/833/833472.png", title: "Listening", desc: "Hear English stories & words" },
    { icon: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png", title: "Reading", desc: "Short stories for kids" },
    { icon: "https://cdn-icons-png.flaticon.com/512/387/387561.png", title: "Speaking", desc: "Practice pronunciation" },
    { icon: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png", title: "Chat With Bot", desc: "Speak with your AI friend" },
    { icon: "https://cdn-icons-png.flaticon.com/512/1048/1048934.png", title: "Online Game", desc: "Play, Chat & Video call friends!" },
  ];

  // Theme colors
  const bg = darkMode ? "#0b1220" : "#f8fafc";
  const text = darkMode ? "#e5e7eb" : "#0f172a";
  const muted = darkMode ? "#9ca3af" : "#6b7280";
  const cardBg = darkMode ? "#0f172a" : "#ffffff";
  const border = darkMode ? "1px solid #243244" : "1px solid #e2e8f0";
  const headerBg = darkMode ? "#0f1b2d" : "#86e07f";
  const green = "#3fa16a";

  return (
    <div className="min-h-screen w-full font-[Poppins]" style={{ background: bg, color: text }}>
      {/* HEADER (ONLY DARK MODE) */}
      <header style={{ background: headerBg, borderBottom: border }}>
        <div className="container header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className="header-title" style={{ color: "#ffffff" }}>
            PlayLearn English
          </h1>

          {/* Dark mode only */}
          <button
            type="button"
            onClick={toggleDarkMode}
            style={{
              background: darkMode ? "#0b1220" : "#ffffff",
              color: darkMode ? "#e5e7eb" : "#0f172a",
              border: darkMode ? "1px solid #243244" : "1px solid #e2e8f0",
              padding: "0.55rem 0.9rem",
              borderRadius: "999px",
              fontWeight: 700,
              cursor: "pointer",
            }}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {darkMode ? "☾ Dark" : "☀ Light"}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="section hero">
        <h2 style={{ color: darkMode ? "#a7f3d0" : green }}>Learn English the Fun Way!</h2>

        <p style={{ color: muted, maxWidth: "650px", margin: "0.5rem auto 0" }}>
          Games, vocabulary, stories, speaking practice, and an AI friend — built for kids.
        </p>

        <p style={{ color: text, marginTop: "0.9rem", fontWeight: 700 }}>
          To start, please create an account or log in.
        </p>

        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => goToPage("register")}
            style={{
              background: green,
              border: `1px solid ${green}`,
              color: "#ffffff",
              padding: "0.8rem 1.1rem",
              borderRadius: "12px",
              fontWeight: 800,
              cursor: "pointer",
              minWidth: 200,
            }}
          >
            Create Free Account
          </button>

          <button
            type="button"
            onClick={() => goToPage("login")}
            style={{
              background: darkMode ? "#0b1220" : "#ffffff",
              border,
              color: text,
              padding: "0.8rem 1.1rem",
              borderRadius: "12px",
              fontWeight: 800,
              cursor: "pointer",
              minWidth: 200,
            }}
          >
            Login
          </button>
        </div>

        <div style={{ marginTop: "0.75rem", color: muted, fontSize: "0.95rem" }}>
          You can see what the app includes below.
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <h3 style={{ color: text, marginBottom: "1.25rem" }}>What You Can Do</h3>

        <div className="grid">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="card card-pad"
              style={{
                background: cardBg,
                border,
                borderRadius: "16px",
                cursor: "default",
                boxShadow: darkMode ? "none" : "0 1px 0 rgba(15, 23, 42, 0.03)",
              }}
            >
              <img src={f.icon} className="feature-icon" alt={f.title} />
              <div style={{ color: darkMode ? "#c7f9d4" : "#0f172a", fontWeight: 800, marginTop: "0.25rem" }}>
                {f.title}
              </div>
              <div style={{ color: muted, marginTop: "0.25rem" }}>{f.desc}</div>

              <div style={{ marginTop: "0.8rem", color: darkMode ? "#64748b" : "#94a3b8", fontSize: "0.9rem" }}>
                Available after login
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
          color: muted,
          borderTop: border,
        }}
      >
        © 2025 PlayLearn English — Learn &amp; Play!
      </footer>
    </div>
  );
};

export default StarterPage;
