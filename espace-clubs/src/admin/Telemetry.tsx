import { useCallback, useEffect, useState } from 'react';
import ApiClient from '../utils/http';
import Loader from '../components/Loader';
import Swal from 'sweetalert2';
import './Admin.css';
import { Input } from '../components/Inputs';
import { useNavigate } from 'react-router';

type TelemetryData = {
  id: number;
  type: string;
  data: string;
  created_at?: string;
};

export default function Telemetry() {
  const navigate = useNavigate();
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [filteredData, setFilteredData] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  const loadTelemetryData = useCallback(() => {
    setLoading(true);
    // Récupère toutes les données de télémétrie
    ApiClient.get('/telemetry')
      .then((res) => {
        const data = res.data.sort((a: TelemetryData, b: TelemetryData) => b.id - a.id);
        setTelemetryData(data);

        // Extrait les types uniques pour le filtre
        const types = [...new Set(data.map((item: TelemetryData) => item.type))] as string[];
        setAvailableTypes(types);
      })
      .catch(() =>
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les données de télémétrie.'
        }).then(() => navigate('/admin'))
      )
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    loadTelemetryData();
  }, [loadTelemetryData]);

  // Filtre les données en fonction de la recherche et du type sélectionné
  useEffect(() => {
    let filtered = telemetryData;

    // Filtre par type
    if (selectedType) {
      filtered = filtered.filter((item) => item.type === selectedType);
    }

    // Filtre par recherche dans les données
    if (search.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.data.toLowerCase().includes(search.toLowerCase()) ||
          item.type.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [telemetryData, search, selectedType]);

  const handleSelectItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map((item) => item.id));
    }
  };

  const handleDelete = async (ids: number[]) => {
    if (ids.length === 0) return;

    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      text: `Êtes-vous sûr de vouloir supprimer ${ids.length} élément(s) ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await ApiClient.delete('/telemetry', { data: { ids } });

        // Met à jour les données localement
        setTelemetryData((prev) => prev.filter((item) => !ids.includes(item.id)));
        setSelectedIds([]);

        Swal.fire({
          icon: 'success',
          title: 'Supprimé',
          text: `${ids.length} élément(s) supprimé(s) avec succès.`
        });
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de supprimer les éléments sélectionnés.'
        });
      }
    }
  };

  const handleDeleteSelected = () => {
    handleDelete(selectedIds);
  };

  const handleDeleteSingle = (id: number) => {
    handleDelete([id]);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-title">Gestion de la télémétrie</h1>

      <div className="filters">
        <Input
          id="search"
          type="text"
          placeholder="Rechercher par nom ou type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="filter-select"
        >
          <option value="">Tous les types</option>
          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {selectedIds.length > 0 && (
          <button onClick={handleDeleteSelected} className="bulk-delete-btn">
            Supprimer la sélection ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="stats-text">
        <span>{filteredData.length} résultat(s)</span>
        <span>{selectedIds.length} sélectionné(s)</span>
      </div>

      {filteredData.length === 0 ? (
        <div className="no-result">
          <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem', margin: '2rem 0' }}>
            Aucune donnée de télémétrie trouvée.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="telemetry-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Sélectionner tout
                </th>
                <th>ID</th>
                <th>Type</th>
                <th>Données</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className={selectedIds.includes(item.id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </td>
                  <td style={{ fontWeight: '500' }}>#{item.id}</td>
                  <td>
                    <span className="type-badge">{item.type}</span>
                  </td>
                  <td
                    style={{
                      maxWidth: '300px',
                      wordBreak: 'break-word'
                    }}
                  >
                    {item.data}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDeleteSingle(item.id)} className="delete-btn">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
