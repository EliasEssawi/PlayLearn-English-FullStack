import React from "react";
import { logout } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          logout().then((ok) => {
            if (ok) navigate("/login");
          });
        }}
        className="nav-btn nav-btn-register"
        style={{
          backgroundColor: "#dc2626", // 🔴 אדום קבוע
          color: "#ffffff",
          border: "none",
        }}
      >
        Logout
      </button>
    </div>
  );
}
