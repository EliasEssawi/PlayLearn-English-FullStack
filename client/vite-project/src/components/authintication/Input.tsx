import React from "react";

// Props definition for a reusable authentication input field
// Supports optional constraints such as min/max for validation
type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;

  // Optional numeric constraints (used when relevant)
  min?: number;
  max?: number;
};

// Reusable input component used in authentication forms
export default function LoginInput({
  label,
  type = "text",
  placeholder,
  required = true,
  value,
  onChange,
  name,
  min,
  max,
}: Props) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Input label */}
      <label className="auth-label">{label}</label>

      {/* Controlled input field */}
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="auth-input"
        min={min} // Optional minimum value constraint
        max={max} // Optional maximum value constraint
      />
    </div>
  );
}
