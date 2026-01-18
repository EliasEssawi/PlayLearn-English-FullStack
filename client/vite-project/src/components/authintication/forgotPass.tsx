import React, { useState } from "react";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import Input from "./Input";
import Button from "./Button";
import Actions from "./Actions";
import Card from "./Card";
import Layout from "./Layout";
import axios, { AxiosError } from "axios";
import {sendVerificationCodeRequest, LoginResponse, VerifyCodeRequest, ChangePassRequest} from "../../Types/Login"

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;


export default function ForgotPassword() {
    const [message, setMessage] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [code, setCode] = useState<string>("");
    const [step, setStep] = useState<"email" | "code" | "newPass">("email");
    const [newPassword, setNewPassword] = useState<string>("");
    const [conNewPassword, setConNewPassword] = useState<string>("");

    const sendCode = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setMessage("");

        const payload: sendVerificationCodeRequest = {
            email: email.trim().toLowerCase()
        };

        //req to send code via email to server
        try {
            const res = await axios.post<LoginResponse>(`${API_BASE}/public/sendResetPassCode`, payload);
            setMessage(res.data.message || "code successfully sended !");
            setStep("code"); // show second card 
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setMessage(error.response?.data?.message || "sending code has failed.");
            setStep("email"); // show first card 
        }
    };

    const verifyCode = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setMessage("");

        const payload: VerifyCodeRequest = {
            email: email.trim().toLowerCase(),
            code: code
        };

        //req to verify code to server
        try {
            const res = await axios.post<LoginResponse>(`${API_BASE}/public/verifyPassCode`, payload);
            setMessage(res.data.message || "code Verified !");
            setStep("newPass"); // show third card 
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setMessage(error.response?.data?.message || "failed to verify code.");
            setStep("code"); // show second card 
        }
    };

    const changePass = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setMessage("");

        const payload: ChangePassRequest = {
            email: email.trim().toLowerCase(),
            code: code,
            newPassword,
        };

        //req to change password to server
        try {
            const res = await axios.post<LoginResponse>(`${API_BASE}/public/changePassword`, payload);
            setMessage(res.data.message || " Password changed successfully !");
            setStep("newPass"); // show third card 
            setEmail("");
            setCode("");
            setConNewPassword("");
            setNewPassword("");
             window.location.href = "./login"
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setMessage(error.response?.data?.message || "change password faild.");
            setConNewPassword("");
            setNewPassword("");
            //setStep("code"); // show second card 
        }
    };

    const goBack = () =>
    {
        setStep("email")
        window.location.href = "./login"
    }


    return(
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
                                onChange={(e) => setEmail(e.target.value)}>
                            </Input>
                            <Button children="Send code"></Button>
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
                                <Button btnProp="border-2 border-black rounded-lg bg-emerald-500 text-black hover:bg-emerald-600">Verify code</Button>
                            </form>

                            <div className="flex gap-3 mt-4">
                                <form onSubmit={sendCode}>
                                    <Button btnProp="border-2 border-black flex-1 bg-gray-300 text-gray-700 hover:bg-gray-400">Resend code</Button>
                                </form>
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

                   {message && (
  <div className={message.toLowerCase().includes("failed")||message.toLowerCase().includes("invalid") ? "error" : "success"}>
    {message}
  </div>
)}
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