import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileCard from "./ProfileCard";
import PinModal from "./PinModal";
import { isLoggedIn } from "../../utils/auth";
import { Profile, getProfilesResponse, verifyPinResponse } from "../../Types/Login";
import MainLayout from "../authintication/MainLayout"; 

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;


const ChooseProfile: React.FC = () => {
  const navigate = useNavigate();

  // טעינת המצב הראשוני מה-localStorage כדי לשמור על סנכרון בין דפים
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [pinInputs, setPinInputs] = useState<string[]>(["", "", "", ""]);
  const [pinError, setPinError] = useState(false);

  // פונקציה לעדכון ה-Dark Mode ושמירתו בזיכרון
  const handleToggleDarkMode = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem("theme", val ? "dark" : "light");
  };

  useEffect(() => {
    isLoggedIn().then(ok => { if (!ok) navigate("/login"); });
  }, [navigate]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const email = localStorage.getItem("loggedInUser");
      if (!email) return;
      try {
        const res = await axios.get<getProfilesResponse>(`${API_BASE}/profiles/${email}`, { withCredentials: true });
        if (res.data.success) setProfiles(res.data.profiles || []);
      } catch (err) { console.error(err); }
    };
    fetchProfiles();
  }, []);

  const openPin = (p: Profile) => {
    setSelectedProfile(p);
    setPinInputs(["", "", "", ""]);
    setPinError(false);
  };

  return (
    <MainLayout darkMode={darkMode} setDarkMode={handleToggleDarkMode}>
      <div className="page-content text-center">
        <h2 style={{ 
            marginBottom: "2rem", 
            fontSize: "2.5rem", 
            fontWeight: "bold",
            color: darkMode ? "#86e07f" : "inherit" 
        }}>
          Who’s Learning Today?
        </h2>
        
        <div style={{ display: "flex", gap: "25px", justifyContent: "center", flexWrap: "wrap" }}>
          {/* פרופיל הורה */}
          <ProfileCard 
            name="Parent" 
            emoji="👨‍👩‍👧" 
            isDarkMode={darkMode}
            onClick={() => openPin({ profileName: "parent", role: "parent", points: 0, pin: "" })} 
          />
          
          {/* פרופילי ילדים */}
          {profiles.map(p => (
            <ProfileCard 
                key={p.profileName} 
                name={p.profileName} 
                emoji="🧒" 
                isDarkMode={darkMode}
                onClick={() => openPin(p)} 
            />
          ))}
        </div>

        {selectedProfile && (
          <PinModal
            profileName={selectedProfile.profileName}
            pinInputs={pinInputs}
            pinError={pinError}
            isDarkMode={darkMode}
            onChange={(val, idx) => {
                const next = [...pinInputs];
                next[idx] = val;
                setPinInputs(next);
            }}
            onBackspace={(idx) => {
                const next = [...pinInputs];
                next[idx] = "";
                setPinInputs(next);
            }}
            onSubmit={async () => {
                const email = localStorage.getItem("loggedInUser");
                if (!email) return;
                try {
                  const res = await axios.post<verifyPinResponse>(`${API_BASE}/profiles/verify-pin`, {
                    email,
                    profileName: selectedProfile.profileName,
                    pin: pinInputs.join("")
                  }, { withCredentials: true });
                  
                  if (res.data) {
                    localStorage.setItem("activeProfile", JSON.stringify({ email: res.data.profile, pin: pinInputs.join("") }));
                    // ניווט לדף המתאים לפי תפקיד
                    window.location.href = res.data.profile.role === "parent" ? "/parentPage" : "/mainPage";
                  }
                } catch { setPinError(true); }
            }}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ChooseProfile;