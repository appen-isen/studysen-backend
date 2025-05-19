import { useState } from 'react';
import Modal from '../../components/Modal';
import { Input } from '../../components/Inputs';
import './LoginModal.css';

type CreateModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateModal(props: CreateModalProps) {
  const { open, onClose } = props;

  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const closeModal = () => {
    setError('');
    setPassword('');
    onClose();
  };

  // On gère la connexion
  const handleCreate = () => {};
  return (
    <Modal open={open} onClose={closeModal}>
      <h2>Créer un espace membre</h2>
      <div className="login-modal">
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
          <button className="btn submit-btn" onClick={handleCreate}>
            Créer
          </button>
          <button className="close-btn" onClick={closeModal}>
            Annuler
          </button>
        </div>
      </div>
    </Modal>
  );
}
