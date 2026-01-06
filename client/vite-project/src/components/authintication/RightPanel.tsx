import React from "react";

type Props = {
  title?: string;
  description?: string;
  footer?: string;
};

export default function LoginRightPanel({
  title = "Welcome Back 👋",
  description = "Continue your learning journey and track your progress across talking, reading, listening and vocabulary.",
  footer = "© 2025 Your App",
}: Props) {
  return (
    <div className="auth-right">
      <h1 className="welcome-title">{title}</h1>
      <p className="welcome-text">{description}</p>
      <div className="welcome-footer">{footer}</div>
    </div>
  );
}
