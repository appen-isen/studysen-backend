import { FaMapMarkerAlt } from 'react-icons/fa';
import type { PostType } from '../utils/types';
import './Post.css';
import { FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import ApiClient from '../utils/http';

//Composant qui représente un post de club
export function Post(props: { post: PostType; onDelete: (postId: number) => void }) {
  const navigate = useNavigate();
  const { type, date, title, club, description, address, info, imageUri } = props.post;

  //Suppression du post
  const handleDelete = () => {
    Swal.fire({
      title: 'Supprimer le post',

      text: 'Êtes-vous sûr de vouloir supprimer ce post ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        ApiClient.delete(`/posts/`, {
          data: {
            postId: props.post.id
          }
        })
          .then(() => {
            Swal.fire('Supprimé !', 'Le post a été supprimé.', 'success').then(() =>
              props.onDelete(props.post.id)
            );
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur lors de la suppression du post',
              text: error.response?.data?.message || error.message
            });
          });
      }
    });
  };

  const handleEdit = () => {
    navigate(`/post/edit/${props.post.id}`, {
      state: props.post
    });
  };
  return (
    <div className="post">
      <div className="post-header">
        <span className="post-badge">{type === 'event' ? 'ÉVÉNEMENT' : 'POST'}</span>
        <div className="post-text-separator"></div>
        <span className="post-date">{date}</span>
      </div>
      {/* Bannière (environ 400x100) */}
      <div className="post-image-container">
        <img src={imageUri ?? '/empty-image.png'} alt={title} className="post-image" />
      </div>

      <div className="post-title">{title}</div>
      {/* Le club qui a posté */}
      <div className="post-club">
        <img src={club.image} alt={club.name} className="post-club-avatar" />
        <span className="post-club-badge">{club.name}</span>
      </div>
      <div className="post-description">{description}</div>
      {type === 'event' && (
        <>
          {address && (
            <div className="post-address">
              <FaMapMarkerAlt className="post-address-icon" />
              <span>{address}</span>
            </div>
          )}
          <div className="post-infos">
            {info?.startTime && (
              <div className="post-info">
                <span className="post-info-label">DÉBUTE À</span>
                <span className="post-info-value">{info.startTime}</span>
              </div>
            )}
            {info?.price && (
              <div className="post-info">
                <span className="post-info-label">ENTRÉE</span>
                <span className="post-info-value">{info.price}</span>
              </div>
            )}
            {info?.ageLimit && (
              <div className="post-info">
                <span className="post-info-label">AGE MINIMAL</span>
                <span className="post-info-value">{info.ageLimit} ans</span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="post-actions">
        <button className="post-edit-btn" onClick={handleEdit}>
          Modifier
        </button>
        <button className="post-delete-btn" onClick={handleDelete}>
          <FaTrash></FaTrash>
        </button>
      </div>
    </div>
  );
}
