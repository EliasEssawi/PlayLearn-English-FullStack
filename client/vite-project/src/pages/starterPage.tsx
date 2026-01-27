import React from "react";

type Page = "login" | "register";

const StarterPage: React.FC = () => {
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

  return (
    <div className="min-h-screen w-full font-[Poppins]" style={{ background: "#f8fafc", color: "#0f172a" }}>
      {/* HEADER */}
      <header style={{ background: "#86e07f", borderBottom: "1px solid #e2e8f0" }}>
        <div className="container header-row">
          <h1 className="header-title" style={{ color: "#ffffff" }}>
            PlayLearn English
          </h1>

          <nav className="nav">
            <button
              type="button"
              onClick={() => goToPage("login")}
              className="nav-btn"
              style={{ background: "#ffffff", color: "#0f172a", border: "1px solid #e2e8f0" }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => goToPage("register")}
              className="nav-btn"
              style={{ background: "#0f172a", color: "#ffffff", border: "1px solid #0f172a" }}
            >
              Create Account
            </button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="section hero">
        <h2 style={{ color: "#3fa16a" }}>Learn English the Fun Way!</h2>

        <p style={{ color: "#6b7280", maxWidth: "650px", margin: "0.5rem auto 0" }}>
          Games, vocabulary, stories, speaking practice, and an AI friend — built for kids.
        </p>

        {/* Make the gate obvious */}
        <p style={{ color: "#0f172a", marginTop: "0.75rem", fontWeight: 600 }}>
          Sign up or log in to start learning.
        </p>

        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => goToPage("register")}
            style={{ background: "#3fa16a", border: "1px solid #3fa16a", color: "#ffffff" }}
          >
            Create Free Account
          </button>

          <button
            className="btn"
            type="button"
            onClick={() => goToPage("login")}
            style={{ background: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" }}
          >
            I Already Have an Account
          </button>
        </div>

        <div style={{ marginTop: "0.75rem", color: "#6b7280", fontSize: "0.95rem" }}>
          Preview below — features unlock after login
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ color: "#0f172a", marginBottom: "0.25rem" }}>What You Can Do</h3>

          {/* small helper badge */}
          <div
            style={{
              background: "#eef2ff",
              color: "#3730a3",
              border: "1px solid #e2e8f0",
              padding: "0.35rem 0.6rem",
              borderRadius: "999px",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            Preview (not clickable)
          </div>
        </div>

        <div className="grid" style={{ marginTop: "1.25rem" }}>
          {features.map((f, idx) => (
            <div
              key={idx}
              className="card card-pad"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                cursor: "default",
                position: "relative",
                boxShadow: "0 1px 0 rgba(15, 23, 42, 0.03)",
              }}
            >
              {/* Preview badge inside each card */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Preview
              </div>

              <img src={f.icon} className="feature-icon" alt={f.title} />

              <div style={{ color: "#0f172a", fontWeight: 700, marginTop: "0.25rem" }}>{f.title}</div>
              <div style={{ color: "#6b7280", marginTop: "0.25rem" }}>{f.desc}</div>

              <div style={{ marginTop: "0.8rem", color: "#94a3b8", fontSize: "0.9rem" }}>
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
          color: "#6b7280",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        © 2025 PlayLearn English — Learn &amp; Play!
      </footer>
    </div>
  );
};

export default StarterPage;
