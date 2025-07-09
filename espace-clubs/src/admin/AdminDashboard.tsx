import { useCallback, useEffect, useState } from 'react';
import ApiClient from '../utils/http';
import ClubCard from '../components/ClubCard';
import Loader from '../components/Loader';
import Swal from 'sweetalert2';
import './Admin.css';
import type { Club } from '../utils/types';
import { Input } from '../components/Inputs';
import { useNavigate } from 'react-router';
import { MultiToggle } from '../components/Buttons';
import CreateModal from '../modals/clubs/CreateModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusIndex, setStatusIndex] = useState(0);
  // Modale pour la modification d'un club
  const [showEditModal, setShowEditModal] = useState(false);
  const [clubToEdit, setClubToEdit] = useState<Club | undefined>(undefined);

  const loadClubs = useCallback(() => {
    setLoading(true);
    // Récupère la liste de tous les clubs
    ApiClient.get('/clubs/all')
      .then((res) => {
        // Trie les clubs par clubId décroissant (plus récent d'abord)
        const sortedClubs = res.data.sort((a: Club, b: Club) => b.clubId - a.clubId);
        setClubs(sortedClubs);
      })
      .catch(() =>
        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de charger les clubs.' }).then(() =>
          // Redirige vers la page de connexion si une erreur se produit
          navigate('/admin')
        )
      )
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    loadClubs();
  }, [loadClubs]);

  const handleEnable = (club: Club) => {
    // Active le club
    ApiClient.post(`/clubs/activate`, { clubId: club.clubId })
      .then(() => {
        // Met à jour le club localement pour refléter son activation
        setClubs((prev) => prev.map((c) => (c.clubId === club.clubId ? { ...c, enabled: true } : c)));
        Swal.fire({ icon: 'success', title: 'Succès', text: `Le club "${club.name}" a été activé.` });
      })
      .catch(() => Swal.fire({ icon: 'error', title: 'Erreur', text: "Impossible d'activer le club." }));
  };

  const handleEdit = (club: Club) => {
    // On se connecte en tant qu'administrateur du club
    ApiClient.post('/clubs/admin-login', {
      clubId: club.clubId
    }).catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || error.message
      });
    });
    // Ouvre la modale de modification de club
    setClubToEdit(club);
    setShowEditModal(true);
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
        ApiClient.delete(`/clubs`, { data: { clubId: club.clubId } })
          .then(() => {
            // Met à jour la liste des clubs locale en supprimant le club
            setClubs((prev) => prev.filter((c) => c.clubId !== club.clubId));
            Swal.fire({ icon: 'success', title: 'Succès', text: 'Club supprimé avec succès.' });
          })
          .catch(() => Swal.fire({ icon: 'error', title: 'Erreur', text: 'Suppression impossible.' }));
      }
    });
  };

  const handleAccessAdmin = (club: Club) => {
    // On se connecte en tant qu'administrateur du club
    ApiClient.post('/clubs/admin-login', {
      clubId: club.clubId
    })
      .then(() => {
        navigate('/dashboard', { state: club });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.response?.data?.message || error.message
        });
      });
  };

  // On filtre les clubs selon la recherche et le statut
  // statusIndex: 0 = Tout, 1 = Activés, 2 = Désactivés
  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(search.toLowerCase()) &&
      (statusIndex === 0 || (statusIndex === 1 && club.enabled) || (statusIndex === 2 && !club.enabled))
  );

  return (
    <div className="admin-dashboard-container">
      <h2 className="admin-title">Gestion des clubs</h2>
      <div className="filters">
        <Input
          placeholder="Rechercher un club..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
        <MultiToggle
          options={['Tout', 'Activés', 'Désactivés']}
          selectedIndex={statusIndex}
          onSelect={(index) => setStatusIndex(index)}
        />
      </div>

      {/* Liste des clubs */}
      {loading ? (
        <Loader size={40} />
      ) : (
        <div className="club-list club-grid">
          {filteredClubs.length === 0 && <p className="no-result">Aucun club trouvé.</p>}
          {filteredClubs.map((club) => (
            <ClubCard
              key={club.clubId}
              club={club}
              onAccess={handleAccessAdmin}
              adminMode
              onEnable={handleEnable}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      {/* Modale de création d'un espace membre */}
      <CreateModal
        onClose={() => {
          setShowEditModal(false);
          setClubToEdit(undefined);
          loadClubs(); // Recharge les clubs après modification
        }}
        open={showEditModal}
        clubEdit={clubToEdit}
      />
    </div>
  );
}
