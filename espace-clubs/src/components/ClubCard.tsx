import React from 'react';
import './ClubCard.css';

export interface Club {
  name: string;
  city: string;
  logo: string;
}

interface ClubCardProps {
  club: Club;
  onAccess: (club: Club) => void;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, onAccess }) => {
  return (
    <div className="club-card" onClick={() => onAccess(club)}>
      <img src={club.logo} alt={club.name} className="club-logo" />
      <div className="club-info">
        <div className="club-name">{club.name}</div>
        <div className="club-city">{club.city}</div>
      </div>
      <button className="access-btn">Accéder</button>
    </div>
  );
};

export default ClubCard;
