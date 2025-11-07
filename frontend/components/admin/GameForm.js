/**
 * ============================================================
 * GameForm Component - Form para Criar/Editar Jogo
 * ============================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { X, UserCircle } from 'lucide-react';
import { get } from '../../utils/api';
import toast from 'react-hot-toast';

const GAME_TYPES = [
  { value: 'LISA', label: 'Bolas Lisas' },
  { value: 'NUMERADA', label: 'Bolas Numeradas' },
];

export default function GameForm({ onSubmit, onCancel, initialData = null, isLoading = false }) {
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  
  // Processar advantages: converter string para array se necessário
  const processAdvantages = () => {
    const adv = initialData?.game_rules?.advantages;
    if (!adv) return [''];
    if (Array.isArray(adv)) return adv.length > 0 ? adv : [''];
    return [adv]; // String única vira array de 1 elemento
  };

  const [formData, setFormData] = useState({
    player1_id: initialData?.player1?.id || '',
    player2_id: initialData?.player2?.id || '',
    sport: initialData?.sport || 'sinuca',
    scheduled_at: initialData?.scheduled_at || '',
    location: initialData?.location || 'Brasil',
    game_type: initialData?.game_rules?.game_type || 'LISA',
    advantages: processAdvantages(),
    total_series: initialData?.total_series || 1,
    youtube_url: initialData?.youtube_url || '',
  });

  const [errors, setErrors] = useState({});

  // Buscar jogadores cadastrados
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoadingPlayers(true);
        const response = await get('/players?active=true');
        setPlayers(response.data.players || []);
      } catch (error) {
        console.error('Erro ao buscar jogadores:', error);
        toast.error('Erro ao carregar jogadores');
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.player1_id) {
      newErrors.player1_id = 'Jogador 1 é obrigatório';
    }

    if (!formData.player2_id) {
      newErrors.player2_id = 'Jogador 2 é obrigatório';
    }

    if (formData.player1_id === formData.player2_id) {
      newErrors.player2_id = 'Jogadores devem ser diferentes';
    }

    if (!formData.sport) {
      newErrors.sport = 'Modalidade é obrigatória';
    }
    
    if (!formData.game_type) {
      newErrors.game_type = 'Tipo de jogo é obrigatório';
    }
    
    if (!formData.scheduled_at) {
      newErrors.scheduled_at = 'Data/hora é obrigatória';
    }
    
    if (!formData.location) {
      newErrors.location = 'Localização é obrigatória';
    }

    if (formData.total_series < 1) {
      newErrors.total_series = 'Mínimo 1 série';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Filtrar vantagens vazias
    const validAdvantages = formData.advantages.filter(adv => adv.trim() !== '');

    // Preparar dados para envio (agrupar game_rules)
    const dataToSubmit = {
      player1_id: formData.player1_id,
      player2_id: formData.player2_id,
      sport: formData.sport,
      scheduled_at: formData.scheduled_at,
      location: formData.location,
      total_series: formData.total_series,
      youtube_url: formData.youtube_url,
      game_rules: {
        game_type: formData.game_type,
        advantages: validAdvantages.length > 0 ? validAdvantages : null,
      }
    };

    onSubmit(dataToSubmit);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Funções para gerenciar vantagens
  const handleAdvantageChange = (index, value) => {
    const newAdvantages = [...formData.advantages];
    newAdvantages[index] = value;
    setFormData(prev => ({ ...prev, advantages: newAdvantages }));
  };

  const addAdvantage = () => {
    setFormData(prev => ({ ...prev, advantages: [...prev.advantages, ''] }));
  };

  const removeAdvantage = (index) => {
    const newAdvantages = formData.advantages.filter((_, i) => i !== index);
    // Manter pelo menos um campo vazio
    if (newAdvantages.length === 0) {
      newAdvantages.push('');
    }
    setFormData(prev => ({ ...prev, advantages: newAdvantages }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-admin-gray-medium border border-black rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-admin-gray-medium border-b border-black p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {initialData ? 'Editar Jogo' : 'Cadastrar Novo Jogo'}
          </h3>
          <button
            onClick={onCancel}
            className="text-admin-text-secondary hover:text-admin-green"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Jogador 1 */}
            <div>
              <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                Jogador 1 *
              </label>
              {loadingPlayers ? (
                <div className="input flex items-center justify-center text-admin-text-muted">
                  Carregando jogadores...
                </div>
              ) : (
                <select
                  className="select"
                  value={formData.player1_id}
                  onChange={(e) => handleChange('player1_id', e.target.value)}
                >
                  <option value="">Selecione o Jogador 1</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.nickname || player.name} {player.nickname && `(${player.name})`}
                    </option>
                  ))}
                </select>
              )}
              {errors.player1_id && (
                <p className="text-xs text-status-error mt-1">{errors.player1_id}</p>
              )}
              
              {/* Preview do Jogador 1 */}
              {formData.player1_id && players.find(p => p.id === formData.player1_id) && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-admin-gray-dark rounded-lg border border-black">
                  {players.find(p => p.id === formData.player1_id).photo_url ? (
                    <img
                      src={players.find(p => p.id === formData.player1_id).photo_url}
                      alt={players.find(p => p.id === formData.player1_id).name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle size={40} className="text-admin-text-muted" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-admin-text-primary">
                      {players.find(p => p.id === formData.player1_id).nickname || players.find(p => p.id === formData.player1_id).name}
                    </p>
                    <p className="text-xs text-admin-text-muted">
                      {players.find(p => p.id === formData.player1_id).name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Jogador 2 */}
            <div>
              <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                Jogador 2 *
              </label>
              {loadingPlayers ? (
                <div className="input flex items-center justify-center text-admin-text-muted">
                  Carregando jogadores...
                </div>
              ) : (
                <select
                  className="select"
                  value={formData.player2_id}
                  onChange={(e) => handleChange('player2_id', e.target.value)}
                >
                  <option value="">Selecione o Jogador 2</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.nickname || player.name} {player.nickname && `(${player.name})`}
                    </option>
                  ))}
                </select>
              )}
              {errors.player2_id && (
                <p className="text-xs text-status-error mt-1">{errors.player2_id}</p>
              )}
              
              {/* Preview do Jogador 2 */}
              {formData.player2_id && players.find(p => p.id === formData.player2_id) && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-admin-gray-dark rounded-lg border border-black">
                  {players.find(p => p.id === formData.player2_id).photo_url ? (
                    <img
                      src={players.find(p => p.id === formData.player2_id).photo_url}
                      alt={players.find(p => p.id === formData.player2_id).name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle size={40} className="text-admin-text-muted" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-admin-text-primary">
                      {players.find(p => p.id === formData.player2_id).nickname || players.find(p => p.id === formData.player2_id).name}
                    </p>
                    <p className="text-xs text-admin-text-muted">
                      {players.find(p => p.id === formData.player2_id).name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data/Hora */}
            <div>
              <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                Data e Hora *
              </label>
              <input
                type="datetime-local"
                className="input"
                value={formData.scheduled_at}
                onChange={(e) => handleChange('scheduled_at', e.target.value)}
              />
              {errors.scheduled_at && (
                <p className="text-xs text-status-error mt-1">{errors.scheduled_at}</p>
              )}
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                Localização *
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ex: São Paulo, SP"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
              {errors.location && (
                <p className="text-xs text-status-error mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Jogo */}
            <div>
              <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                Tipo de Jogo *
              </label>
              <select
                className="select"
                value={formData.game_type}
                onChange={(e) => handleChange('game_type', e.target.value)}
              >
                {GAME_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.game_type && (
                <p className="text-xs text-status-error mt-1">{errors.game_type}</p>
              )}
            </div>

            {/* Total de Séries */}
            <div>
              <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                Quantidade de Séries *
              </label>
              <input
                type="number"
                min="1"
                max="11"
                className="input"
                value={formData.total_series}
                onChange={(e) => handleChange('total_series', parseInt(e.target.value))}
              />
              {errors.total_series && (
                <p className="text-xs text-status-error mt-1">{errors.total_series}</p>
              )}
            </div>
          </div>

          {/* Vantagens (Múltiplas) */}
          <div>
            <label className="block text-sm font-medium text-admin-text-secondary mb-2">
              Vantagens
            </label>
            <div className="space-y-2">
              {formData.advantages.map((advantage, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Ex: Kaique começa com 2 bolas de vantagem"
                    value={advantage}
                    onChange={(e) => handleAdvantageChange(index, e.target.value)}
                  />
                  {formData.advantages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAdvantage(index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Remover vantagem"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAdvantage}
                className="text-sm text-admin-green hover:text-verde-neon flex items-center gap-1 transition-colors"
              >
                + Adicionar outra vantagem
              </button>
            </div>
            <p className="text-xs text-admin-text-muted mt-1">
              💡 Adicione múltiplas vantagens ou condições especiais do jogo
            </p>
          </div>

          {/* URL do YouTube */}
          <div>
            <label className="block text-sm font-medium text-admin-text-secondary mb-2">
              URL do YouTube (Transmissão)
            </label>
            <input
              type="url"
              className="input"
              placeholder="https://youtube.com/..."
              value={formData.youtube_url}
              onChange={(e) => handleChange('youtube_url', e.target.value)}
            />
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : initialData ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

