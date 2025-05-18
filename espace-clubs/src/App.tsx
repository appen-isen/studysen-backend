import { useState, useEffect } from 'react';
import './App.css';
import ClubCard from './components/ClubCard';
import type { Club } from './components/ClubCard';
import { Input } from './components/Inputs';
import { MultiToggle } from './components/Buttons';
import Modal from './components/Modal';
import { getCookie, setCookie } from './utils/cookies';
import Loader from './components/Loader';

// Liste des clubs disponibles (à remplacer par une récupération backend plus tard)
const CLUBS: Club[] = [
  { name: 'Club Informatique', city: 'Nantes', logo: '/vite.svg' },
  { name: 'Club Robotique', city: 'Brest', logo: '/vite.svg' },
  { name: 'Club Photo', city: 'Caen', logo: '/vite.svg' },
  { name: 'Club Musique', city: 'Rennes', logo: '/vite.svg' },
  { name: 'Club Théâtre', city: 'Paris', logo: '/vite.svg' },
  { name: 'Club Sport', city: 'Nantes', logo: '/vite.svg' },
  { name: 'Club Jeux', city: 'Brest', logo: '/vite.svg' },
  { name: 'Club Échecs', city: 'Caen', logo: '/vite.svg' },
  { name: 'Club Cinéma', city: 'Rennes', logo: '/vite.svg' },
  { name: 'Club Cuisine', city: 'Paris', logo: '/vite.svg' }
];

// Liste des villes pour le filtre
const CITIES = ['Nantes', 'Brest', 'Caen', 'Rennes', 'Paris'];

function App() {
  const [search, setSearch] = useState('');
  // État pour l'index de la ville sélectionnée, initialisé depuis le cookie si présent
  const [cityIndex, setCityIndex] = useState(() => {
    const saved = getCookie('selectedCityIndex');
    return saved !== null && !isNaN(Number(saved)) ? Number(saved) : 0;
  });
  // État pour le club sélectionné (pour la modale)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(true);

  // Filtrage des clubs selon la recherche et la ville sélectionnée
  const filteredClubs = CLUBS.filter(
    (club) => club.name.toLowerCase().includes(search.toLowerCase()) && club.city === CITIES[cityIndex]
  );

  // Ouvre la modale pour le club sélectionné
  const handleAccess = (club: Club) => {
    setSelectedClub(club);
    setShowModal(true);
    setPassword('');
    setError('');
  };

  // Gestion de la soumission du mot de passe
  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Vérification du mot de passe (à remplacer par une logique backend plus tard)
    if (selectedClub && password === 'club2024') {
      alert(`Bienvenue dans l'espace membre du ${selectedClub.name} !`);
      setShowModal(false);
    } else {
      setError('Mot de passe incorrect');
    }
  };

  // Sauvegarde la ville sélectionnée dans un cookie à chaque changement
  useEffect(() => {
    setCookie('selectedCityIndex', String(cityIndex));
  }, [cityIndex]);

  // On récupère les clubs depuis le backend
  useEffect(() => {
    const fetchClubs = async () => {
      // Simule une récupération de données
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Ici, vous pouvez mettre à jour l'état avec les clubs récupérés
      setLoading(false);
    };
    fetchClubs();
  }, []);

  return (
    <div className="main-container">
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
          {filteredClubs.length === 0 && <div className="no-result">Aucun club trouvé.</div>}
          {filteredClubs.map((club) => (
            <ClubCard key={club.name + club.city} club={club} onAccess={handleAccess} />
          ))}
        </div>
      )}

      {/* Modale d'accès à l'espace membre du club */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <h2>Accès à l'espace membre</h2>
        <form onSubmit={handlePasswordSubmit} className="login-form">
          {selectedClub && (
            <div className="club-info">
              <img src={selectedClub.logo} alt="" className="club-logo" />
            </div>
          )}
          <Input
            password={true}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
            autoFocus
          />
          {error && <div className="error">{error}</div>}
          <div>
            <button type="submit" className="submit-btn">
              Accéder
            </button>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;
