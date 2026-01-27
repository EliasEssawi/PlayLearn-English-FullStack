import React from "react";
// Allowed navigation targets from the starter page

type Page = "login" | "register";

const StarterPage: React.FC = () => {
  const goToPage = (page: Page): void => {
    if (page === "login") window.location.href = "/login";
    if (page === "register") window.location.href = "/register";
  };
  // Feature list displayed on the landing page

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
        // Main page container
    <div className="min-h-screen w-full font-[Poppins]" style={{ background: "#f8fafc", color: "#0f172a" }}>
      
      {/* HEADER */}
      <header style={{ background: "#86e07f", borderBottom: "1px solid #e2e8f0" }}>
        <div className="container header-row">
          <h1 className="header-title" style={{ color: "#ffffff" }}>
            PlayLearn English
          </h1>

          <nav className="nav">
            {["login", "register"].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p as Page)}
                className="nav-btn"
                style={{
                  background: "#ffffff",
                  color: "#0f172a",
                  border: "1px solid #e2e8f0",
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="section hero">
        <h2 style={{ color: "#3fa16a" }}>
          Learn English the Fun Way!
        </h2>

        <p style={{ color: "#6b7280", maxWidth: "600px", margin: "0 auto" }}>
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
        <h3 style={{ color: "#0f172a", marginBottom: "2rem" }}>
          What You Can Do
        </h3>

       <div className="grid">
  {features.map((f, idx) => (
    <div
      key={idx}
      className={`card card-pad card-hover ${f.title === "Online Game" ? "online-center" : ""}`}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
      }}
    >
      <img src={f.icon} className="feature-icon" alt={f.title} />
      <div style={{ color: "#86e07f", fontWeight: 600 }}>{f.title}</div>
      <div style={{ color: "#6b7280" }}>{f.desc}</div>
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