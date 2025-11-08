import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useInfluencers } from '../hooks/useInfluencers';

export default function MatchForm({ match, players, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    player1_id: '',
    player2_id: '',
    scheduled_at: '',
    location: '',
    sport: 'sinuca',
    youtube_url: '',
    total_series: 1,
    game_rules: '',
    influencer_id: '',
    influencer_commission: ''
  });

  // Buscar influencers ativos
  const { data: influencersData } = useInfluencers({ is_active: true, limit: 100 });
  const influencers = influencersData?.data || [];

  useEffect(() => {
    if (match) {
      setFormData({
        player1_id: match.player1_id || '',
        player2_id: match.player2_id || '',
        scheduled_at: match.scheduled_at ? new Date(match.scheduled_at).toISOString().slice(0, 16) : '',
        location: match.location || '',
        sport: match.sport || 'sinuca',
        youtube_url: match.youtube_url || '',
        total_series: match.total_series || 1,
        game_rules: match.game_rules || '',
        influencer_id: match.influencer_id || '',
        influencer_commission: match.influencer_commission || ''
      });
    }
  }, [match]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Quando seleciona um influencer, preencher a comissão padrão dele
  const handleInfluencerChange = (e) => {
    const influencerId = e.target.value;
    setFormData(prev => ({
      ...prev,
      influencer_id: influencerId
    }));

    if (influencerId) {
      const selectedInfluencer = influencers.find(inf => inf.id === influencerId);
      if (selectedInfluencer && !formData.influencer_commission) {
        setFormData(prev => ({
          ...prev,
          influencer_commission: selectedInfluencer.commission_percentage
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      total_series: parseInt(formData.total_series),
      influencer_commission: formData.influencer_commission ? parseFloat(formData.influencer_commission) : null,
      influencer_id: formData.influencer_id || null
    };
    
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {match ? 'Editar Partida' : 'Nova Partida'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Jogadores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Jogadores</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Jogador 1 *
                </label>
                <select
                  name="player1_id"
                  value={formData.player1_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {players?.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.nickname || player.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Jogador 2 *
                </label>
                <select
                  name="player2_id"
                  value={formData.player2_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {players?.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.nickname || player.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Informações da Partida */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white">Informações da Partida</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                name="scheduled_at"
                value={formData.scheduled_at}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Local
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: Clube X"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Número de Séries *
                </label>
                <input
                  type="number"
                  name="total_series"
                  value={formData.total_series}
                  onChange={handleChange}
                  required
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                URL YouTube/Stream
              </label>
              <input
                type="url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Regras do Jogo
              </label>
              <textarea
                name="game_rules"
                value={formData.game_rules}
                onChange={handleChange}
                rows="3"
                placeholder="Descreva as regras..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Influencer / Parceiro */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white">Influencer / Parceiro</h3>
            <p className="text-sm text-gray-400">
              Selecione o influencer que irá transmitir este jogo (opcional)
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Influencer
              </label>
              <select
                name="influencer_id"
                value={formData.influencer_id}
                onChange={handleInfluencerChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Nenhum influencer</option>
                {influencers.map(influencer => (
                  <option key={influencer.id} value={influencer.id}>
                    {influencer.name} ({influencer.commission_percentage}%)
                  </option>
                ))}
              </select>
            </div>

            {formData.influencer_id && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Comissão para este jogo (%)
                </label>
                <input
                  type="number"
                  name="influencer_commission"
                  value={formData.influencer_commission}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Deixe em branco para usar a comissão padrão do influencer
                </p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : match ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

