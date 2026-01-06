import React from "react";

type Props = { children: React.ReactNode };

export default function LoginCard({ children }: Props) {
  return <div className="auth-card">{children}</div>;
}
