import React from "react";

// Wrapper component for authentication-related content
// Used to provide consistent styling/layout for login and auth forms
type Props = { children: React.ReactNode };

export default function LoginCard({ children }: Props) {
  // Renders children inside a styled authentication card container
  return <div className="auth-card">{children}</div>;
}
