import React from "react";

type Props = { children: React.ReactNode };

export default function LoginLayout({ children }: Props) {
  return <div className="auth-shell">{children}</div>;
}
