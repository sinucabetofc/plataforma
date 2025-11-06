import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

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
    bio: '',
    active: true,
  });

  // Buscar jogadores
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3001/api/players', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao buscar jogadores');

      const data = await response.json();
      setPlayers(data.data.players || []);
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
        bio: player.bio || '',
        active: player.active,
      });
    } else {
      setEditingPlayer(null);
      setFormData({
        name: '',
        nickname: '',
        photo_url: '',
        bio: '',
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
      const token = localStorage.getItem('admin_token');
      const url = editingPlayer
        ? `http://localhost:3001/api/players/${editingPlayer.id}`
        : 'http://localhost:3001/api/players';

      const method = editingPlayer ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar jogador');
      }

      toast.success(editingPlayer ? 'Jogador atualizado!' : 'Jogador cadastrado!');
      handleCloseModal();
      fetchPlayers();
    } catch (error) {
      console.error('Erro ao salvar jogador:', error);
      toast.error(error.message);
    }
  };

  // Deletar jogador
  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja deletar ${name}?`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:3001/api/players/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao deletar jogador');

      toast.success('Jogador deletado!');
      fetchPlayers();
    } catch (error) {
      console.error('Erro ao deletar jogador:', error);
      toast.error('Erro ao deletar jogador');
    }
  };

  // Filtrar jogadores pela busca
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nickname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <UserCircle className="text-green-500" size={32} />
              Gerenciar Jogadores
            </h1>
            <p className="text-gray-400 mt-1">
              Cadastre e gerencie os jogadores de sinuca
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            <Plus size={20} />
            Novo Jogador
          </button>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar jogador por nome ou apelido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Lista de Jogadores */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Carregando jogadores...</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <UserCircle className="mx-auto text-gray-600" size={64} />
            <p className="text-gray-400 mt-4">Nenhum jogador encontrado</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Cadastrar primeiro jogador
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 transition-colors"
              >
                {/* Foto */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={player.photo_url || 'https://via.placeholder.com/80'}
                    alt={player.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-green-500"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{player.name}</h3>
                    <p className="text-green-500 font-semibold">"{player.nickname}"</p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded ${
                        player.active
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {player.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {player.bio || 'Sem descrição'}
                </p>

                {/* Estatísticas */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="bg-gray-900 rounded p-2">
                    <p className="text-xs text-gray-400">Partidas</p>
                    <p className="text-lg font-bold text-white">{player.total_matches || 0}</p>
                  </div>
                  <div className="bg-gray-900 rounded p-2">
                    <p className="text-xs text-gray-400">Vitórias</p>
                    <p className="text-lg font-bold text-green-500">{player.total_wins || 0}</p>
                  </div>
                  <div className="bg-gray-900 rounded p-2">
                    <p className="text-xs text-gray-400">% Vitória</p>
                    <p className="text-lg font-bold text-blue-500">{player.win_rate || 0}%</p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(player)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(player.id, player.name)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {editingPlayer ? 'Editar Jogador' : 'Novo Jogador'}
              </h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  placeholder="Ex: Baianinho de Mauá"
                />
              </div>

              {/* Apelido */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apelido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  placeholder="Ex: Baianinho"
                />
              </div>

              {/* Upload de Foto */}
              <ImageUpload
                value={formData.photo_url}
                onChange={(url) => setFormData({ ...formData, photo_url: url })}
                label="Foto do Jogador"
              />

              {/* Biografia */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Biografia
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  rows="3"
                  placeholder="Breve descrição sobre o jogador..."
                />
              </div>

              {/* Status Ativo */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-green-500 focus:ring-green-500"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-300">
                  Jogador ativo (disponível para partidas)
                </label>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
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

