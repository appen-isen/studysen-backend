import { useEffect, useState } from 'react';
import Modal from '../../components/Modal';
import { Input } from '../../components/Inputs';
import { MultiToggle } from '../../components/Buttons';
import { CITIES } from '../../utils/campus';
import { FaImage } from 'react-icons/fa6';
import './LoginModal.css';
import Swal from 'sweetalert2';
import ApiClient from '../../utils/http';
import Loader from '../../components/Loader';
import type { Club } from '../../utils/types';

type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  clubEdit?: Club;
};

export default function CreateModal(props: CreateModalProps) {
  const { open, onClose, clubEdit } = props;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Si on modifie un club, on pré-remplit le nom du club et l'index de la ville
  const [clubName, setClubName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [campusIndex, setCampusIndex] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setLoading] = useState(false);

  const closeModal = () => {
    setTimeout(() => {
      setPassword('');
      setConfirmPassword('');
      setClubName('');
      setContactEmail('');
      setCampusIndex(0);
      setImage(null);
    }, 200);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const uploadImage = async (editMode: boolean) => {
    //On envoie l'image au format multipart
    const formData = new FormData();
    formData.append('image', image!);
    // Si on modifie un club, on ajoute l'ID du club
    if (clubEdit) {
      formData.append('clubId', clubEdit.clubId.toString());
    }

    ApiClient.put(`/clubs/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        if (editMode) {
          closeModal();
          return;
        }
        Swal.fire({
          icon: 'success',
          title: 'Club créé avec succès !',
          text: 'Le club sera vérifié et activé prochainement par un administrateur.'
        }).then(() => {
          closeModal();
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: "Erreur lors de l'envoi de l'image",
          text: error.response?.data?.message || error.message
        }).then(() => closeModal());
      });
  };

  // On gère la connexion
  const handleCreate = () => {
    // Validation des champs
    let errorMessage = '';
    if (clubName.length < 2) {
      errorMessage = 'Veuillez entrer un nom de club valide (plus de 2 caractères)';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errorMessage = 'Veuillez entrer une adresse email valide';
    }
    // Si on modifie un club, on ne demande pas de mot de passe
    if (!clubEdit) {
      if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password) === false) {
        errorMessage =
          'Le mot de passe doit avoir au minimum 8 caractères, une minuscule, une majuscule et un chiffre !';
      } else if (password !== confirmPassword) {
        errorMessage = 'Les mots de passe ne correspondent pas';
      } else if (!image) {
        errorMessage = 'Veuillez ajouter une image de club';
      }
    }
    if (errorMessage) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMessage
      });
      return;
    }
    setLoading(true);

    if (clubEdit === undefined) {
      //En mode création, on envoie la requête de création de club
      ApiClient.post('/clubs/create', {
        name: clubName,
        contactEmail,
        password,
        campusId: campusIndex + 1
      })
        .then((response) => {
          setLoading(false);
          if (response.status === 201) {
            uploadImage(false);
          }
        })
        .catch((error) => {
          setLoading(false);
          // Too many requests
          if (error.response?.status === 429) {
            Swal.fire({
              icon: 'error',
              title: 'Trop de demandes',
              text: 'Vous avez envoyé trop de demandes. Veuillez réessayer plus tard.'
            });
            return;
          }
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.response?.data?.message || error.message
          }).then(() => closeModal());
        });
    } else {
      // Mode modification
      ApiClient.put('/clubs/edit', {
        clubId: clubEdit.clubId,
        name: clubName,
        contactEmail,
        password,
        campusId: campusIndex + 1
      })
        .then((response) => {
          setLoading(false);
          if (response.status === 200) {
            if (image) {
              uploadImage(true);
            } else {
              Swal.fire({
                icon: 'success',
                title: 'Club modifié avec succès !'
              }).then(() => {
                closeModal();
              });
            }
          }
        })
        .catch((error) => {
          setLoading(false);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.response?.data?.message || error.message
          }).then(() => closeModal());
        });
    }
  };

  //On pré-remplit les champs si on modifie un club
  useEffect(() => {
    if (clubEdit) {
      setClubName(clubEdit.name);
      setContactEmail(clubEdit.contactEmail);
      setCampusIndex(clubEdit.campusId - 1);
    }
  }, [clubEdit]);

  return (
    <Modal open={open} onClose={closeModal}>
      <h2>Créer un espace membre</h2>
      <div className="login-modal">
        <Input
          placeholder="Nom du club"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
          autoFocus
        />
        <Input
          placeholder="Adresse email de contact"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          type="email"
        />
        <Input
          password={true}
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          password={true}
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <MultiToggle options={CITIES} selectedIndex={campusIndex} onSelect={setCampusIndex} />
        <div className="image-upload-container">
          {image ? (
            <label className="image-upload-label" style={{ padding: 0, background: 'none', border: 'none' }}>
              <img
                src={URL.createObjectURL(image)}
                alt="aperçu"
                className="image-preview"
                style={{ cursor: 'pointer' }}
              />
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </label>
          ) : (
            <label className="image-upload-label">
              <FaImage size={28} />
              <span>Ajouter une image</span>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div>
          <button className="btn submit-btn" onClick={handleCreate}>
            {isLoading ? <Loader size={10} color="#fff" /> : clubEdit ? 'Modifier' : 'Créer'}
          </button>
          <button className="close-btn" onClick={closeModal}>
            Annuler
          </button>
        </div>
      </div>
    </Modal>
  );
}
