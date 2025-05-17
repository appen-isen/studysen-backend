import { useState } from 'react';
import './App.css';
import ClubCard from './components/ClubCard';
import type { Club } from './components/ClubCard';

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

const CITIES = ['Nantes', 'Brest', 'Caen', 'Rennes', 'Paris'];

function App() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const filteredClubs = CLUBS.filter(
    (club) => club.name.toLowerCase().includes(search.toLowerCase()) && (city === '' || club.city === city)
  );

  const handleAccess = (club: Club) => {
    setSelectedClub(club);
    setShowModal(true);
    setPassword('');
    setError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedClub && password === 'club2024') {
      alert(`Bienvenue dans l'espace membre du ${selectedClub.name} !`);
      setShowModal(false);
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div className="main-container">
      <h1 className="title">Sélectionnez votre club</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher un club..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <select value={city} onChange={(e) => setCity(e.target.value)} className="city-filter">
          <option value="">Toutes les villes</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="club-list club-grid">
        {filteredClubs.length === 0 && <div className="no-result">Aucun club trouvé.</div>}
        {filteredClubs.map((club) => (
          <ClubCard key={club.name + club.city} club={club} onAccess={handleAccess} />
        ))}
      </div>
      {showModal && selectedClub && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Accès à l'espace membre</h2>
            <p>
              Club : <b>{selectedClub.name}</b>
            </p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input"
                autoFocus
              />
              {error && <div className="error">{error}</div>}
              <button type="submit" className="submit-btn">
                Accéder
              </button>
            </form>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
