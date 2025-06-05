import { useEffect, useState } from 'react';
import ApiClient from '../utils/http';
import ClubCard from '../components/ClubCard';
import Loader from '../components/Loader';
import Swal from 'sweetalert2';
import './Admin.css';
import type { Club } from '../utils/types';

export default function AdminDashboard() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Récupère la liste de tous les clubs
    ApiClient.get('/clubs/all')
      .then((res) => setClubs(res.data))
      .catch(() => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger les clubs.' }))
      .finally(() => setLoading(false));
  }, []);

  const handleEnable = (club: Club) => {
    // Active le club
    ApiClient.post(`/clubs/activate`, { clubId: club.clubId })
      .then(() => {
        setClubs((prev) => prev.map((c) => (c.clubId === club.clubId ? { ...c, enabled: true } : c)));
      })
      .catch(() => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Action impossible.' }));
  };

  const handleEdit = (club: Club) => {
    // Redirige vers la page de modification du club (à implémenter)
    Swal.fire('Fonction à implémenter', '', 'info');
  };

  const handleDelete = (club: Club) => {
    // Confirme la suppression du club
    Swal.fire({
      title: 'Supprimer le club',
      text: `Êtes-vous sûr de vouloir supprimer le club "${club.name}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        ApiClient.delete(`/clubs/${club.clubId}`)
          .then(() => setClubs((prev) => prev.filter((c) => c.clubId !== club.clubId)))
          .catch(() => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Suppression impossible.' }));
      }
    });
  };

  return (
    <div className="admin-dashboard-container">
      <h2 className="admin-title">Gestion des clubs</h2>
      {loading ? (
        <Loader size={40} />
      ) : (
        <div className="club-list club-grid">
          {clubs.length === 0 && <p className="no-result">Aucun club trouvé.</p>}
          {clubs.map((club) => (
            <ClubCard
              key={club.clubId}
              club={club}
              onAccess={() => {}}
              adminMode
              onEnable={handleEnable}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
