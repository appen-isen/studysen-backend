import { useState } from 'react';
import Modal from '../../components/Modal';
import type { Club } from '../../utils/types';
import { Input } from '../../components/Inputs';
import './LoginModal.css';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  selectedClub: Club | null;
};

export default function LoginModal(props: LoginModalProps) {
  const { open, onClose, selectedClub } = props;

  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const closeModal = () => {
    setError('');
    setPassword('');
    onClose();
  };

  // On gère la connexion
  const handleLogin = () => {
    // Vérification du mot de passe (à remplacer par une logique backend plus tard)
    if (selectedClub && password === 'club2024') {
      alert(`Bienvenue dans l'espace membre du ${selectedClub.name} !`);
      closeModal();
    } else {
      setError('Mot de passe incorrect');
    }
  };
  return (
    <Modal open={open} onClose={closeModal}>
      <h2>Accès à l'espace membre</h2>
      <div className="login-modal">
        {selectedClub && (
          <div className="club-info">
            <img src={selectedClub.imageUrl} alt="" className="club-logo" />
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
          <button className="btn submit-btn" onClick={handleLogin}>
            Accéder
          </button>
          <button className="close-btn" onClick={closeModal}>
            Annuler
          </button>
        </div>
      </div>
    </Modal>
  );
}
