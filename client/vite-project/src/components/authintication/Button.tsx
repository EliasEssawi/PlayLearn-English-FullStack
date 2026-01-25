import React from "react";

// Props for a reusable login button component
// - children: custom button label (default is "Login")
// - disabled: controls whether the button is clickable
// - btnProp: optional additional CSS class
type Props = {
  children?: React.ReactNode;
  disabled?: boolean;
  btnProp?:string;
};

// Reusable submit button used mainly in authentication forms
export default function ButtonLogin({ children = "Login", disabled = false, btnProp }: Props) {
  // Base CSS classes for the button
  let classNameProp = "btn btn-primary"
  return (
    <button type="submit" disabled={disabled} className={classNameProp + (btnProp ? btnProp : "")}>
      {children}
    </button>
  );
}
