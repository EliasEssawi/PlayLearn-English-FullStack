import React from "react";
import { useTheme } from "../components/context/ThemeContext";
import DarkModeToggle from "../components/authintication/DarkModeToggle";

type Page = "login" | "register";

const StarterPage: React.FC = () => {
  const { darkMode } = useTheme();

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

  // theme colors (kept consistent with your register palette)
  const pageBg = darkMode ? "#020617" : "#f8fafc";
  const pageText = darkMode ? "#f8fafc" : "#0f172a";

  const greenBar = "#86e07f";
  const border = darkMode ? "1px solid #4ade80" : "1px solid #dbeafe"; // soft border in light mode
  const cardBg = darkMode ? "#0b1220" : "#ffffff";
  const muted = darkMode ? "#e5e7eb" : "#475569";

  // Buttons:
  // - In light mode: BOTH are white so Register is visible (as you asked)
  // - Register: green border + green text
  // - Login: gray border + dark text
  const registerBtnStyle: React.CSSProperties = {
    background: "#ffffff",
    color: "#0f172a",
    border: "1px solid rgba(15,23,42,0.18)",
    padding: "0.85rem 1.2rem",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    minWidth: 210,
  };

  const loginBtnStyle: React.CSSProperties = {
    background: "#ffffff",
    color: "#0f172a",
    border: "1px solid rgba(15,23,42,0.18)",
    padding: "0.85rem 1.2rem",
    borderRadius: 12,
    fontWeight: 900,
    cursor: "pointer",
    minWidth: 210,
  };
  const frameStyle: React.CSSProperties = {
  backgroundColor: darkMode ? "#020617" : "#ffffff",
  border: darkMode
    ? "1px solid #020617" // dark frame
    : "2px solid #86e07f", // green frame in light mode
  borderRadius: 22,
  padding: "22px",
  boxShadow: darkMode
    ? "0 0 0 rgba(0,0,0,0)"
    : "0 12px 30px rgba(15,23,42,0.08)",
};

  // in dark mode, white buttons look too bright → make them dark-friendly but keep borders
  if (darkMode) {
    registerBtnStyle.background = "#020617";
    registerBtnStyle.color = "#f8fafc";
    registerBtnStyle.border = "1px solid #334155";

    loginBtnStyle.background = "#020617";
    loginBtnStyle.color = "#f8fafc";
    loginBtnStyle.border = "1px solid #334155";
  }

  return (
    <div style={{ minHeight: "100vh", background: pageBg, color: pageText }}>
      {/* ✅ GREEN TOP BAR (only dark toggle) */}
      <div
        style={{
          background: greenBar,
          borderBottom: darkMode ? "1px solid #4ade80" : "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: 900, color: "#ffffff", fontSize: 20 }}>
            PlayLearn English
          </div>

          {/* ✅ exact same button component used in AuthLayout/Register */}
          <DarkModeToggle />
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 18px" }}>
        {/* HERO BOX with border */}
          <div style={frameStyle}>
        <div
          style={{
            background: greenBar,
            borderRadius: 18,
            padding: "26px 22px",
            textAlign: "center",
            border,
            boxShadow: darkMode ? "none" : "0 10px 30px rgba(15,23,42,0.08)",
          }}
        >
          <h2 style={{ color: "#0f172a", fontSize: "1.6rem", fontWeight: 900, margin: 0 }}>
            Learn English the Fun Way!
          </h2>

          <p style={{ color: "#0f172a", opacity: 0.9, maxWidth: 680, margin: "10px auto 0", fontWeight: 600 }}>
            Games, vocabulary, stories, speaking practice, translating, AI friend & chat online.
          </p>

          <p style={{ color: "#0f172a", marginTop: 14, fontWeight: 900 }}>
            Please register or log in to start learning.
          </p>

          <div style={{ marginTop: 16, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => goToPage("register")} style={registerBtnStyle}>
              CREATE FREE ACCOUNT
            </button>

            <button type="button" onClick={() => goToPage("login")} style={loginBtnStyle}>
              LOGIN
            </button>
          </div>
        </div>

        {/* FEATURES */}
        <div style={{ marginTop: 18 }}>
          <h3 style={{ fontWeight: 900, marginBottom: 12 }}>What You Can Do</h3>

          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {features.map((f, idx) => (
              <div
                key={idx}
                style={{
                  background: cardBg,
                  border,
                  borderRadius: 16,
                  padding: 16,
                  cursor: "default",
                }}
              >
                <img src={f.icon} alt={f.title} style={{ width: 42, height: 42 }} />
                <div style={{ fontWeight: 900, marginTop: 10 }}>{f.title}</div>
                <div style={{ color: muted, marginTop: 4, fontWeight: 600 }}>{f.desc}</div>

                <div style={{ marginTop: 10, fontSize: 14, color: muted, fontWeight: 700 }}>
                  Available after login
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 18, color: darkMode ? "#e5e7eb" : "#94a3b8", fontWeight: 700 }}>
          © 2025 PlayLearn English — Learn &amp; Play!
        </div>
      </div>
      </div>
    </div>
  );
};

export default StarterPage;
