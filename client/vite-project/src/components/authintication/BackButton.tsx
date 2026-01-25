import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
  btnProp?: string;
};

function BackButton({ children = "Go Back", btnProp }: Props) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <button
        className={btnProp ?? "nav-btn"}
        onClick={handleBack}
        style={{
          backgroundColor: "#dc2626", // 🔴 אדום
          color: "#ffffff",           // טקסט לבן
          border: "none",
        }}
      >
        {children}
      </button>
    </div>
  );
}

export default BackButton;
