import { FaArrowRightFromBracket } from 'react-icons/fa6';
import './Dashboard.css';
import { useLocation, useNavigate } from 'react-router';
import type { Club } from './utils/types';
import ApiClient from './utils/http';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const club: Club = location.state;
  // Vérification de l'existence du club
  if (club === null || club === undefined) {
    navigate('/');
    return;
  }

  const handleLogout = () => {
    ApiClient.post('/clubs/logout').finally(() => navigate('/'));
  };
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
