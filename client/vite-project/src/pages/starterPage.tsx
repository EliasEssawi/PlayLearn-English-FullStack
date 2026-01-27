import React from "react";

type Page = "login" | "register";

type Props = {
  darkMode: boolean;
};

const StarterPage: React.FC<Props> = ({ darkMode }) => {
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

  /* 🎨 THEME */
  const bg = darkMode ? "#0b1220" : "#f8fafc";
  const text = darkMode ? "#e5e7eb" : "#0f172a";
  const muted = darkMode ? "#9ca3af" : "#6b7280";
  const cardBg = darkMode ? "#0f172a" : "#ffffff";
  const border = darkMode ? "1px solid #243244" : "1px solid #e2e8f0";
  const headerBg = darkMode ? "#0f1b2d" : "#86e07f";
  const green = "#3fa16a";

  return (
    <div className="min-h-screen w-full font-[Poppins]" style={{ background: bg, color: text }}>
      {/* HEADER — ONLY TITLE */}
      <header style={{ background: headerBg, borderBottom: border }}>
        <div className="container header-row">
          <h1 className="header-title" style={{ color: "#ffffff" }}>
            PlayLearn English
          </h1>
        </div>
      </header>

      {/* HERO */}
      <section className="section hero">
        <h2 style={{ color: darkMode ? "#a7f3d0" : green }}>
          Learn English the Fun Way!
        </h2>

        <p style={{ color: muted, maxWidth: 650, margin: "0.5rem auto 0" }}>
          Games, vocabulary, stories, speaking practice, and an AI friend — built for kids.
        </p>

        <p style={{ marginTop: "0.9rem", fontWeight: 700 }}>
          Please register or log in to start learning.
        </p>

        <div style={{ marginTop: "1.25rem", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => goToPage("register")}
            style={{
              background: green,
              color: "#fff",
              border: `1px solid ${green}`,
              padding: "0.8rem 1.2rem",
              borderRadius: 12,
              fontWeight: 800,
              cursor: "pointer",
              minWidth: 200,
            }}
          >
            Create Free Account
          </button>

          <button
            onClick={() => goToPage("login")}
            style={{
              background: darkMode ? "#0b1220" : "#ffffff",
              color: text,
              border,
              padding: "0.8rem 1.2rem",
              borderRadius: 12,
              fontWeight: 800,
              cursor: "pointer",
              minWidth: 200,
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
          {features.map((f, i) => (
            <div
              key={i}
              className="card card-pad"
              style={{
                background: cardBg,
                border,
                borderRadius: 16,
                cursor: "default",
              }}
            >
              <img src={f.icon} className="feature-icon" alt={f.title} />
              <div style={{ fontWeight: 800 }}>{f.title}</div>
              <div style={{ color: muted }}>{f.desc}</div>

              <div style={{ marginTop: 10, fontSize: 14, color: muted }}>
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
        © 2025 PlayLearn English — Learn & Play!
      </footer>
    </div>
  );
};

export default StarterPage;
