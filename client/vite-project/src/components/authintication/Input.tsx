import React from "react";
import { useTheme } from "../context/ThemeContext";

// Accept all normal <input> props + our required label
type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function LoginInput({
  label,
  required = true,
  ...inputProps
}: Props) {
  const { darkMode } = useTheme();

  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Input label */}
      <label
        className="auth-label"
        style={{
          color: darkMode ? "#cbd5f5" : "#334155",
          transition: "color 0.3s",
        }}
      >
        {label}
      </label>

      {/* Controlled input field */}
      <input
        {...inputProps}
        required={required}
        className={`auth-input ${inputProps.className ?? ""}`.trim()}
        style={{
          backgroundColor: darkMode ? "#020617" : "#ffffff",
          color: darkMode ? "#f8fafc" : "#0f172a",
          border: darkMode ? "1px solid #334155" : "1px solid #86e07f",
          transition: "all 0.3s ease",
        }}
      />
    </div>
  );
}
