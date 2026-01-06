import React from "react";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function LoginHeader({
  title = "Login",
  subtitle = "Enter your credentials to continue",
}: Props) {
  return (
    <>
      <h2 className="auth-title">{title}</h2>
      <p className="auth-subtitle">{subtitle}</p>
    </>
  );
}
