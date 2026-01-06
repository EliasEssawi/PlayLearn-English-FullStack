import React, { useEffect, useState } from "react";
import ProfileCard from "../components/profile/ProfileCard";
import PinModal from "../components/profile/PinModal";
import {isLoggedIn} from "../utils/auth"
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { sendVerificationCodeRequest, getProfilesResponse, Profile, verifyPinRequest, verifyPinResponse } from "../Types/Login";

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

  const parentProfile:Profile = {
    profileName: "parent",
    pin: "",
    role: "parent",
    points : 0
  }
  
  /* ===========================
     Fetch profiles
  =========================== */
  useEffect(() => {
    
    const fetchProfiles = async (): Promise<void> => {
      try {
        console.log("fetching profiles");
        const savedUserRaw = localStorage.getItem("loggedInUser");
        if (!savedUserRaw) return;

        /*
        console.log("found user in local storage");
        const savedUser = JSON.parse(savedUserRaw) as { email: string };
        if (!savedUser.email) return;
        */

        console.log("setting current user");
        setCurrentUser({ email: savedUserRaw });
        
        const payload: sendVerificationCodeRequest = {
            email: savedUserRaw.trim().toLowerCase(),
        };
        console.log(payload.email + "*****");
        const res = await axios.get<getProfilesResponse>(`${API_BASE}/profiles/${payload.email}`, {withCredentials: true , params: payload});
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
      
      const payload: verifyPinRequest = {
          email: currentUser.email,
          profileName: selectedProfile.profileName,
          pin: enteredPin,
      };

      const res = await axios.post<verifyPinResponse>(`${API_BASE}/profiles/verify-pin`, payload ,{withCredentials: true});

      if (res) {
        localStorage.setItem(
          "activeProfile",
          JSON.stringify(res.data.profile)
        );
        console.log("role : "+res.data.profile.role);
        if(res.data.profile.role === "parent")
        {
          window.location.href = "/parentPage";
          return;
        }
        window.location.href = "/mainPage";
        return;
      }
    
      setPinError(true);
      setPinInputs(["", "", "", ""]);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("err :"+error.response?.data?.message);
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
          onClick={() => openPin( parentProfile )}
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
