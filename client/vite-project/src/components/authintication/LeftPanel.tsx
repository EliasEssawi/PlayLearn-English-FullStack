import React from "react";

type Props = { children: React.ReactNode };

export default function LoginLeftPanel({ children }: Props) {
  return (
    <div className="auth-left">
      <div className="auth-left-inner">{children}</div>
    </div>
  );
}
