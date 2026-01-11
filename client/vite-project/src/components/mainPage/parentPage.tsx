import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";
import { getProfilesResponse, sendVerificationCodeRequest } from "../../Types/Login";
import axios from "axios";
import MainLayout from "../authintication/MainLayout";

type Profile = {
  profileName: string;
};

type OptionAction = "changePin" | "viewProgress" | "reportHistory";

const API_BASE = "/api";

const ParentPage: React.FC = () => {
  const navigate = useNavigate();

  // 🌙 Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // 🔑 PIN Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleDarkMode = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem("theme", val ? "dark" : "light");
  };

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

  // פונקציה לעדכון ה-PIN ב-Database
  const handleUpdatePin = async () => {
    setPinMessage("");
    if (newPin.length !== 4) {
      setPinMessage("PIN must be exactly 4 digits.");
      return;
    }

    try {
      setIsUpdating(true);
      const email = localStorage.getItem("loggedInUser");
      
      const res = await axios.put(`${API_BASE}/profiles/update-pin`, {
        email: email?.trim().toLowerCase(),
        profileName: selectedProfile?.profileName,
        newPin: newPin,
      }, { withCredentials: true });

      if (res.data.success) {
        alert("PIN updated successfully! ✅");
        setIsModalOpen(false);
        setNewPin("");
      } else {
        setPinMessage(res.data.message || "Failed to update PIN.");
      }
    } catch (err) {
      setPinMessage("Server error. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOption = (action: OptionAction): void => {
    if (!selectedProfile) return;
    const profileName = encodeURIComponent(selectedProfile.profileName);
    
    if (action === "changePin") {
      setIsModalOpen(true); // פתיחת המודל במקום ניווט
    }
    if (action === "viewProgress") navigate(`/progress?profile=${profileName}`);
    if (action === "reportHistory") navigate(`/reports?profile=${profileName}`);
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
    <MainLayout darkMode={darkMode} setDarkMode={handleToggleDarkMode}>
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

      </div>
    </MainLayout>
  );
};

export default ParentPage;