import { useState, useEffect } from 'react';
import './PostForm.css';
import { Input } from './Inputs';
import { MultiToggle } from './Buttons';
import { FaArrowLeft, FaImage } from 'react-icons/fa6';
import { useNavigate, useLocation } from 'react-router';
import type { PostType } from '../utils/types';
import Swal from 'sweetalert2';
import ApiClient from '../utils/http';

const POST_TYPES = [
  { label: 'Événement', value: 'event' },
  { label: 'Post', value: 'post' }
];

export type PostFormProps = {
  mode?: 'create' | 'edit';
};

export default function PostForm({ mode = 'create' }: PostFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const post = mode === 'edit' ? (location.state as PostType | undefined) : undefined;

  const [typeIndex, setTypeIndex] = useState(post ? (post.type === 'event' ? 0 : 1) : 0);
  const [title, setTitle] = useState(post?.title || '');
  const [description, setDescription] = useState(post?.description || '');
  const [date, setDate] = useState(post?.date || '');
  const [address, setAddress] = useState(post?.address || '');
  const [startTime, setStartTime] = useState(post?.info?.startTime || '');
  const [link, setLink] = useState(post?.link || '');
  const [price, setPrice] = useState(post?.info?.price || '');
  const [ageLimit, setAgeLimit] = useState(post?.info?.ageLimit || '');
  const [imagePreview, setImagePreview] = useState<string | undefined>(post?.imageUri);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (mode === 'edit' && post) {
      setTypeIndex(post.type === 'event' ? 0 : 1);
      setTitle(post.title || '');
      setDescription(post.description || '');
      if (post.date) {
        const [day, month, year] = post.date.split('/');
        setDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      } else {
        setDate('');
      }
      setAddress(post.address || '');
      setStartTime(post.info?.startTime || '');
      setPrice(post.info?.price || '');
      setAgeLimit(post.info?.ageLimit || '');
      setImagePreview(post.imageUri);
      setImage(null);
    }
  }, [mode, post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation des champs obligatoires
    if (!title.trim()) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Le titre est obligatoire.' });
      return;
    }
    if (!description.trim()) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'La description est obligatoire.' });
      return;
    }
    if (typeIndex === 0) {
      if (!date) {
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'La date est obligatoire.' });
        return;
      }
      if (!startTime) {
        Swal.fire({ icon: 'error', title: 'Erreur', text: "L'heure de début est obligatoire." });
        return;
      }
      if (ageLimit && isNaN(Number(ageLimit))) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: "L'âge minimal doit être un nombre (ex: 18) ou vide."
        });
        return;
      }
    }

    ApiClient.post('/posts', {
      type: typeIndex === 0 ? 'event' : 'post',
      title,
      description,
      date: typeIndex === 0 ? date : new Date().toISOString().split('T')[0],
      link,
      location: address,
      info: {
        startTime: startTime,
        price: price,
        ageLimit: ageLimit
      }
    })
      .then((response) => {
        if (response.data.id) {
          //On envoie l'image au format multipart
          const formData = new FormData();
          formData.append('image', image!);
          formData.append('postId', response.data.id);

          ApiClient.put(`/clubs/image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
            .then(() => {
              Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Le post a été créé avec succès.'
              });
            })
            .catch((error) => {
              Swal.fire({
                icon: 'error',
                title: "Erreur lors de l'envoi de l'image",
                text: error.response?.data?.message || error.message
              });
            });
        }
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur lors de la suppression du post',
          text: error.response?.data?.message || error.message
        });
      });
  };

  return (
    <div className="postform-container">
      <FaArrowLeft className="back-icon" onClick={() => navigate(-1)} />
      <h2>{mode === 'edit' ? 'Modifier le post' : 'Créer un post'}</h2>
      <div className="postform-banner-upload">
        <label className="postform-banner-label">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="aperçu"
              className="postform-banner-preview"
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <div className="postform-banner-placeholder">
              <FaImage size={32} />
              <span>Ajouter une bannière</span>
            </div>
          )}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
        </label>
        <p className="postform-tip">Format de bannière recommandé : 400 x 100 px</p>
      </div>
      <div className="postform-row">
        <MultiToggle
          options={POST_TYPES.map((t) => t.label)}
          selectedIndex={typeIndex}
          onSelect={setTypeIndex}
        />
      </div>
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Titre du post"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="postform-textarea"
          placeholder="Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          required
        />
        <Input placeholder="Lien (optionnel)" value={link} onChange={(e) => setLink(e.target.value)} />
        {typeIndex === 0 && (
          <>
            <div className="postform-row postform-row-labels">
              <div className="postform-label-group">
                <label htmlFor="date-native" className="postform-label">
                  Date de l'événement
                </label>
                <input
                  id="date-native"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  className="postform-date-input"
                  required
                />
              </div>
              <div className="postform-label-group">
                <label htmlFor="time-native" className="postform-label">
                  Heure de début
                </label>
                <input
                  id="time-native"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker()}
                  className="postform-date-input"
                  required
                />
              </div>
            </div>
            <Input
              placeholder="Adresse (optionnelle)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="postform-row">
              <Input
                placeholder="Prix (ex: Gratuit, 5€...)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <Input
                placeholder="Âge minimal (ex: 18)"
                value={ageLimit}
                onChange={(e) => setAgeLimit(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="postform-actions">
          <button className="btn submit-btn" type="submit">
            {mode === 'edit' ? 'Enregistrer' : 'Publier'}
          </button>
        </div>
      </form>
    </div>
  );
}
