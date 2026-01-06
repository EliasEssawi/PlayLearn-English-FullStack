import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { RegisterRequest, RegisterResponse } from "../Types/Register";
import LoginRightPanel from "../components/login/RightPanel";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "/api";

type Captcha = { question: string; answer: string };

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
  const [captcha, setCaptcha] = useState<Captcha>({ question: "", answer: "" });
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const initialUserData: UserData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: "",
    dateOfBirth: "",
  };

  const [userData, setUserData] = useState<UserData>(initialUserData);

  const generateCaptcha = (): void => {
    const a = Math.floor(Math.random() * 10 + 1);
    const b = Math.floor(Math.random() * 10 + 1);
    setCaptcha({ question: `${a} + ${b}`, answer: String(a + b) });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage("");

    // CAPTCHA
    if (userAnswer.trim() !== captcha.answer) {
      setMessage("Incorrect CAPTCHA answer.");
      generateCaptcha();
      setUserAnswer("");
      return;
    }

    // Password validation
    if (userData.password !== userData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    // Pin validation
    if (userData.pin !== userData.confirmPin) {
      setMessage("PINs do not match.");
      return;
    }

    const payload: RegisterRequest = {
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      pin: userData.pin,
      dateOfBirth: userData.dateOfBirth
    };

    try {
      const res = await axios.post<RegisterResponse>(`${API_BASE}/public/register`, payload);
      setMessage(res.data.message || "Registered successfully!");
      //Reset form
      setUserData(initialUserData);
      setUserAnswer(""); // If you have a CAPTCHA field
      alert("Registered successfully!");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setMessage(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* LEFT = FORM */}
        <div className="auth-left">
          <div className="auth-left-inner">
            <h2 className="auth-title">Register</h2>
            <p className="auth-subtitle">Fill in your details to create an account</p>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
              {/* Name */}
              <div>
                <label className="auth-label">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={userData.name}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={userData.email}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="auth-label">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={userData.password}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="auth-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={userData.confirmPassword}
                  onChange={handleChange}
                  className="auth-input"
                  placeholder="••••••••"
                />
              </div>

              {/* PIN */}
              <div>
                <label className="auth-label">PIN (4 digits)</label>
                <input
                  type="password"
                  name="pin"
                  required
                  value={userData.pin}
                  onChange={handleChange}
                  maxLength={4}
                  pattern="\d{4}"
                  inputMode="numeric"
                  className="auth-input"
                  placeholder="1234"
                />
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="auth-label">Confirm PIN</label>
                <input
                  type="password"
                  name="confirmPin"
                  required
                  value={userData.confirmPin}
                  onChange={handleChange}
                  maxLength={4}
                  pattern="\d{4}"
                  inputMode="numeric"
                  className="auth-input"
                  placeholder="1234"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="auth-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  value={userData.dateOfBirth}
                  onChange={handleChange}
                  className="auth-input"
                />
              </div>

              {/* CAPTCHA */}
              <div>
                <label className="auth-label">Solve CAPTCHA</label>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontWeight: 800 }}>{captcha.question}</span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="btn-link"
                    style={{ marginTop: 0 }}
                  >
                    ↻ Refresh
                  </button>
                </div>

                <div style={{ marginTop: "0.6rem" }}>
                  <input
                    type="text"
                    required
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="auth-input"
                    placeholder="Enter the answer"
                  />
                </div>
              </div>

              {/* Message */}
              {message ? <div className="error">{message}</div> : null}

              {/* Submit */}
              <button type="submit" className="btn btn-primary">
                REGISTER
              </button>

              {/* Link */}
              <div className="auth-actions">
                <span />
                <a className="auth-link" href="/login">
                  Already have an account? Log in →
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT = WELCOME PANEL */}
        <LoginRightPanel title="Welcome 👋" description="Create your account to start your learning journey and track progress across talking,
            reading, listening, and vocabulary." 
            footer="© 2025 Your App"/>
      </div>
    </div>
  );
};

export default Register;
