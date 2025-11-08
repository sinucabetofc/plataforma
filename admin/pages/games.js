import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import MatchForm from '../components/MatchForm';
import { useMatches, useCreateMatch, useUpdateMatch, useDeleteMatch } from '../hooks/useMatches';
import { usePlayers } from '../hooks/usePlayers';
import { Plus, Edit2, Trash2, Calendar, MapPin, Users as UsersIcon, Star } from 'lucide-react';

function GamesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filters = {
    status: filterStatus === 'all' ? undefined : filterStatus,
    limit: 50
  };

  const { data: matchesData, isLoading, error } = useMatches(filters);
  const { data: playersData } = usePlayers({ limit: 100 });
  const createMutation = useCreateMatch();
  const updateMutation = useUpdateMatch();
  const deleteMutation = useDeleteMatch();

  const matches = matchesData?.data || [];
  const players = playersData?.data || [];

  const handleCreate = () => {
    setEditingMatch(null);
    setShowForm(true);
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingMatch) {
        await updateMutation.mutateAsync({
          id: editingMatch.id,
          data: formData
        });
        alert('Partida atualizada com sucesso!');
      } else {
        await createMutation.mutateAsync(formData);
        alert('Partida criada com sucesso!');
      }
      setShowForm(false);
      setEditingMatch(null);
    } catch (error) {
      console.error('Erro:', error);
      alert(error.response?.data?.message || 'Erro ao salvar partida');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta partida?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      alert('Partida deletada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert(error.response?.data?.message || 'Erro ao deletar partida');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      agendada: { color: 'bg-yellow-900/30 text-yellow-400', label: 'Agendada' },
      em_andamento: { color: 'bg-green-900/30 text-green-400', label: 'Em Andamento' },
      finalizada: { color: 'bg-blue-900/30 text-blue-400', label: 'Finalizada' },
      cancelada: { color: 'bg-red-900/30 text-red-400', label: 'Cancelada' }
    };

    const badge = badges[status] || badges.agendada;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Partidas</h1>
            <p className="text-gray-400">
              Gerencie as partidas de sinuca e associe influencers
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Partida
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterStatus('agendada')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'agendada'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Agendadas
            </button>
            <button
              onClick={() => setFilterStatus('em_andamento')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'em_andamento'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Em Andamento
            </button>
            <button
              onClick={() => setFilterStatus('finalizada')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'finalizada'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Finalizadas
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-white text-center py-8">Carregando partidas...</div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            Erro ao carregar partidas: {error.message}
          </div>
        )}

        {/* Matches Grid */}
        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors"
              >
                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(match.status)}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(match)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(match.id)}
                      className="text-red-400 hover:text-red-300"
                      title="Deletar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Players */}
                <div className="mb-4">
                  <div className="flex items-center text-white mb-2">
                    <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-semibold">Jogadores</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    <div>{match.player1?.nickname || match.player1?.name || 'Jogador 1'}</div>
                    <div className="text-gray-500 my-1">vs</div>
                    <div>{match.player2?.nickname || match.player2?.name || 'Jogador 2'}</div>
                  </div>
                </div>

                {/* Date & Location */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(match.scheduled_at).toLocaleString('pt-BR')}
                  </div>
                  {match.location && (
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {match.location}
                    </div>
                  )}
                </div>

                {/* Influencer */}
                {match.influencer_id && (
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex items-center text-yellow-400 text-sm">
                      <Star className="h-4 w-4 mr-2" />
                      <span>Com influencer</span>
                    </div>
                  </div>
                )}

                {/* Score (if in progress or finished) */}
                {(match.status === 'em_andamento' || match.status === 'finalizada') && (
                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-center text-2xl font-bold text-white">
                      {match.player1_score || 0} - {match.player2_score || 0}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <p className="text-gray-400">Nenhuma partida encontrada</p>
            </div>
          )
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <MatchForm
          match={editingMatch}
          players={players}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingMatch(null);
          }}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}
    </Layout>
  );
}

export default function GamesPageWrapper() {
  return (
    <ProtectedRoute>
      <GamesPage />
    </ProtectedRoute>
  );
}
