
import React, { ReactNode } from 'react';
// Props definition for a selectable game card

type GameCardProps = {
  title: string;
  description: string;
  emoji: string;
  onClick: () => void;
};
// Reusable game card component

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  emoji,
  onClick,
}) => {
  return (
    <button className="profile-card" onClick={onClick}>
      <div className="profile-avatar">
        <span className="profile-emoji">{emoji}</span>
      </div>
      <div className="profile-name">{title}</div>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </button>
  );
};

export default GameCard;
