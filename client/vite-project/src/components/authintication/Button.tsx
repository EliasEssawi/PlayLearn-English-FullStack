import React from "react";
import { useTheme } from "../context/ThemeContext";

// Props for a reusable login button component
// - children: custom button label (default is "Login")
// - disabled: controls whether the button is clickable
// - btnProp: optional additional CSS class
type Props = {
  children?: React.ReactNode;
  disabled?: boolean;
  btnProp?: string;
};

// Reusable submit button used mainly in authentication forms
export default function ButtonLogin({
  children = "Login",
  disabled = false,
  btnProp,
}: Props) {
  const { darkMode } = useTheme();

  // Base CSS classes for the button (לא שינינו!)
  let classNameProp = "btn btn-primary";

  return (
    <button
      type="submit"
      disabled={disabled}
      className={classNameProp + (btnProp ? " " + btnProp : "")}
      style={{
        backgroundColor: darkMode ? "#86e07f" : "#22c55e",
        color: darkMode ? "#0f172a" : "#ffffff",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </button>
  );
}
