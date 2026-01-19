import React, { useState } from "react";
import axios, { AxiosError } from "axios";

import Layout from "../authintication/Layout";
import Card from "../authintication/Card";
import Input from "../authintication/Input";
import Button from "../authintication/Button";
import LoginRightPanel from "../authintication/RightPanel";
import api from "../../api/axios.ts";


type AddProfileData = {
  profileName: string;
  pin: string;
  confirmPin: string;
  rate: number;
};

const AddProfile: React.FC = () => {
  const initialData: AddProfileData = {
    profileName: "",
    pin: "",
    confirmPin: "",
    rate: 1,
  };

  const [profileData, setProfileData] = useState(initialData);
  const [message, setMessage] = useState("");

  const handleChange = (
    name: keyof AddProfileData,
    value: string | number
  ) => {
    if (
      (name === "pin" || name === "confirmPin") &&
      String(value).length > 4
    ) {
      return;
    }

    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setMessage("");

    if (profileData.pin.length !== 4 || profileData.confirmPin.length !== 4) {
      setMessage("PIN must be exactly 4 digits.");
      return;
    }

    if (profileData.pin !== profileData.confirmPin) {
      setMessage("PINs do not match.");
      return;
    }

    if (profileData.rate < 1 || profileData.rate > 5) {
      setMessage("Level must be between 1 and 5.");
      return;
    }

    try {
      await api.post(`/api/profiles`, {
        profileName: profileData.profileName.trim(),
        pin: profileData.pin,
        rate: profileData.rate,
      });

      alert("Profile added successfully!");
      setProfileData(initialData);
      window.history.back();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setMessage(error.response?.data?.message || "Failed to add profile.");
    }
  };

  return (
    <Layout>
      <Card>
        {/* LEFT SIDE */}
        <div className="auth-left">
          <div className="add-profile-left">
            <div className="add-profile-header">
              <h2 className="add-profile-title">Add Child Profile</h2>
              <p className="add-profile-subtitle">
                Create a profile for your child
              </p>
            </div>

            <form
              className="add-profile-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <Input
                label="Child Name"
                name="profileName"
                type="text"
                value={profileData.profileName}
                onChange={(e) =>
                  handleChange("profileName", e.target.value)
                }
                placeholder="Child name"
                required
              />

              <Input
                label="Child PIN (4 digits)"
                name="pin"
                type="password"
                value={profileData.pin}
                onChange={(e) => handleChange("pin", e.target.value)}
                placeholder="1234"
                required
              />

              <Input
                label="Confirm PIN"
                name="confirmPin"
                type="password"
                value={profileData.confirmPin}
                onChange={(e) =>
                  handleChange("confirmPin", e.target.value)
                }
                placeholder="1234"
                required
              />

              <Input
                label="Child Level (1–5)"
                name="rate"
                type="number"
                value={String(profileData.rate)}
                onChange={(e) =>
                  handleChange("rate", Number(e.target.value))
                }
                min={1}
                max={5}
                required
              />

              {message && <div className="error">{message}</div>}

              <div className="add-profile-actions">
                <Button>ADD PROFILE</Button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <LoginRightPanel
          title="One More Step 🎉"
          description="Add a profile for your child and start learning together."
          footer="© 2025 Your App"
        />
      </Card>
    </Layout>
  );
};

export default AddProfile;
