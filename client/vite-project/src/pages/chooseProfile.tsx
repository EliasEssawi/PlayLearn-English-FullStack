import React, { useEffect, useState } from "react";
import ProfileCard from "../components/profile/ProfileCard";
import PinModal from "../components/profile/PinModal";
import {isLoggedIn} from "../utils/auth"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { sendVerificationCodeRequest, getProfilesResponse, Profile } from "../Types/Login";

type User = {
  email: string;
};

type Page = "addprofile";

const API_BASE = "/api";

const ChooseProfile: React.FC = () => {
  //redirect to login page if user is not logged in
  const navigate = useNavigate(); 
  useEffect(() => {
    isLoggedIn().then(ok => {
      if (!ok) navigate("/login");
    });
  }, []);


  const goToPage = (page: Page): void => {
    if (page === "addprofile") window.location.href = "/addprofile";
  };

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [pinInputs, setPinInputs] = useState<string[]>(["", "", "", ""]);
  const [pinError, setPinError] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  
  /* ===========================
     Fetch profiles
  =========================== */
  useEffect(() => {
    
    const fetchProfiles = async (): Promise<void> => {
      try {
        
        const savedUserRaw = localStorage.getItem("loggedInUser");
        if (!savedUserRaw) return;

        const savedUser = JSON.parse(savedUserRaw) as { email: string };
        if (!savedUser.email) return;

        setCurrentUser({ email: savedUser.email });
        
        const payload: sendVerificationCodeRequest = {
            email: savedUser.email.trim().toLowerCase(),
        };

        const res = await axios.post<getProfilesResponse>(`${API_BASE}/profiles/:email`, payload, { withCredentials: true });
        const data = res.data;

        if (data.success) {
          setProfiles(data.profiles || []);
        } else {
          setProfiles([]);
        }
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      }
    };

    fetchProfiles();
  }, []);

  /* ===========================
     PIN logic
  =========================== */
  const openPin = (profile?: Profile): void => {
    if(profile)
    {
      setSelectedProfile(profile);
      setPinInputs(["", "", "", ""]);
      setPinError(false);
    }
  };

  const closePin = (): void => {
    setSelectedProfile(null);
    setPinInputs(["", "", "", ""]);
    setPinError(false);
  };

  const handlePinChange = (value: string, idx: number): void => {
    if (!/^\d?$/.test(value)) return;

    setPinInputs((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });

    if (value && idx < 3) {
      const el = document.getElementById(`pin-${idx + 1}`) as HTMLInputElement;
      el?.focus();
    }
  };

  const handlePinBackspace = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Backspace" && !pinInputs[idx] && idx > 0) {
      const el = document.getElementById(`pin-${idx - 1}`) as HTMLInputElement;
      el?.focus();
    }
  };

  /* ✅ VERIFY PIN VIA BACKEND */
  const handlePinSubmit = async (): Promise<void> => {
    if (!selectedProfile || !currentUser) return;

    const enteredPin = pinInputs.join("");

    try {
      const res = await fetch(
        "http://127.0.0.1:5001/api/profiles/verify-pin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser.email,
            profileName: selectedProfile.profileName,
            pin: enteredPin,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        localStorage.setItem(
          "activeProfile",
          JSON.stringify(data.profile)
        );
        window.location.href = "/parentPage";
        return;
      }

      setPinError(true);
      setPinInputs(["", "", "", ""]);
    } catch (err) {
      console.error(err);
      setPinError(true);
    }
  };

  /* ===========================
     Render
  =========================== */
  return (
    <div className="page">
      <header className="header">
        <h1 className="header-title">Who’s Learning Today?</h1>
      </header>

      {/* Add Profile */}
      <div className="add-profile-wrapper">
        <button
          className="add-profile-btn"
          onClick={() => goToPage("addprofile")}
        >
          ➕ Add Profile
        </button>
      </div>

      {/* Profiles */}
      <section className="profiles-grid">
        {/* Parent */}
        <ProfileCard
          name="Parent"
          emoji="👨‍👩‍👧"
          onClick={() => openPin(profiles.find(profile => profile.profileName === "Parent"))}
        />

        {/* Children */}
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.profileName}
            name={profile.profileName}
            emoji="🧒"
            onClick={() => openPin(profile)}
          />
        ))}
      </section>

      {/* PIN Modal */}
      {selectedProfile && (
        <PinModal
          profileName={selectedProfile.profileName}
          pinInputs={pinInputs}
          pinError={pinError}
          onChange={handlePinChange}
          onBackspace={handlePinBackspace}
          onSubmit={handlePinSubmit}
          onClose={closePin}
        />
      )}
    </div>
  );
};

export default ChooseProfile;
