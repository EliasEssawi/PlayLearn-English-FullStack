import React from "react";

// Wrapper component for the left section of authentication pages
// Used to structure and style the main form content
type Props = { children: React.ReactNode };

export default function LoginLeftPanel({ children }: Props) {
  return (
    <div className="auth-left">
      {/* Inner container for aligning and spacing auth form elements */}
      <div className="auth-left-inner">{children}</div>
    </div>
  );
}
