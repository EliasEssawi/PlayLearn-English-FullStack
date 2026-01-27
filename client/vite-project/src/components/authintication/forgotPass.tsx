import React, { useState } from "react";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import Input from "./Input";
import Button from "./Button";
import Actions from "./Actions";
import Card from "./Card";
import Layout from "./Layout";
import axios, { AxiosError } from "axios";
import {sendVerificationCodeRequest, LoginResponse, VerifyCodeRequest, ChangePassRequest} from "../../Types/Login";

// Base URL for public authentication-related API endpoints
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;


export default function ForgotPassword() {
    // Local state for form data, messages, and flow control
    const [message, setMessage] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [code, setCode] = useState<string>("");

    // Controls which step of the reset-password flow is displayed
    const [step, setStep] = useState<"email" | "code" | "newPass">("email");

    const [newPassword, setNewPassword] = useState<string>("");
    const [conNewPassword, setConNewPassword] = useState<string>("");

    // Step 1: Send verification code to user's email
    const sendCode = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setMessage("");

        const payload: sendVerificationCodeRequest = {
            email: email.trim().toLowerCase()
        };

        try {
            // Request server to send reset code via email
            const res = await axios.post<LoginResponse>(`${API_BASE}/public/sendResetPassCode`, payload);
            setMessage(res.data.message || "code successfully sended !");
            setStep("code"); // Move to code verification step
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setMessage(error.response?.data?.message || "sending code has failed.");
            setStep("email");
        }
    };

    // Step 2: Verify the code entered by the user
    const verifyCode = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setMessage("");

        const payload: VerifyCodeRequest = {
            email: email.trim().toLowerCase(),
            code: code
        };

        try {
            // Request server to verify reset code
            const res = await axios.post<LoginResponse>(`${API_BASE}/public/verifyPassCode`, payload);
            setMessage(res.data.message || "code Verified !");
            setStep("newPass"); // Move to password change step
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setMessage(error.response?.data?.message || "failed to verify code.");
            setStep("code");
        }
    };

    // Step 3: Change password after successful code verification
    const changePass = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setMessage("");

        const payload: ChangePassRequest = {
            email: email.trim().toLowerCase(),
            code: code,
            newPassword,
        };

        try {
            // Request server to update user's password
            const res = await axios.post<LoginResponse>(`${API_BASE}/public/changePassword`, payload);
            setMessage(res.data.message || " Password changed successfully !");
            setStep("newPass");

            // Reset local state after successful password change 
            setEmail("");
            setCode("");
            setConNewPassword("");
            setNewPassword("");
            // Redirect user back to login page
            window.location.href = "./login";
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setMessage(error.response?.data?.message || "change password faild.");
            setConNewPassword("");
            setNewPassword("");
        }
    };

    // Navigate back to login page
    const goBack = () =>
    {
        setStep("email")
        window.location.href = "./login"
    }


    return(
        <Layout>
            <Card>
                <LeftPanel>
                    {/* Step 1: Enter email */}
                    {step === "email" && (
                        <form onSubmit={sendCode}>
                            <Input 
                                label="Enter your email" 
                                placeholder="you@example.com" 
                                value={email}
                                name="emailInput" 
                                onChange={(e) => setEmail(e.target.value)}>
                            </Input>
                            <Button children="Send code"></Button>
                        </form>
                    )}

                    {/* Step 2: Enter verification code */}
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
                                <Button btnProp="border-2 border-black rounded-lg bg-emerald-500 text-black hover:bg-emerald-600">Verify code</Button>
                            </form>

                            {/* Resend code */}
                            <div className="flex gap-3 mt-4">
                                <form onSubmit={sendCode}>
                                    <Button btnProp="border-2 border-black flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400">Resend code</Button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Enter new password */}
                     {step === "newPass" && (
                        <form onSubmit={changePass}>
                            <Input 
                                label="Enter new Password" 
                                placeholder="••••••••" 
                                value={newPassword}
                                name="newPassInput"
                                type="password"
                                onChange={(e) => setNewPassword(e.target.value)}>
                            </Input>
                            <Input 
                                label="Confirm new Password" 
                                placeholder="••••••••" 
                                value={conNewPassword}
                                name="conNewPassInput" 
                                type="password"
                                onChange={(e) => setConNewPassword(e.target.value)}>
                            </Input>
                            <Button children="Change password"></Button>
                        </form>
                    )}

                    {/* Feedback message (success or error) */}
                   {message && (
                        <div className={message.toLowerCase().includes("failed")||message.toLowerCase().includes("invalid") ? "error" : "success"}>
                            {message}
                        </div>
                    )}

                    {/* Back navigation */}
                    <Actions
                        text="Back"
                        actionFunction={goBack}
                    />
                </LeftPanel>

                <RightPanel title="" description={`Forgot Your password ?  Enter your email and we will send you a code via email.`}/>
            </Card>
        </Layout>
    )
}