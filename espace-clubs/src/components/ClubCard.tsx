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
    <div className="club-card" onClick={() => !adminMode && onAccess(club)}>
      <img src={club.imageUrl} alt={club.name} className="club-logo" />
      {/* Affiche le nom du club et la ville */}
      <div className="club-info">
        <div className="club-name">{club.name}</div>
        <div className="club-city">{getCampusName(club.campusId)}</div>
        {/* Affiche si le club est actif ou non pour les administrateurs*/}
        {adminMode && (
          <div className={`club-admin-status ${club.enabled === true ? 'enabled' : ''}`}>
            Statut : <b>{club.enabled === false ? 'Désactivé' : 'Activé'}</b>
          </div>
        )}
      </div>
      {/* Mode édition pour les administrateurs */}
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
          {/* Bouton d'accès pour les administrateurs si le club est activé */}
          {club.enabled === true && <button className="btn access-btn">Accéder</button>}
        </div>
      ) : (
        <button className="btn access-btn">Accéder</button>
      )}
    </div>
  );
};

export default ClubCard;
