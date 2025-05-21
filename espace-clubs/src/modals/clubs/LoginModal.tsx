import { useState } from 'react';
import Modal from '../../components/Modal';
import type { Club } from '../../utils/types';
import { Input } from '../../components/Inputs';
import './LoginModal.css';
import Swal from 'sweetalert2';
import ApiClient from '../../utils/http';
import { useNavigate } from 'react-router';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  selectedClub: Club | null;
};

export default function LoginModal(props: LoginModalProps) {
  const navigate = useNavigate();
  const { open, onClose, selectedClub } = props;
  const [password, setPassword] = useState('');

  const closeModal = () => {
    setPassword('');
    onClose();
  };

  // On gère la connexion
  const handleLogin = () => {
    //Validation
    let errorMessage = '';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password) === false) {
      errorMessage =
        'Le mot de passe doit avoir au minimum 8 caractères, une minuscule, une majuscule et un chiffre !';
    }
    if (errorMessage) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMessage
      }).then(() => closeModal());
      return;
    }
    ApiClient.post('/clubs/login', {
      password: password,
      clubId: selectedClub?.clubId
    })
      .then(() => {
        closeModal();
        navigate('/dashboard', { state: selectedClub });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.message || error.message
        }).then(() => closeModal());
      });
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
          autoFocus
        />
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
