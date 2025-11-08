import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import InfluencerForm from '../components/InfluencerForm';
import { 
  useInfluencers, 
  useCreateInfluencer, 
  useUpdateInfluencer, 
  useDeleteInfluencer 
} from '../hooks/useInfluencers';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';

function InfluencersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  // Query params
  const filters = {
    search: searchTerm || undefined,
    is_active: filterActive === 'all' ? undefined : filterActive === 'active',
    limit: 50
  };

  const { data, isLoading, error } = useInfluencers(filters);
  const createMutation = useCreateInfluencer();
  const updateMutation = useUpdateInfluencer();
  const deleteMutation = useDeleteInfluencer();

  const handleCreate = () => {
    setEditingInfluencer(null);
    setShowForm(true);
  };

  const handleEdit = (influencer) => {
    setEditingInfluencer(influencer);
    setShowForm(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingInfluencer) {
        await updateMutation.mutateAsync({
          id: editingInfluencer.id,
          data: formData
        });
        alert('Influencer atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync(formData);
        alert('Influencer criado com sucesso!');
      }
      setShowForm(false);
      setEditingInfluencer(null);
    } catch (error) {
      console.error('Erro:', error);
      alert(error.response?.data?.message || 'Erro ao salvar influencer');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja desativar ${name}?`)) return;

    try {
      await deleteMutation.mutateAsync({ id, permanent: false });
      alert('Influencer desativado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert(error.response?.data?.message || 'Erro ao desativar influencer');
    }
  };

  const handleToggleActive = async (influencer) => {
    try {
      await updateMutation.mutateAsync({
        id: influencer.id,
        data: { is_active: !influencer.is_active }
      });
      alert(`Influencer ${!influencer.is_active ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao alterar status');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Influencers / Parceiros</h1>
            <p className="text-gray-400">
              Gerencie os influencers que transmitem jogos e recebem comissões
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Influencer
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterActive === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterActive('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterActive === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Ativos
              </button>
              <button
                onClick={() => setFilterActive('inactive')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterActive === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Inativos
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-white text-center py-8">Carregando influencers...</div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            Erro ao carregar influencers: {error.message}
          </div>
        )}

        {/* Table */}
        {data?.data && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Comissão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Estatísticas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.data.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                        Nenhum influencer encontrado
                      </td>
                    </tr>
                  ) : (
                    data.data.map((influencer) => (
                      <tr key={influencer.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {influencer.photo_url ? (
                              <img
                                src={influencer.photo_url}
                                alt={influencer.name}
                                className="h-10 w-10 rounded-full mr-3 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-600 mr-3 flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {influencer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="text-sm font-medium text-white">
                              {influencer.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {influencer.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {influencer.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {influencer.commission_percentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(influencer)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              influencer.is_active
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-red-900/30 text-red-400'
                            }`}
                          >
                            {influencer.is_active ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inativo
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {influencer.stats ? (
                            <div className="text-xs">
                              <div>{influencer.stats.total_matches} jogos</div>
                              <div className="text-green-400">
                                R$ {influencer.stats.total_commissions?.toFixed(2) || '0.00'}
                              </div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(influencer)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Editar"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(influencer.id, influencer.name)}
                              className="text-red-400 hover:text-red-300"
                              title="Desativar"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            {data?.pagination && (
              <div className="bg-gray-900 px-6 py-3 text-sm text-gray-400">
                Total: {data.pagination.total} influencer(s)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <InfluencerForm
          influencer={editingInfluencer}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingInfluencer(null);
          }}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}
    </Layout>
  );
}

export default function InfluencersPageWrapper() {
  return (
    <ProtectedRoute>
      <InfluencersPage />
    </ProtectedRoute>
  );
}

