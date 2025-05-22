import { FaArrowRightFromBracket } from 'react-icons/fa6';
import './Dashboard.css';
import { useLocation, useNavigate } from 'react-router';
import type { Club } from './utils/types';
import ApiClient from './utils/http';
import { useEffect } from 'react';
import { removeCookie } from './utils/cookies';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const club: Club = location.state;

  const handleLogout = () => {
    removeCookie('autoConnect');
    ApiClient.post('/clubs/logout').finally(() => navigate('/'));
  };

  // Vérification de l'existence du club
  useEffect(() => {
    if (club === null || club === undefined) {
      navigate('/');
    }
  }, [club, navigate]);

  if (club === null || club === undefined) {
    return null;
  }
  return (
    <div className="dashboard-container">
      {/* En tête de la page */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <img src={club.imageUrl} alt="avatar" className="avatar" />
          <h3>{club.name}</h3>
          <FaArrowRightFromBracket className="logout" onClick={handleLogout} />
        </div>
        <button className="btn">Nouveau post</button>
      </div>
      <h1>Vos événements</h1>
    </div>
  );
}
