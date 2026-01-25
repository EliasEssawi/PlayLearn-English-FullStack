import React from "react";
import { logout } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

// Logout button component that ends the user session
export default function Logout() {
  const navigate = useNavigate();

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          // Calls logout utility and redirects to login page on success
          logout().then((ok) => {
            if (ok) navigate("/login");
          });
        }}
        className="nav-btn nav-btn-register"
        style={{
          backgroundColor: "#dc2626", // Red color to indicate logout/destructive action
          color: "#ffffff",
          border: "none",
        }}
      >
        Logout
      </button>
    </div>
  );
}
