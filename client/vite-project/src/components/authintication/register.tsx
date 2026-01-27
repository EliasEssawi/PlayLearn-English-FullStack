import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { RegisterRequest, RegisterResponse } from "../../Types/Register";
import LoginRightPanel from "./RightPanel";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../authintication/AuthLayout";
import LoginCard from "../authintication/Card";
import LoginLeftPanel from "../authintication/LeftPanel";
import { useTheme } from "../context/ThemeContext";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

type Captcha = { question: string; answer: string };
//  Local form state structure
type UserData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  pin: string;
  confirmPin: string;
  dateOfBirth: string;
};

const Register: React.FC = () => {
  const navigate = useNavigate(); //    Navigation hook for redirecting after successful registration
  const { darkMode } = useTheme();//    Dark / light mode flag from ThemeContext

  const [captcha, setCaptcha] = useState<Captcha>({ question: "", answer: "" });//    CAPTCHA state
  const [userAnswer, setUserAnswer] = useState("");//    UI feedback message (success / error)
  const [message, setMessage] = useState("");

  const initialUserData: UserData = {//    Initial empty form state
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: "",
    dateOfBirth: "",
  };

  const [userData, setUserData] = useState<UserData>(initialUserData);//    Controlled form state
   // Dynamic styles for inputs based on dark / light mode

  const inputStyle: React.CSSProperties = {
    backgroundColor: darkMode ? "#020617" : "#ffffff",
    color: darkMode ? "#ffffff" : "#0f172a",
    border: darkMode ? "1px solid #4ade80" : "1px solid #86e07f",
  };

  const labelStyle: React.CSSProperties = {
    color: darkMode ? "#ffffff" : "#0f172a",
    fontWeight: 700,
  };

  const subtitleStyle: React.CSSProperties = {
    color: darkMode ? "#e5e7eb" : "#475569",
  };

  const dateInputStyle: React.CSSProperties = {
    ...inputStyle,
    colorScheme: darkMode ? "dark" : "light",
  };

  const captchaTextStyle: React.CSSProperties = {
    color: darkMode ? "#ffffff" : "#0f172a",
    fontWeight: 800,
  };
//    Generates a simple math CAPTCHA
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10 + 1);
    const b = Math.floor(Math.random() * 10 + 1);
    setCaptcha({ question: `${a} + ${b}`, answer: String(a + b) });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);
//    Generic change handler for all input fields

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };
//    Submit handler with full validation logic
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    /* CAPTCHA validation */

    if (userAnswer.trim() !== captcha.answer) {
      setMessage("Incorrect CAPTCHA answer.");
      generateCaptcha();
      setUserAnswer("");
      return;
    }
    /* Password match validation */

    if (userData.password !== userData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    /* Password strength validation */
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(userData.password)) {
      setMessage(
        "Password must be at least 8 characters long and include at least one capital letter."
      );
      return;
    }
    /* PIN match validation */
    if (userData.pin !== userData.confirmPin) {
      setMessage("PINs do not match.");
      return;
    }
    /* Date of birth validation */
    const selectedDate = new Date(userData.dateOfBirth);
    const today = new Date();

    if (selectedDate > today) {
      setMessage("Date of birth cannot be in the future.");
      return;
    }

    let age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < selectedDate.getDate())
    ) {
      age--;
    }

    if (age < 24 || age > 100) {
      setMessage("Age must be between 24 and 100 years old.");
      return;
    }

    const payload: RegisterRequest = {//    /* Build request payload */
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      pin: userData.pin,
      dateOfBirth: userData.dateOfBirth,
    };

    try {
      await axios.post<RegisterResponse>(
        `${API_BASE}/public/register`,
        payload,
        { withCredentials: true }
      );

      setMessage("Registered successfully! Redirecting to login...");
      setUserData(initialUserData);
      setUserAnswer("");

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setMessage(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <AuthLayout>
      <LoginCard>
        <LoginLeftPanel>
          <h2 className="auth-title">Register</h2>
          <p className="auth-subtitle" style={subtitleStyle}>
            Fill in your details to create an account
          </p>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                className="auth-input"
                placeholder="Your name"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                className="auth-input"
                placeholder="you@example.com"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="auth-input"
                placeholder="••••••••"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                className="auth-input"
                placeholder="••••••••"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>PIN (4 digits)</label>
              <input
                type="password"
                name="pin"
                value={userData.pin}
                onChange={handleChange}
                className="auth-input"
                placeholder="****"
                maxLength={4}
                inputMode="numeric"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Confirm PIN</label>
              <input
                type="password"
                name="confirmPin"
                value={userData.confirmPin}
                onChange={handleChange}
                className="auth-input"
                placeholder="****"
                maxLength={4}
                inputMode="numeric"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={userData.dateOfBirth}
                onChange={handleChange}
                className="auth-input"
                style={dateInputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Solve CAPTCHA</label>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span style={captchaTextStyle}>{captcha.question}</span>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="btn-link"
                >
                  ↻ Refresh
                </button>
              </div>

              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="auth-input"
                placeholder="Enter the answer"
                style={inputStyle}
                required
              />
            </div>

            {message && (
              <div
                className={
                  message.toLowerCase().includes("successfully")
                    ? "success"
                    : "error"
                }
              >
                {message}
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              REGISTER
            </button>

            <div className="auth-actions">
              <span />
              <a className="auth-link" href="/login">
                Already have an account? Log in →
              </a>
            </div>
          </form>
        </LoginLeftPanel>

        <LoginRightPanel
          title="Welcome 👋"
          description="Create your account to start your learning journey and track progress across talking, reading, listening, and vocabulary."
          footer="© 2025 Your App"
        />
      </LoginCard>
    </AuthLayout>
  );
};

export default Register;
