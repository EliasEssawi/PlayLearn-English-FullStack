import React from "react";

// Accept all normal <input> props + our required label
type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function LoginInput({ label, required = true, ...inputProps }: Props) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Input label */}
      <label className="auth-label">{label}</label>

      {/* Controlled input field */}
      <input
        {...inputProps}
        required={required}
        className={`auth-input ${inputProps.className ?? ""}`.trim()}
      />
    </div>
  );
}
