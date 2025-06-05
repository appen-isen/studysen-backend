import { FaArrowRightFromBracket } from 'react-icons/fa6';
import './Dashboard.css';
import { useLocation, useNavigate } from 'react-router';
import type { PostType, Club } from './utils/types';
import ApiClient from './utils/http';
import { useEffect, useState } from 'react';
import { removeCookie } from './utils/cookies';
import { Post } from './components/Post';
import Loader from './components/Loader';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const club: Club = location.state;

  const handleLogout = () => {
    Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, déconnecter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        removeCookie('autoConnect');
        ApiClient.post('/clubs/logout').finally(() => navigate('/'));
      }
    });
  };

  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  useEffect(() => {
    if (club === null || club === undefined) {
      navigate('/');
    } else {
      //On charge les posts depuis le backend
      ApiClient.get(`/posts/club/${club.clubId}`)
        .then((response) => {
          setPosts(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Erreur lors du chargement des posts:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [club, navigate]);

  // On trie les posts par id décroissant
  posts.sort((a, b) => b.id - a.id);

  return (
    <div className="dashboard-container">
      {/* En tête de la page */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <img src={club.imageUrl} alt="avatar" className="avatar" />
          <h3>{club.name}</h3>
          <FaArrowRightFromBracket className="logout" onClick={handleLogout} />
        </div>
        <button className="btn" onClick={() => navigate('/post/new')}>
          Nouveau post
        </button>
      </div>
      <h1>Vos posts</h1>
      {/* Les posts du clubs  */}
      {isLoading && <Loader size={50} />}
      {!isLoading && (
        <>
          <div className="posts-list">
            {posts.map((post, index) => (
              <Post key={'post' + index} post={post} onDelete={handleDeletePost} />
            ))}
          </div>
          {posts.length === 0 && (
            <div className="no-posts">
              <p>
                Vous n'avez pas encore créé de post. Cliquez sur le bouton "Nouveau post" pour en créer un.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
