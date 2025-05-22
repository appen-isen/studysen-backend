import { useState, useEffect } from 'react';
import './App.css';
import ClubCard from './components/ClubCard';
import { Input } from './components/Inputs';
import { MultiToggle } from './components/Buttons';
import { getCookie, removeCookie, setCookie } from './utils/cookies';
import Loader from './components/Loader';
import type { Club } from './utils/types';
import { CITIES } from './utils/campus';
import ApiClient from './utils/http';
import LoginModal from './modals/clubs/LoginModal';
import { FaPlus } from 'react-icons/fa6';
import CreateModal from './modals/clubs/CreateModal';
import { useNavigate } from 'react-router';

function App() {
  const [search, setSearch] = useState('');
  // État pour l'index de la ville sélectionnée, initialisé depuis le cookie si présent
  const [cityIndex, setCityIndex] = useState(() => {
    const saved = getCookie('selectedCityIndex');
    return saved !== null && !isNaN(Number(saved)) ? Number(saved) : 0;
  });
  // Les clubs
  const [clubs, setClubs] = useState<Club[]>([]);
  // État pour le club sélectionné (pour la modale)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filtrage des clubs selon la recherche et la ville sélectionnée
  const filteredClubs = clubs.filter(
    (club) => club.name.toLowerCase().includes(search.toLowerCase()) && club.campusId === cityIndex + 1
  );

  // Ouvre la modale pour le club sélectionné
  const handleAccess = (club: Club) => {
    setSelectedClub(club);
    setShowLoginModal(true);
  };

  // On récupère les clubs depuis le backend
  useEffect(() => {
    setLoading(true);
    ApiClient.get('/clubs/' + Number(cityIndex + 1))
      .then((response) => {
        setClubs(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des clubs:', error);
        setLoading(false);
      });
    // On sauvegarde l'index de la ville dans le cookie
    setCookie('selectedCityIndex', String(cityIndex));
  }, [cityIndex]);

  //Connexion automatique si le cookie est présent
  useEffect(() => {
    const autoConnect = Boolean(getCookie('autoConnect'));
    if (autoConnect) {
      ApiClient.get('/clubs/me')
        .then((response) => {
          const club = response.data;
          setCookie('autoConnect', 'true');
          // On redirige vers le tableau de bord
          navigate('/dashboard', {
            state: {
              clubId: club.id,
              name: club.name,
              campusId: club.campusId,
              imageUrl: club.imageUrl
            } as Club
          });
        })
        .catch(() => {
          removeCookie('autoConnect');
        });
    }
  }, []);

  return (
    <div className="main-container">
      <FaPlus size={20} className="new-btn" onClick={() => setShowCreateModal(true)} />
      <h1 className="title">Sélectionnez votre club</h1>
      {/* Barre de recherche et sélection de la ville */}
      <div className="filters">
        <Input
          placeholder="Rechercher un club..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <MultiToggle options={CITIES} selectedIndex={cityIndex} onSelect={(index) => setCityIndex(index)} />
      </div>
      {isLoading && <Loader size={50} />}
      {!isLoading && (
        <div className="club-list club-grid">
          {/* Grille des clubs filtrés */}
          {filteredClubs.length === 0 && <p className="no-result">Aucun club trouvé.</p>}
          {filteredClubs.map((club) => (
            <ClubCard key={club.name + club.campusId} club={club} onAccess={handleAccess} />
          ))}
        </div>
      )}

      {/* Modale d'accès à l'espace membre du club */}
      <LoginModal
        onClose={() => setShowLoginModal(false)}
        open={showLoginModal}
        selectedClub={selectedClub}
      />
      {/* Modale de création d'un espace membre */}
      <CreateModal onClose={() => setShowCreateModal(false)} open={showCreateModal} />
    </div>
  );
}

export default App;
