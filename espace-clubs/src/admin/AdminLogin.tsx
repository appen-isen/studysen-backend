import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import ApiClient from '../utils/http';
import { Input } from '../components/Inputs';
import './Admin.css';
import Loader from '../components/Loader';

export default function AdminLogin() {
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Veuillez entrer la clé administrateur.' });
      return;
    }
    // On se connecte en tant qu'administrateur grâce à la clé
    setLoading(true);
    ApiClient.post('/admin/login', {
      key: adminKey
    })
      .then(() => {
        navigate('/admin/dashboard');
      })
      .catch((err) => {
        // If too many requests
        if (err?.response?.status === 429) {
          Swal.fire({
            icon: 'error',
            title: 'Trop de demandes',
            text: 'Vous avez envoyé trop de demandes. Veuillez réessayer plus tard.'
          });
          return;
        }
        Swal.fire({
          icon: 'error',
          title: 'Clé invalide',
          text: err?.response?.data?.message || 'Clé incorrecte.'
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // On vérifie si l'utilisateur est déjà connecté
  useEffect(() => {
    ApiClient.get('/admin/verify').then(() => {
      navigate('/admin/dashboard');
    });
  }, [navigate]);

  return (
    <div className="admin-container">
      <h2 className="admin-title">Connexion administrateur</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <Input
          password
          placeholder="Clé administrateur"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          required
        />
        <button className="btn submit-btn" type="submit">
          {loading ? <Loader size={15} color="#fff" /> : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
