import React from "react";

type SafeButtonProps = {
  children: React.ReactNode;
  btnProp?: string;                 // same idea as your Button styling prop
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export default function SafeButton({
  children,
  btnProp = "",
  type = "button",
  disabled = false,
  onClick,
}: SafeButtonProps) {
  // Basic default style + your custom classes
  const base =
    "w-full px-4 py-2 rounded-lg font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${btnProp}`}
    >
      {children}
    </button>
  );
}
