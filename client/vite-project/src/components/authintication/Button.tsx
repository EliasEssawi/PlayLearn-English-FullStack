import React from "react";

type Props = {
  children?: React.ReactNode;
  disabled?: boolean;
  btnProp?:string;
};

export default function ButtonLogin({ children = "Login", disabled = false, btnProp }: Props) {
  let classNameProp = "btn btn-primary"
  return (
    <button type="submit" disabled={disabled} className={classNameProp + (btnProp ? btnProp : "")}>
      {children}
    </button>
  );
}
