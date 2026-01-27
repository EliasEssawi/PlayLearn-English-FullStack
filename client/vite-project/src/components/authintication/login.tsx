import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginLayout from "./Layout";
import LoginCard from "./Card";
import LoginLeftPanel from "./LeftPanel";
import LoginRightPanel from "./RightPanel";
import LoginHeader from "./Header";
import LoginInput from "./Input";
import ButtonLogin from "./Button";
import LoginActions from "./Actions";
import { LoginRequest, LoginResponse } from "../../Types/Login";
import axios, { AxiosError } from "axios";
import api from "../../api/axios";
import AuthLayout from "./AuthLayout";



export default function Login() {
  // Local type for storing login form data
  type UserData = {
    email: string;
    password: string;
  };

  // React Router navigation hook
  const navigate = useNavigate();

  // Feedback message (error/success)
  const [message, setMessage] = useState<string>("");

  // Initial empty form state
  const initialUserData: UserData = {
    email: "",
    password: ""
  };

  // Controlled form state
  const [userData, setUserData] = useState<UserData>(initialUserData);

  // Updates form state on input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles login form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage("");

    // Prepare login request payload
    const payload: LoginRequest = {
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
    };

    try {
      /*
        withCredentials behavior:
        - Browser receives Set-Cookie from server
        - Cookie is stored automatically
        - Cookie is sent on future requests
        - Cookie is not accessible via JavaScript (security)
      */
      await api.post<LoginResponse>("/api/public/login", payload);

      // Store logged-in user identifier locally
      localStorage.setItem("loggedInUser", payload.email);

      // Redirect user to profile selection after successful login
      navigate("/chooseProfile");
      

    } catch (err) {
      // Display server-side or generic error message
      const error = err as AxiosError<{ message?: string }>;
      setMessage(error.response?.data?.message ||"Login failed.");
    }
  };

  return (
    <AuthLayout>

      <LoginCard>
        <LoginLeftPanel>
          <LoginHeader />

          <form onSubmit={handleSubmit}>
            {/* Email / username input */}
            

                  
                    <LoginInput
          label="Username or Email"
          placeholder="you@example.com"
          value={userData.email}
          onChange={handleChange}
          name="email"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        {/* Password input */}
        <LoginInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={userData.password}
          onChange={handleChange}
          name="password"
          autoComplete="current-password"
        />


            {/* Submit login form */}
            <ButtonLogin />

            {/* Error message display */}
            {message && <div className="error">{message}</div>}

            {/* Auxiliary navigation actions */}
            <div className="flex justify-between">
              <LoginActions
                text="Forgot password?"
                actionFunction={() => (window.location.href = "./forgotPassword")}
              />
              <LoginActions
                text="Create account →"
                actionFunction={() => (window.location.href = "./register")}
              />
            </div>
          </form>
        </LoginLeftPanel>

        <LoginRightPanel />
      </LoginCard>
    </AuthLayout>
  );
}
