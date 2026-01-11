import React from "react";

type ProfileCardProps = {
  name: string;
  emoji: string;
  onClick: () => void;
  isDarkMode: boolean; // הוספנו את ה-Prop הזה
};

const ProfileCard: React.FC<ProfileCardProps> = ({ name, emoji, onClick, isDarkMode }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        // שינוי הרקע לפי המוד
        backgroundColor: isDarkMode ? "#1e293b" : "#ffffff", 
        color: isDarkMode ? "#ffffff" : "#1e293b",
        padding: "20px",
        borderRadius: "20px",
        width: "140px",
        textAlign: "center",
        cursor: "pointer",
        boxShadow: isDarkMode ? "0 4px 15px rgba(0,0,0,0.5)" : "0 4px 15px rgba(0,0,0,0.1)",
        border: isDarkMode ? "1px solid #334155" : "none",
        transition: "transform 0.2s, background-color 0.3s"
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{ fontSize: "3rem", marginBottom: "10px" }}>{emoji}</div>
      <h3 style={{ margin: 0, fontWeight: "bold", color: "#86e07f" }}>{name}</h3>
    </div>
  );
};

export default ProfileCard;