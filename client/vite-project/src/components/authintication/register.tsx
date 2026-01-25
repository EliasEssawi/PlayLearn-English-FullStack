import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { RegisterRequest, RegisterResponse } from "../../Types/Register";
import LoginRightPanel from "./RightPanel";
import { useNavigate } from "react-router-dom";

// Base API URL from Vite env (configured per environment: local / production)
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;


type Captcha = { question: string; answer: string };

// Local form state structure for the register page inputs
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
  // React Router navigation (used after successful registration)
  const navigate = useNavigate();

  // CAPTCHA state: current math question + expected answer
  const [captcha, setCaptcha] = useState<Captcha>({ question: "", answer: "" });
  // User input for CAPTCHA
  const [userAnswer, setUserAnswer] = useState<string>("");
  // UI message for success/error feedback
  const [message, setMessage] = useState<string>("");

  // Initial empty form values (used for reset after success)
  const initialUserData: UserData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pin: "",
    confirmPin: "",
    dateOfBirth: "",
  };

  // Form state (controlled inputs)
  const [userData, setUserData] = useState<UserData>(initialUserData);

  // Generates a simple math CAPTCHA and stores both question and correct answer
  const generateCaptcha = (): void => {
    const a = Math.floor(Math.random() * 10 + 1);
    const b = Math.floor(Math.random() * 10 + 1);
    setCaptcha({ question: `${a} + ${b}`, answer: String(a + b) });
  };

  // Generate CAPTCHA once on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Generic input handler for controlled form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler: validates inputs and sends register request to the server
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage("");

    // 1) CAPTCHA validation (reject and regenerate if wrong)
    if (userAnswer.trim() !== captcha.answer) {
      setMessage("Incorrect CAPTCHA answer.");
      generateCaptcha();
      setUserAnswer("");
      return;
    }

    // 2) Password match validation
    if (userData.password !== userData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    // 3) Password strength validation (>= 8 chars and at least one uppercase letter)
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(userData.password)) {
           setMessage("Password must be at least 8 characters long and include at least one capital letter.");
      return;
    }

    // 4) PIN match validation
    if (userData.pin !== userData.confirmPin) {
      setMessage("PINs do not match.");
      return;
    }
   
    // 5) Date of Birth validation (not in the future + age range)
    const selectedDate = new Date(userData.dateOfBirth);
    const today = new Date();

    // Prevent selecting a future date
    if (selectedDate > today) {
      setMessage("Date of birth cannot be in the future.");
      return;
    }

    // Calculate age based on date of birth
    let age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();

    // Adjust age if birthday hasn't happened yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
      age--;
    }

    // Enforce allowed age range
    if (age < 24 || age > 100) {
      setMessage("Age must be between 24 and 100 years old.");
      return;
    }

    // Build request payload (trim + normalize email)
    const payload: RegisterRequest = {
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      pin: userData.pin,
      dateOfBirth: userData.dateOfBirth
    };

    try {
      // Send register request (withCredentials allows cookies/session if server sets them)
      const res = await axios.post<RegisterResponse>(
        `${API_BASE}/public/register`,
        payload,
        { withCredentials: true }
      );

      // Show success feedback and reset the form
      setMessage(res.data.message || "Registered successfully!");
      setUserData(initialUserData);
      setUserAnswer(""); // If you have a CAPTCHA field
      setMessage("Registered successfully! Redirecting to login...");

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2500);

      
    } catch (err) {
      // Extract server error message when available
      const error = err as AxiosError<{ message?: string }>;
      setMessage(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* LEFT SIDE: Registration form */}
        <div className="auth-left">
          <div className="auth-left-inner">
            <h2 className="auth-title">Register</h2>
            <p className="auth-subtitle">Fill in your details to create an account</p>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
              {/* Name input */}
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

              {/* Email input */}
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

              {/* Password input */}
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

              {/* Confirm password input */}
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

              {/* PIN input (4 digits) */}
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
                  placeholder="****"
                />
              </div>

              {/* Confirm PIN input */}
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
                  placeholder="****"
                />
              </div>

              {/* Date of birth input */}
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

              {/* CAPTCHA block */}
              <div>
                <label className="auth-label">Solve CAPTCHA</label>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {/* CAPTCHA question text */}
                  <span style={{ fontWeight: 800 }}>{captcha.question}</span>

                  {/* Regenerate CAPTCHA without submitting the form */}
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
                  {/* User answer for CAPTCHA */}
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

              {/* Success/Error message */}
              {message ? (
                <div
                  className={message.toLowerCase().includes("successfully") ? "success" : "error"}
                >
                  {message}
                </div>
              ) : null}

              {/* Submit button */}
              <button type="submit" className="btn btn-primary">
                REGISTER
              </button>

              {/* Navigate to login */}
              <div className="auth-actions">
                <span />
                <a className="auth-link" href="/login">
                  Already have an account? Log in →
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: Welcome panel */}
        <LoginRightPanel title="Welcome 👋" description="Create your account to start your learning journey and track progress across talking,
            reading, listening, and vocabulary." 
            footer="© 2025 Your App"/>
      </div>
    </div>
  );
};

export default Register;
