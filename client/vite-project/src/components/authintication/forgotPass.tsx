import React, { useState } from "react";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import Input from "./Input";
import SafeButton from "../authintication/safebutton";
import Actions from "./Actions";
import Card from "./Card";
import Layout from "./Layout";
import api from "../../api/axios";
import type { AxiosError } from "axios";

import {
  sendVerificationCodeRequest,
  LoginResponse,
  VerifyCodeRequest,
  ChangePassRequest,
} from "../../Types/Login";

export default function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [step, setStep] = useState<"email" | "code" | "newPass">("email");

  const [newPassword, setNewPassword] = useState("");
  const [conNewPassword, setConNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const sendCodeRequest = async () => {
    setMessage("");
    setLoading(true);

    const payload: sendVerificationCodeRequest = { email: normalizedEmail };

    try {
      const res = await api.post<LoginResponse>("/api/public/sendResetPassCode", payload);
      setMessage(res.data.message || "Code sent!");
      setStep("code");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setMessage(error.response?.data?.message || "Sending code failed.");
      setStep("email");
    } finally {
      setLoading(false);
    }
  };

  // Step 1
  const sendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!normalizedEmail) {
      setMessage("Please enter an email.");
      return;
    }
    await sendCodeRequest();
  };

  // Step 2
  const verifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const payload: VerifyCodeRequest = {
      email: normalizedEmail,
      code: code.trim(),
    };

    try {
      const res = await api.post<LoginResponse>("/api/public/verifyPassCode", payload);
      setMessage(res.data.message || "Code verified!");
      setStep("newPass");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setMessage(error.response?.data?.message || "Failed to verify code.");
      setStep("code");
    } finally {
      setLoading(false);
    }
  };

  // Step 3
  const changePass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== conNewPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const payload: ChangePassRequest = {
      email: normalizedEmail,
      code: code.trim(),
      newPassword,
    };

    try {
      const res = await api.post<LoginResponse>("/api/public/changePassword", payload);
      setMessage(res.data.message || "Password changed successfully!");

      setEmail("");
      setCode("");
      setConNewPassword("");
      setNewPassword("");

      window.location.href = "./login";
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setMessage(error.response?.data?.message || "Change password failed.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep("email");
    window.location.href = "./login";
  };

  return (
    <Layout>
      <Card>
        <LeftPanel>
          {step === "email" && (
            <form onSubmit={sendCode}>
              <Input
                label="Enter your email"
                placeholder="you@example.com"
                value={email}
                name="emailInput"
                onChange={(e) => setEmail(e.target.value)}
              />
              <SafeButton
                type="submit"
                disabled={loading}
                children={loading ? "Sending..." : "Send code"}
              />
            </form>
          )}

          {step === "code" && (
            <div className="space-y-4">
              <form onSubmit={verifyCode}>
                <Input
                  label="Enter Code"
                  placeholder=""
                  value={code}
                  name="codeInput"
                  onChange={(e) => setCode(e.target.value)}
                />
                <SafeButton
                  type="submit"
                  disabled={loading}
                  btnProp="border-2 border-black rounded-lg bg-emerald-500 text-black hover:bg-emerald-600"
                >
                  {loading ? "Verifying..." : "Verify code"}
                </SafeButton>
              </form>

              <div className="flex gap-3 mt-4">
                <SafeButton
                  type="button"
                  disabled={loading}
                  onClick={sendCodeRequest as any} // if your Button types don't include onClick
                  btnProp="border-2 border-black flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  {loading ? "Sending..." : "Resend code"}
                </SafeButton>
              </div>
            </div>
          )}

          {step === "newPass" && (
            <form onSubmit={changePass}>
              <Input
                label="Enter new Password"
                placeholder="••••••••"
                value={newPassword}
                name="newPassInput"
                type="password"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm new Password"
                placeholder="••••••••"
                value={conNewPassword}
                name="conNewPassInput"
                type="password"
                onChange={(e) => setConNewPassword(e.target.value)}
              />
              <SafeButton type="submit" disabled={loading} children={loading ? "Saving..." : "Change password"} />
            </form>
          )}

          {message && (
            <div
              className={
                message.toLowerCase().includes("fail") ||
                message.toLowerCase().includes("invalid") ||
                message.toLowerCase().includes("match")
                  ? "error"
                  : "success"
              }
            >
              {message}
            </div>
          )}

          <Actions text="Back" actionFunction={goBack} />
        </LeftPanel>

        <RightPanel
          title=""
          description="Forgot Your password? Enter your email and we will send you a code via email."
        />
      </Card>
    </Layout>
  );
}
