import React from 'react';
import './ClubCard.css';
import type { Club } from '../utils/types';
import { getCampusName } from '../utils/campus';

interface ClubCardProps {
  club: Club;
  onAccess: (club: Club) => void;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, onAccess }) => {
  return (
    <div className="club-card" onClick={() => onAccess(club)}>
      <img src={club.imageUrl} alt={club.name} className="club-logo" />
      <div className="club-info">
        <div className="club-name">{club.name}</div>
        <div className="club-city">{getCampusName(club.campusId)}</div>
      </div>
      <button className="access-btn">Accéder</button>
    </div>
  );
};

export default ClubCard;
