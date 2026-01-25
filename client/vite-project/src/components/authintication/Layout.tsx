import React from "react";

// Layout wrapper for authentication pages
// Provides a consistent outer container for auth-related content
type Props = { children: React.ReactNode };

export default function LoginLayout({ children }: Props) {
  // Wraps authentication components with shared layout styling
  return <div className="auth-shell">{children}</div>;
}
