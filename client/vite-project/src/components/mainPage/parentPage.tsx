import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";
import { getProfilesResponse, sendVerificationCodeRequest } from "../../Types/Login";
import axios from "axios";
import MainLayout from "../authintication/MainLayout";
import { useTheme } from "../context/ThemeContext";

type Profile = {
  profileName: string;
};

type OptionAction = "changePin" | "viewProgress" | "reportHistory";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const ParentPage: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [dateFilter, setDateFilter] = useState<
  "all" | "today" | "7days" | "30days"
>("all");


  useEffect(() => {
    isLoggedIn().then((ok) => {
      if (!ok) navigate("/login");
    });
  }, [navigate]);

  useEffect(() => {
    const fetchProfiles = async (): Promise<void> => {
      try {
        const savedUserRaw = localStorage.getItem("loggedInUser");
        if (!savedUserRaw) return;

        const payload: sendVerificationCodeRequest = {
          email: savedUserRaw.trim().toLowerCase(),
        };

        const res = await axios.get<getProfilesResponse>(
          `${API_BASE}/profiles/${payload.email}`,
          { withCredentials: true, params: payload }
        );

        if (res.data.success) {
          setProfiles(res.data.profiles || []);
          setSelectedProfile(null);
        }
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      }
    };
    fetchProfiles();
  }, []);

  const goToAddProfile = (): void => {
    navigate("/addprofile");
  };

  const handleUpdatePin = async () => {
    setPinMessage("");
    if (newPin.length !== 4) {
      setPinMessage("PIN must be exactly 4 digits.");
      return;
    }

    try {
      setIsUpdating(true);
      const email = localStorage.getItem("loggedInUser");

      const res = await axios.put(
        `${API_BASE}/profiles/update-pin`,
        {
          email: email?.trim().toLowerCase(),
          profileName: selectedProfile?.profileName,
          newPin: newPin,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        alert("PIN updated successfully! ✅");
        setIsModalOpen(false);
        setNewPin("");
      } else {
        setPinMessage(res.data.message || "Failed to update PIN.");
      }
    } catch {
      setPinMessage("Server error. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOption = (action: OptionAction): void => {
    if (!selectedProfile) return;

    if (action === "changePin") setIsModalOpen(true);

    if (action === "viewProgress") {
      const email = (localStorage.getItem("loggedInUser") || "").trim().toLowerCase();
      const profile = encodeURIComponent(selectedProfile.profileName);
      navigate(`/progress?email=${encodeURIComponent(email)}&profileName=${profile}`);
    }

    if (action === "reportHistory") fetchReportHistory();
  };

  const fetchReportHistory = async () => {
    if (!selectedProfile) return;

    try {
      setIsLoadingReport(true);
      const email = localStorage.getItem("loggedInUser");

      const res = await axios.get(`${API_BASE}/profiles/report-history`, {
        params: {
          email: email?.trim().toLowerCase(),
          profileName: selectedProfile.profileName,
        },
        withCredentials: true,
      });

      if (res.data.success) {
        setReportData(res.data.history || []);
        setIsReportModalOpen(true);
      }
    } finally {
      setIsLoadingReport(false);
    }
  };

  const [reportViewMode, setReportViewMode] = useState<"type" | "date">("type");

  const groupedReports = reportData.reduce((acc: any, item: any) => {
    let key = "Other";

    if (reportViewMode === "type") {
      key = item.type ?? "Other";
    } else {
      key = new Date(item.answeredAt).toLocaleDateString();
    }

    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const filterByDate = (items: any[]) => {
  const now = new Date();

  return items.filter((item) => {
    const answered = new Date(item.answeredAt);

    if (dateFilter === "today") {
      return answered.toDateString() === now.toDateString();
    }

    if (dateFilter === "7days") {
      return now.getTime() - answered.getTime() <= 7 * 24 * 60 * 60 * 1000;
    }

    if (dateFilter === "30days") {
      return now.getTime() - answered.getTime() <= 30 * 24 * 60 * 60 * 1000;
    }

    return true; // all
  });
};


  const actionRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "18px 25px",
    marginBottom: "12px",
    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
    color: darkMode ? "#f8fafc" : "#1e293b",
    border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "1.05rem",
    fontWeight: "500",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  };
 


  return (
    <MainLayout>
      <div style={{ maxWidth: "850px", margin: "0 auto", padding: "40px 20px" }}>
        
        <header style={{ marginBottom: "50px", textAlign: "left" }}>
          <h2 style={{ fontSize: "2.4rem", fontWeight: "800", color: darkMode ? "#86e07f" : "#1e293b", margin: 0 }}>
            Parent Dashboard
          </h2>
          <p style={{ color: darkMode ? "#94a3b8" : "#64748b", marginTop: "8px" }}>
            Manage your family profiles and learning insights.
          </p>
        </header>

        <section style={{ marginBottom: "50px" }}>
          <h3 style={{ marginBottom: "20px", color: darkMode ? "#94a3b8" : "#64748b", fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: "600" }}>
            Your Children
          </h3>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {profiles.map((p) => (
              <button
                key={p.profileName}
                onClick={() => setSelectedProfile(p)}
                style={{
                  width: "150px", padding: "25px 15px", borderRadius: "24px",
                  backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                  color: darkMode ? "#ffffff" : "#1e293b",
                  border: selectedProfile?.profileName === p.profileName ? "2px solid #86e07f" : `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                  boxShadow: selectedProfile?.profileName === p.profileName ? "0 10px 20px rgba(134, 224, 127, 0.15)" : "0 4px 6px rgba(0,0,0,0.03)",
                  cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", textAlign: "center",
                  transform: selectedProfile?.profileName === p.profileName ? "translateY(-5px)" : "none"
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>👦</div>
                <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>{p.profileName}</div>
              </button>
            ))}

            <button onClick={goToAddProfile} style={{ width: "150px", padding: "25px 15px", borderRadius: "24px", border: "2px dashed #86e07f", backgroundColor: "transparent", color: "#86e07f", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "5px" }}>+</div>
              <div style={{ fontWeight: "700" }}>Add Profile</div>
            </button>
          </div>
        </section>

        {selectedProfile && (
          <section style={{ padding: "30px", borderRadius: "32px", backgroundColor: darkMode ? "#0f172a" : "#f8fafc", border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
            <h3 style={{ marginBottom: "25px", fontSize: "1.3rem", fontWeight: "700", color: darkMode ? "#f8fafc" : "#1e293b" }}>
              Settings for <span style={{ color: "#86e07f" }}>{selectedProfile.profileName}</span>
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button style={actionRowStyle} onClick={() => handleOption("changePin")}>
                <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "1.2rem" }}>🔑</span> Change PIN
                </span>
                <span style={{ color: "#86e07f", fontSize: "1.2rem", fontWeight: "bold" }}>➜</span>
              </button>
              
              <button style={actionRowStyle} onClick={() => handleOption("viewProgress")}>
                <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "1.2rem" }}>📊</span> View Progress
                </span>
                <span style={{ color: "#86e07f", fontSize: "1.2rem", fontWeight: "bold" }}>➜</span>
              </button>
              
              <button style={actionRowStyle} onClick={() => handleOption("reportHistory")}>
                <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "1.2rem" }}>📜</span> Report History
                </span>
                <span style={{ color: "#86e07f", fontSize: "1.2rem", fontWeight: "bold" }}>➜</span>
              </button>
            </div>
          </section>
        )}

        {/* 🔑 Change PIN Modal */}
        {isModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
            <div style={{ backgroundColor: darkMode ? "#1e293b" : "#ffffff", padding: "40px", borderRadius: "28px", width: "90%", maxWidth: "400px", textAlign: "center", border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
              <h3 style={{ marginBottom: "10px", color: darkMode ? "#f8fafc" : "#1e293b", fontSize: "1.5rem" }}>Update PIN</h3>
              <p style={{ color: darkMode ? "#94a3b8" : "#64748b", marginBottom: "25px" }}>Enter a new 4-digit PIN for <b>{selectedProfile?.profileName}</b></p>
              
              <input
                type="password"
                maxLength={4}
                placeholder="****"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                style={{ width: "100%", padding: "15px", borderRadius: "12px", marginBottom: "15px", border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`, backgroundColor: darkMode ? "#0f172a" : "#f8fafc", color: darkMode ? "#fff" : "#000", textAlign: "center", fontSize: "1.8rem", letterSpacing: "8px" }}
              />

              {pinMessage && <p style={{ color: "#f87171", marginBottom: "15px", fontSize: "0.9rem" }}>{pinMessage}</p>}

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button onClick={() => { setIsModalOpen(false); setPinMessage(""); setNewPin(""); }} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", cursor: "pointer", backgroundColor: darkMode ? "#334155" : "#e2e8f0", color: darkMode ? "#fff" : "#1e293b", fontWeight: "600" }}>
                  Cancel
                </button>
                <button onClick={handleUpdatePin} disabled={isUpdating} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "none", cursor: "pointer", backgroundColor: "#86e07f", color: "#fff", fontWeight: "700", opacity: isUpdating ? 0.7 : 1 }}>
                  {isUpdating ? "Saving..." : "Save PIN"}
                </button>
              </div>
            </div>
          </div>
        )}
            {isReportModalOpen && (
                <div
                  style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      background: darkMode ? "#0f172a" : "#fff",
                      width: "90%",
                      maxWidth: "900px",
                      maxHeight: "85vh",
                      overflowY: "auto",
                      borderRadius: "28px",
                      padding: "30px",
                    }}
                  >
                    <button
                    onClick={() => setIsReportModalOpen(false)}
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.4rem",
                      fontWeight: "700",
                      backgroundColor: darkMode ? "#1e293b" : "#e2e8f0",
                      color: darkMode ? "#f8fafc" : "#1e293b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                    aria-label="Close"
                  >
                    ✕
                  </button>

            <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(120px, 1fr))",
              gap: "12px",
              marginBottom: "25px",
            }}
          >
            {[
              { key: "all", label: "All" },
              { key: "today", label: "Today" },
              { key: "7days", label: "Last 7 Days" },
            ].map((btn: any) => (
              <button
                key={btn.key}
                onClick={() => setDateFilter(btn.key)}
                style={{
                  padding: "14px",
                  borderRadius: "14px",
                  border: `1px solid ${
                    dateFilter === btn.key
                      ? "#86e07f"
                      : darkMode
                      ? "#334155"
                      : "#e2e8f0"
                  }`,
                  cursor: "pointer",
                  fontWeight: "700",
                  backgroundColor:
                    dateFilter === btn.key
                      ? "#86e07f"
                      : darkMode
                      ? "#1e293b"
                      : "#f8fafc",
                  color:
                    dateFilter === btn.key
                      ? "#fff"
                      : darkMode
                      ? "#e5e7eb"
                      : "#1e293b",
                  transition: "all 0.2s ease",
                }}
              >
                📅 {btn.label}
              </button>
            ))}
          </div>


          {Object.entries(groupedReports).map(([groupTitle, items]: any) => (
            <div key={groupTitle} style={{ marginBottom: "35px" }}>
            <h3
              style={{
                marginBottom: "16px",
                paddingLeft: "10px",
                fontSize: "1.3rem",
                fontWeight: "700",
                textTransform: "capitalize",
                color: darkMode ? "#e5e7eb" : "#1e293b",
                borderLeft: "4px solid #86e07f",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>
                {groupTitle === "talking" && "🗣️"}
                {groupTitle === "translate" && "🌍"}
                {groupTitle === "listening" && "🎧"}
                {groupTitle === "reading" && "📖"}
                {groupTitle === "complete" && "✍️"}
              </span>
              <span>{groupTitle}</span>
            </h3>

              {filterByDate(items).map((item: any, idx: number) => {

                const typeStyles: Record<
                  string,
                  { bg: string; border: string; icon: string }
                > = {
                  talking: {
                    bg: "linear-gradient(135deg, #ede9fe, #f5f3ff)",
                    border: "#c7d2fe",
                    icon: "🗣️",
                  },
                  translate: {
                    bg: "linear-gradient(135deg, #ecfeff, #f0fdf4)",
                    border: "#99f6e4",
                    icon: "🌍",
                  },
                  listening: {
                    bg: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
                    border: "#bae6fd",
                    icon: "🎧",
                  },
                  reading: {
                    bg: "linear-gradient(135deg, #fff7ed, #ffedd5)",
                    border: "#fed7aa",
                    icon: "📖",
                  },
                  complete: {
                    bg: "linear-gradient(135deg, #fefce8, #fef9c3)",
                    border: "#fde68a",
                    icon: "✍️",
                  },
                };

                const style = typeStyles[item.type] || {
                  bg: darkMode ? "#1e293b" : "#f8fafc",
                  border: darkMode ? "#334155" : "#e2e8f0",
                  icon: "🧩",
                };

                return (
                  <div
                    key={idx}
                    style={{
                      padding: "22px",
                      marginBottom: "18px",
                      borderRadius: "20px",
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                    }}
                  >
                  <h4
                      style={{
                        marginBottom: "10px",
                        fontSize: "1.05rem",
                        fontWeight: "600",
                        color: darkMode ? "#1e293b" : "#1e293b",
                      }}
                    >
                      {item.exercise?.prompt ?? "Question not found"}
                    </h4>



                    <p style={{ color: darkMode ? "#334155" : "#475569" }}><b>Topic:</b> {item.topic}</p>
                    <p style={{ color: darkMode ? "#334155" : "#475569" }}><b>Level:</b> {item.level}</p>
                    <p style={{ color: darkMode ? "#334155" : "#475569" }}><b>Time Spent:</b> {(item.timeSpentMs / 1000).toFixed(1)}s</p>
                  
                    <p style={{ color: darkMode ? "#334155" : "#475569" }}>
                      <b>Date:</b>{" "}
                      {new Date(item.answeredAt).toLocaleDateString()}{" "}
                      <span style={{ opacity: 0.7 }}>
                        ({new Date(item.answeredAt).toLocaleTimeString()})
                      </span>
                    </p>



                    <p style={{ color: darkMode ? "#334155" : "#475569" }}>
                      <b>Result:</b>{" "}
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          backgroundColor: item.correct ? "#dcfce7" : "#fee2e2",
                          color: item.correct ? "#166534" : "#991b1b",
                        }}
                      >
                        {item.correct ? "Correct ✅" : "Wrong ❌"}
                      </span>
                    </p>

                    {item.exercise?.answer && (
                      <p style={{ color: darkMode ? "#334155" : "#475569"  }}>
                        <b>Correct Answer:</b>{" "}
                        <span style={{ color: "#16a34a" }}>
                          {item.exercise.answer}
                        </span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    )}


      </div>
    </MainLayout>
  );
};

export default ParentPage;
