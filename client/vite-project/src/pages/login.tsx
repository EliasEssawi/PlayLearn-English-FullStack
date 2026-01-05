import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginLayout from "../components/login/Layout";
import LoginCard from "../components/login/Card";
import LoginLeftPanel from "../components/login/LeftPanel";
import LoginRightPanel from "../components/login/RightPanel";
import LoginHeader from "../components/login/Header";
import LoginInput from "../components/login/Input";
import ButtonLogin from "../components/login/Button";
import LoginActions from "../components/login/Actions";
import { LoginRequest, LoginResponse } from "../Types/Login";
import axios, { AxiosError } from "axios";

const API_BASE = "/api";

export default function Login() {
  type UserData = {
    email: string;
    password: string;
  };

  const navigate = useNavigate(); // ✅ שלב 1 – ניווט

  const [message, setMessage] = useState<string>("");

  const initialUserData: UserData = {
    email: "",
    password: ""
  };

  const [userData, setUserData] = useState<UserData>(initialUserData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage("");

    const payload: LoginRequest = {
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
    };

    try {
      //send login message to server
      /*
        { withCredentials: true } does :
        ✔ Browser receives Set-Cookie header
        ✔ Browser stores cookie automatically
        ✔ Cookie is sent on every next request
        ✔ JS cannot read it (secure)
      */
      await axios.post<LoginResponse>(`${API_BASE}/login`, payload, { withCredentials: true });

      localStorage.setItem("loggedInUser", payload.email);

      //navigate — auth is now server-side
      navigate("/chooseProfile");
      

    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setMessage(error.response?.data?.message ||"Login failed.");
    }
  };

  return (
    <LoginLayout>
      <LoginCard>
        <LoginLeftPanel>
          <LoginHeader />

          <form onSubmit={handleSubmit}>
            <LoginInput
              label="Username or Email"
              placeholder="you@example.com"
              value={userData.email}
              onChange={handleChange}
              name="email"
            />

            <LoginInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={userData.password}
              onChange={handleChange}
              name="password"
            />

            <ButtonLogin />

            {message && <div className="error">{message}</div>}

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
    </LoginLayout>
  );
}
