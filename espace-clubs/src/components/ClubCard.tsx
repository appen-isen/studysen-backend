import React from 'react';
import './ClubCard.css';
import type { Club } from '../utils/types';
import { getCampusName } from '../utils/campus';
import { FaTrash } from 'react-icons/fa6';

interface ClubCardProps {
  club: Club;
  onAccess: (club: Club) => void;
  adminMode?: boolean;
  onEnable?: (club: Club) => void;
  onEdit?: (club: Club) => void;
  onDelete?: (club: Club) => void;
}

const ClubCard: React.FC<ClubCardProps> = ({
  club,
  onAccess,
  adminMode = false,
  onEnable,
  onEdit,
  onDelete
}) => {
  return (
    <div
      className={`club-card${adminMode && club.enabled === false ? ' club-inenabled' : ''}`}
      onClick={() => !adminMode && onAccess(club)}
    >
      <img src={club.imageUrl} alt={club.name} className="club-logo" />
      <div className="club-info">
        <div className="club-name">{club.name}</div>
        <div className="club-city">{getCampusName(club.campusId)}</div>
        {adminMode && (
          <div className={`club-admin-status ${club.enabled === true ? 'enabled' : ''}`}>
            Statut : <b>{club.enabled === false ? 'Inactif' : 'Actif'}</b>
          </div>
        )}
      </div>
      {adminMode ? (
        <div className="club-admin-actions">
          {club.enabled === false && (
            <button
              className="btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onEnable) onEnable(club);
              }}
            >
              Activer
            </button>
          )}

          <div className="admin-buttons">
            <button
              className="admin-edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(club);
              }}
            >
              Modifier
            </button>
            <button
              className="admin-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(club);
              }}
            >
              <FaTrash></FaTrash>
            </button>
          </div>
          <button className="btn access-btn">Accéder</button>
        </div>
      ) : (
        <button className="btn access-btn">Accéder</button>
      )}
    </div>
  );
};

export default ClubCard;
