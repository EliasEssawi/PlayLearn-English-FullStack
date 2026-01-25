import React from "react";
import { useNavigate } from "react-router-dom";

// Props for a reusable back navigation button
// - children: optional custom button text
// - btnProp: optional CSS class override
type Props = {
  children?: React.ReactNode;
  btnProp?: string;
};

// Button component that navigates one step back in browser history
function BackButton({ children = "Go Back", btnProp }: Props) {
  const navigate = useNavigate();

  // Navigates to the previous page
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
