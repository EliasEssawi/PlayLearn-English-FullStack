import React from "react";

type Props = {
  title?: string;
  description?: string;
  footer?: string;
};

export default function LoginRightPanel({
  // Default heading shown on the right panel (can be overridden by props)
  title = "Welcome Back 👋",
  // Default helper text describing what the user can do after logging in
  description = "Continue your learning journey and track your progress across talking, reading, listening and vocabulary.",
  // Footer text (usually copyright / app name)
  footer = "© 2025 Your App",
}: Props) {
  return (
    // Right side of the auth card (welcome/info panel)
    <div className="auth-right">
      {/* Main title / greeting */}
      <h1 className="welcome-title">{title}</h1>

      {/* Short description under the title */}
      <p className="welcome-text">{description}</p>

      {/* Footer text at the bottom */}
      <div className="welcome-footer">{footer}</div>
    </div>
  );
}
