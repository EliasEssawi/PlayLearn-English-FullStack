import React from "react";
import { useTheme } from "../components/context/ThemeContext";

type Page = "login" | "register";

const StarterPage: React.FC = () => {
  // Works whether your context provides toggleDarkMode OR setDarkMode
  const theme = useTheme() as any;
  const darkMode: boolean = !!theme.darkMode;

  const toggle =
    theme.toggleDarkMode ||
    (typeof theme.setDarkMode === "function"
      ? () => theme.setDarkMode((v: boolean) => !v)
      : undefined);

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
  const bg = darkMode ? "#020617" : "#f8fafc";
  const text = darkMode ? "#ffffff" : "#0f172a";
  const muted = darkMode ? "#e5e7eb" : "#6b7280";
  const cardBg = darkMode ? "#0b1220" : "#ffffff";
  const border = darkMode ? "1px solid #4ade80" : "1px solid #e2e8f0";

  return (
    <div className="min-h-screen w-full font-[Poppins]" style={{ background: bg, color: text }}>
      {/* HEADER (title + darkmode only) */}
      <header style={{ background: darkMode ? "#0b1220" : "#86e07f", borderBottom: border }}>
        <div
          className="container header-row"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <h1 className="header-title" style={{ color: "#ffffff" }}>
            PlayLearn English
          </h1>

          {/* ✅ Same style idea as your floating button: dark vs light colors */}
          <button
            type="button"
            onClick={toggle}
            disabled={!toggle}
            title="Toggle Dark Mode"
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: darkMode ? "1px solid #4ade80" : "1px solid #ffffff",
              background: darkMode ? "#1e293b" : "#ffffff",
              color: darkMode ? "#f8fafc" : "#0f172a",
              fontWeight: 900,
              cursor: toggle ? "pointer" : "not-allowed",
              boxShadow: darkMode
                ? "0 10px 30px rgba(0,0,0,0.35)"
                : "0 10px 30px rgba(15,23,42,0.18)",
              opacity: toggle ? 1 : 0.7,
            }}
          >
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="section hero">
        <h2 style={{ color: darkMode ? "#4ade80" : "#3fa16a" }}>Learn English the Fun Way!</h2>

        <p style={{ color: muted, maxWidth: 650, margin: "0.5rem auto 0" }}>
          Games, vocabulary, stories, speaking practice, and an AI friend — built for kids.
        </p>

        <p style={{ marginTop: "0.9rem", fontWeight: 800 }}>
          Please register or log in to start learning.
        </p>

        <div style={{ marginTop: "1.25rem", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => goToPage("register")}
            style={{
              background: "#3fa16a",
              border: "1px solid #3fa16a",
              color: "#ffffff",
              padding: "0.85rem 1.2rem",
              borderRadius: 12,
              fontWeight: 900,
              cursor: "pointer",
              minWidth: 210,
            }}
          >
            Create Free Account
          </button>

          <button
            type="button"
            onClick={() => goToPage("login")}
            style={{
              background: cardBg,
              border,
              color: text,
              padding: "0.85rem 1.2rem",
              borderRadius: 12,
              fontWeight: 900,
              cursor: "pointer",
              minWidth: 210,
            }}
          >
            Login
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <h3 style={{ marginBottom: "1.5rem" }}>What You Can Do</h3>

        <div className="grid">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="card card-pad"
              style={{
                background: cardBg,
                border,
                borderRadius: 16,
                cursor: "default",
              }}
            >
              <img src={f.icon} className="feature-icon" alt={f.title} />
              <div style={{ fontWeight: 900, marginTop: 6 }}>{f.title}</div>
              <div style={{ color: muted }}>{f.desc}</div>

              <div style={{ marginTop: 10, fontSize: 14, color: muted }}>
                Available after login
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ textAlign: "center", padding: "1rem", color: muted, borderTop: border }}>
        © 2025 PlayLearn English — Learn &amp; Play!
      </footer>
    </div>
  );
};

export default StarterPage;
