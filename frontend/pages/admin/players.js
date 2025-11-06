import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../../components/admin/ImageUpload';
import { get, post, patch, del } from '../../utils/api';

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    photo_url: '',
    active: true,
  });

  // Buscar jogadores
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await get('/players');
      setPlayers(response.data.players || []);
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
      toast.error('Erro ao carregar jogadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Abrir modal para criar/editar
  const handleOpenModal = (player = null) => {
    if (player) {
      setEditingPlayer(player);
      setFormData({
        name: player.name,
        nickname: player.nickname,
        photo_url: player.photo_url || '',
        active: player.active,
      });
    } else {
      setEditingPlayer(null);
      setFormData({
        name: '',
        nickname: '',
        photo_url: '',
        active: true,
      });
    }
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlayer(null);
    setFormData({
      name: '',
      nickname: '',
      photo_url: '',
      bio: '',
      active: true,
    });
  };

  // Salvar jogador (criar ou editar)
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (editingPlayer) {
        await patch(`/players/${editingPlayer.id}`, formData);
        toast.success('Jogador atualizado!');
      } else {
        await post('/players', formData);
        toast.success('Jogador cadastrado!');
      }

      handleCloseModal();
      fetchPlayers();
    } catch (error) {
      console.error('Erro ao salvar jogador:', error);
      toast.error(error.message || 'Erro ao salvar jogador');
    }
  };

  // Deletar jogador
  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja deletar ${name}?`)) return;

    try {
      await del(`/players/${id}`);
      toast.success('Jogador deletado!');
      fetchPlayers();
    } catch (error) {
      console.error('Erro ao deletar jogador:', error);
      toast.error(error.message || 'Erro ao deletar jogador');
    }
  };

  // Filtrar jogadores pela busca
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-admin-text-primary flex items-center gap-2">
            <UserCircle className="text-admin-green" size={32} />
            Gerenciar Jogadores
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Cadastre e gerencie os jogadores de sinuca
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-admin-green text-admin-black rounded-lg hover:brightness-110 transition-all font-semibold"
        >
          <Plus size={20} />
          Novo Jogador
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-admin-text-muted" size={20} />
        <input
          type="text"
          placeholder="Buscar jogador por nome ou apelido..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-admin-gray-dark border border-admin-gray-light rounded-lg text-admin-text-primary placeholder-admin-text-muted focus:outline-none focus:border-admin-green"
        />
      </div>

      {/* Lista de Jogadores */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-admin-green border-t-transparent rounded-full animate-spin"></div>
          <p className="text-admin-text-secondary mt-4">Carregando jogadores...</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-12 bg-admin-gray-dark rounded-lg border border-admin-gray-light">
          <UserCircle className="mx-auto text-admin-text-muted" size={64} />
          <p className="text-admin-text-secondary mt-4">Nenhum jogador encontrado</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 bg-admin-green text-admin-black rounded-lg hover:brightness-110 transition-all font-medium"
          >
            Cadastrar primeiro jogador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-admin-gray-dark border border-admin-gray-light rounded-lg p-6 hover:border-admin-green transition-colors"
            >
              {/* Foto */}
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={player.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name) + '&size=80&background=27E502&color=000'}
                  alt={player.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-admin-green"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(player.name) + '&size=80&background=27E502&color=000';
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-admin-text-primary">{player.name}</h3>
                  <p className="text-admin-green font-semibold">"{player.nickname}"</p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded ${
                      player.active
                        ? 'bg-status-success/20 text-status-success'
                        : 'bg-status-error/20 text-status-error'
                    }`}
                  >
                    {player.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-admin-text-secondary text-sm mb-4 line-clamp-2">
                {player.bio || 'Sem descrição'}
              </p>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-admin-gray-medium rounded p-2">
                  <p className="text-xs text-admin-text-muted">Partidas</p>
                  <p className="text-lg font-bold text-admin-text-primary">{player.total_matches || 0}</p>
                </div>
                <div className="bg-admin-gray-medium rounded p-2">
                  <p className="text-xs text-admin-text-muted">Vitórias</p>
                  <p className="text-lg font-bold text-status-success">{player.total_wins || 0}</p>
                </div>
                <div className="bg-admin-gray-medium rounded p-2">
                  <p className="text-xs text-admin-text-muted">% Vitória</p>
                  <p className="text-lg font-bold text-admin-green">{player.win_rate || 0}%</p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(player)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-admin-green/20 text-admin-green rounded hover:bg-admin-green/30 transition-colors"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(player.id, player.name)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-status-error/20 text-status-error rounded hover:bg-status-error/30 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-admin-gray-dark rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-black">
            <div className="p-6 border-b border-black">
              <h2 className="text-2xl font-bold text-admin-text-primary">
                {editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}
              </h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-medium text-admin-text-primary mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-admin-gray-medium border border-black rounded-lg text-admin-text-primary focus:outline-none focus:border-admin-green"
                  placeholder="Ex: Baianinho de Mauá"
                />
              </div>

              {/* Apelido */}
              <div>
                <label className="block text-sm font-medium text-admin-text-primary mb-2">
                  Apelido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-4 py-2 bg-admin-gray-medium border border-black rounded-lg text-admin-text-primary focus:outline-none focus:border-admin-green"
                  placeholder="Ex: Baianinho"
                />
              </div>

              {/* Upload de Foto */}
              <ImageUpload
                value={formData.photo_url}
                onChange={(url) => setFormData({ ...formData, photo_url: url })}
                label="Foto do Jogador"
              />

              {/* Status Ativo */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 rounded border-black bg-admin-gray-medium text-admin-green focus:ring-admin-green"
                />
                <label htmlFor="active" className="text-sm font-medium text-admin-text-primary">
                  Jogador ativo (disponível para partidas)
                </label>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-admin-gray-medium text-admin-text-primary rounded-lg hover:bg-admin-gray-light transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-admin-green text-admin-black rounded-lg hover:brightness-110 transition-all font-semibold"
                >
                  {editingPlayer ? 'Salvar Alterações' : 'Cadastrar Jogador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

