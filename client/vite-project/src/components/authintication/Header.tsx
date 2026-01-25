import React from "react";

// Props for the authentication header component
// - title: main heading text
// - subtitle: supporting descriptive text
type Props = {
  title?: string;
  subtitle?: string;
};

// Reusable header component for authentication screens (login, register, etc.)
export default function LoginHeader({
  title = "Login",
  subtitle = "Enter your credentials to continue",
}: Props) {
  return (
    <>
      {/* Main title of the authentication form */}
      <h2 className="auth-title">{title}</h2>

      {/* Subtitle providing additional guidance to the user */}
      <p className="auth-subtitle">{subtitle}</p>
    </>
  );
}
