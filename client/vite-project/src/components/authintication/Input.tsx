import React from "react";

type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;

  /* ✅ additions only */
  min?: number;
  max?: number;
};

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
      <label className="auth-label">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="auth-input"

        /* ✅ added – no behavior change */
        min={min}
        max={max}
      />
    </div>
  );
}
