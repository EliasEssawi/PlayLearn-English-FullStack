import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../../utils/auth";
import { getProfilesResponse, sendVerificationCodeRequest } from "../../Types/Login";
import axios, { AxiosError } from "axios";

type Profile = {
  profileName: string;
};

type LoggedInUser = {
  email?: string;
};

type OptionAction = "changePin" | "viewProgress" | "reportHistory";

const API_BASE = "/api";

const ParentPage: React.FC = () => {
  //redirect to login page if user is not logged in
  const navigate = useNavigate(); 
  useEffect(() => {
    isLoggedIn().then(ok => {
      if (!ok) navigate("/login");
    });
  }, []);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Password change form (parent main account)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const fetchProfiles = async (): Promise<void> => {
      try {
        const savedUserRaw = localStorage.getItem("loggedInUser");
        if (!savedUserRaw) return;

        /*
        const savedUser = JSON.parse(savedUserRaw) as LoggedInUser;
        if (!savedUser.email) return;
        */

        const payload: sendVerificationCodeRequest = {
            email: savedUserRaw.trim().toLowerCase(),
        };
        console.log(payload.email + "*****");
        const res = await axios.get<getProfilesResponse>(`${API_BASE}/profiles/${payload.email}`, {withCredentials: true , params: payload});
        const data = res.data;

        if (data.success) {
          setProfiles(data.profiles || []);
          // IMPORTANT: do NOT auto-select first child,
          // so options show only after user clicks a child.
          setSelectedProfile(null);
        } else {
          setProfiles([]);
          setSelectedProfile(null);
        }
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      }
    };

    fetchProfiles();
  }, []);

  const goToAddProfile = (): void => {
    window.location.href = "/addprofile";
  };

  const handleOption = (action: OptionAction): void => {
    if (!selectedProfile) return;

    if (action === "changePin") {
      window.location.href = `/change-pin?profile=${encodeURIComponent(
        selectedProfile.profileName
      )}`;
    }
    if (action === "viewProgress") {
      window.location.href = `/progress?profile=${encodeURIComponent(
        selectedProfile.profileName
      )}`;
    }
    if (action === "reportHistory") {
      window.location.href = `/reports?profile=${encodeURIComponent(
        selectedProfile.profileName
      )}`;
    }
  };

  const handleSavePassword = async (): Promise<void> => {
    setPassMsg("");

    if (newPassword.trim().length < 6) {
      setPassMsg("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg("Passwords do not match.");
      return;
    }

    const savedUser: LoggedInUser = JSON.parse(
      localStorage.getItem("loggedInUser") || "{}"
    );

    if (!savedUser.email) {
      setPassMsg("User is not logged in.");
      return;
    }

    try {
      setPassLoading(true);

      // ✅ Change this endpoint to whatever your backend exposes
      const res = await fetch(
        "http://127.0.0.1:5001/api/parent/change-password",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: savedUser.email,
            newPassword: newPassword.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        setPassMsg(data?.message || "Failed to update password.");
        return;
      }

      setPassMsg("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      console.error(e);
      setPassMsg("Server error. Try again.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div className="container">
          <h1 className="header-title">Parent Dashboard</h1>
        </div>
      </header>

      <main className="section parent-main">
        <h2 className="parent-title">Your Children</h2>

        {/* Children cards */}
        <div className="profiles-grid parent-cards">
          {profiles.map((p) => (
            <button
              key={p.profileName}
              className={`profile-card parent-profile-card ${
                selectedProfile?.profileName === p.profileName
                  ? "parent-selected"
                  : ""
              }`}
              onClick={() => setSelectedProfile(p)}
              type="button"
              aria-label={`Select ${p.profileName}`}
            >
              <div className="profile-avatar">
                <span className="profile-emoji">👦</span>
                <span className="lock">🔒</span>
              </div>

              <div className="profile-name">{p.profileName}</div>
            </button>
          ))}

          {/* Add profile card */}
          <button
            className="profile-card parent-add-card"
            onClick={goToAddProfile}
            type="button"
            aria-label="Add Profile"
          >
            <div className="parent-add-plus">+</div>
            <div className="profile-name">Add Profile</div>
          </button>
        </div>

        {/* Options (only after selecting a child) */}
        {selectedProfile && (
          <div className="parent-options">
            <h3 className="parent-options-title">
              {selectedProfile.profileName} – Options
            </h3>

            <div className="parent-options-actions">
              <button
                className="btn btn-primary parent-btn"
                type="button"
                onClick={() => handleOption("changePin")}
              >
                Change PIN
              </button>

              <button
                className="btn btn-primary parent-btn"
                type="button"
                onClick={() => handleOption("viewProgress")}
              >
                View Progress
              </button>

              <button
                className="btn btn-primary parent-btn"
                type="button"
                onClick={() => handleOption("reportHistory")}
              >
                Report History
              </button>
            </div>
          </div>
        )}

        {/* Parent main account password change card (always visible) */}
        <div className="parent-pass-card">
          <h3 className="parent-pass-title">Update Main Account Password</h3>

          <div className="parent-pass-form">
            <label className="parent-pass-label">New Password</label>
            <input
              className="parent-pass-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <label className="parent-pass-label">Confirm Password</label>
            <input
              className="parent-pass-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {passMsg && (
              <div
                className={
                  passMsg.toLowerCase().includes("success")
                    ? "parent-pass-success"
                    : "error"
                }
              >
                {passMsg}
              </div>
            )}

            <button
              className="btn btn-primary parent-pass-btn"
              type="button"
              onClick={handleSavePassword}
              disabled={passLoading}
            >
              {passLoading ? "Saving..." : "Save Password"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentPage;
