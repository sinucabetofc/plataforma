/**
 * ============================================================
 * MatchInfoCard - Card de Informações da Partida
 * ============================================================
 */

'use client';

import { useState } from 'react';
import { useUpdateMatch, useUpdateMatchStatus } from '../../hooks/admin/useMatches';
import { 
  Calendar, 
  MapPin, 
  Youtube, 
  Edit, 
  Save,
  X,
  Activity,
  CheckCircle,
  Play,
  StopCircle,
  Trophy,
  Users
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function MatchInfoCard({ match, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    location: match.location || '',
  });

  const updateMatch = useUpdateMatch();
  const updateMatchStatus = useUpdateMatchStatus();

  // Tradução dos campos das regras do jogo
  const translateRuleKey = (key) => {
    const translations = {
      'game_type': 'Tipo de Jogo',
      'rules': 'Regras',
      'total_series': 'Total de Séries',
      'points_to_win': 'Pontos para Vencer',
      'advantages': 'Vantagens',
      'time_limit': 'Limite de Tempo',
      'break_rules': 'Regras de Quebra',
      'foul_penalty': 'Penalidade por Falta',
      'table_size': 'Tamanho da Mesa',
      'ball_type': 'Tipo de Bola',
    };
    return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleChangeStatus = async (newStatus) => {
    const messages = {
      em_andamento: 'Iniciar partida? Isso ativará o modo ao vivo.',
      finalizada: 'Finalizar partida? Certifique-se que todas as séries foram finalizadas.',
      cancelada: 'Cancelar partida? Todas as apostas serão reembolsadas.',
    };

    if (!confirm(messages[newStatus])) return;

    await updateMatchStatus.mutateAsync({
      matchId: match.id,
      status: newStatus,
    });
  };

  const handleSave = async () => {
    await updateMatch.mutateAsync({
      matchId: match.id,
      data: formData,
    });
    setEditing(false);
    if (onUpdate && typeof onUpdate === 'function') {
      onUpdate();
    }
  };

  const handleCancel = () => {
    setFormData({
      location: match.location || '',
    });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <div className="admin-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-admin-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-admin-primary/20 flex items-center justify-center">
              <Trophy size={24} className="text-admin-primary" />
            </div>
            Gerenciar Partida
          </h2>
          
          <div className="flex flex-wrap items-center gap-2">
          {/* Botões de Status */}
          {match.status === 'agendada' && (
            <button
              onClick={() => handleChangeStatus('em_andamento')}
              className="btn btn-sm flex items-center gap-1 text-white font-semibold shadow-lg hover:brightness-110 transition-all"
              style={{ backgroundColor: '#27E502' }}
              disabled={updateMatchStatus.isPending}
            >
              <Play size={14} />
              Iniciar Partida
            </button>
          )}

          {match.status === 'em_andamento' && (
            <button
              onClick={() => handleChangeStatus('finalizada')}
              className="btn btn-primary btn-sm flex items-center gap-1"
              disabled={updateMatchStatus.isPending}
            >
              <CheckCircle size={14} />
              Finalizar Partida
            </button>
          )}

          {(match.status === 'agendada' || match.status === 'em_andamento') && (
            <button
              onClick={() => handleChangeStatus('cancelada')}
              className="btn btn-danger btn-sm flex items-center gap-1"
              disabled={updateMatchStatus.isPending}
            >
              <StopCircle size={14} />
              Cancelar Partida
            </button>
          )}

          {/* Botão Editar */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="btn btn-secondary btn-sm flex items-center gap-2"
            >
              <Edit size={14} />
              Editar Info
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="btn btn-secondary btn-sm flex items-center gap-1"
              >
                <X size={14} />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="btn btn-success btn-sm flex items-center gap-1"
                disabled={updateMatch.isPending}
              >
                <Save size={14} />
                Salvar
              </button>
            </>
          )}
          </div>
        </div>
      </div>

      {/* Jogadores - Destaque */}
      <div className="admin-card">
        <div className="mb-4 flex items-center gap-2">
          <Users size={20} className="text-admin-primary" />
          <h3 className="text-lg font-bold text-admin-text-primary">
            Jogadores da Partida
          </h3>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 via-admin-bg to-purple-500/10 rounded-xl p-6 border-2 border-admin-border">
              <div className="flex items-center justify-between gap-6">
                {/* Jogador 1 */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-admin-border flex-shrink-0 shadow-xl ring-4 ring-blue-500/30">
                    {match.player1?.photo_url ? (
                      <img
                        src={match.player1.photo_url}
                        alt={match.player_a?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white text-3xl font-bold"
                      style={{ display: match.player1?.photo_url ? 'none' : 'flex' }}
                    >
                      {(match.player_a?.name || 'J')[0]}
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-admin-text-primary mb-1">
                      {match.player_a?.name}
                    </p>
                    <p className="text-sm text-blue-500 font-medium">
                      @{match.player_a?.nickname || 'Jogador 1'}
                    </p>
                    {match.player1?.win_rate && (
                      <p className="text-xs text-admin-text-muted mt-1">
                        Taxa de vitória: {(match.player1.win_rate * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 px-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-admin-primary to-admin-primary/50 flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-3xl">VS</span>
                  </div>
                </div>
                
                {/* Jogador 2 */}
                <div className="flex items-center gap-4 flex-1 flex-row-reverse">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-admin-border flex-shrink-0 shadow-xl ring-4 ring-purple-500/30">
                    {match.player2?.photo_url ? (
                      <img
                        src={match.player2.photo_url}
                        alt={match.player_b?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 text-white text-3xl font-bold"
                      style={{ display: match.player2?.photo_url ? 'none' : 'flex' }}
                    >
                      {(match.player_b?.name || 'J')[0]}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-admin-text-primary mb-1">
                      {match.player_b?.name}
                    </p>
                    <p className="text-sm text-purple-500 font-medium">
                      @{match.player_b?.nickname || 'Jogador 2'}
                    </p>
                    {match.player2?.win_rate && (
                      <p className="text-xs text-admin-text-muted mt-1">
                        Taxa de vitória: {(match.player2.win_rate * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Informações Principais */}
      <div className="admin-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status */}
          <div className="bg-admin-bg rounded-lg p-4 border-l-4 border-admin-primary">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-admin-primary" />
              <label className="text-xs font-semibold text-admin-text-muted uppercase tracking-wide">
                Status
              </label>
            </div>
            <div className="space-y-2">
              <StatusBadge status={match.status} />
            </div>
          </div>

          {/* Data Agendada */}
          <div className="bg-admin-bg rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-blue-500" />
              <label className="text-xs font-semibold text-admin-text-muted uppercase tracking-wide">
                Data Agendada
              </label>
            </div>
            <p className="text-admin-text-primary font-semibold text-lg">
              {new Date(match.scheduled_at).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-admin-text-secondary text-sm">
              {new Date(match.scheduled_at).toLocaleTimeString('pt-BR')}
            </p>
          </div>

          {/* Localização */}
          <div className="bg-admin-bg rounded-lg p-4 border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-purple-500" />
              <label className="text-xs font-semibold text-admin-text-muted uppercase tracking-wide">
                Localização
              </label>
            </div>
            {editing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input w-full"
                placeholder="Ex: São Paulo, SP"
              />
            ) : (
              <p className="text-admin-text-primary font-medium text-lg">
                {match.location || 'Não informado'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transmissão e Regras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* YouTube URL (Somente Leitura) */}
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-4">
            <Youtube size={20} className="text-red-500" />
            <label className="text-lg font-bold text-admin-text-primary">
              Link da Transmissão
            </label>
          </div>
          <div className="bg-admin-bg rounded-xl p-4">
            {match.youtube_url ? (
              <div className="space-y-2">
                <a
                  href={match.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-admin-primary hover:underline text-sm break-all block"
                >
                  {match.youtube_url}
                </a>
                <a
                  href={match.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Youtube size={16} />
                  Abrir no YouTube
                </a>
              </div>
            ) : (
              <p className="text-admin-text-muted">Não informado</p>
            )}
          </div>
        </div>

        {/* Regras do Jogo */}
        {match.game_rules && Object.keys(match.game_rules).length > 0 && (
          <div className="admin-card">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-admin-primary" />
              <label className="text-lg font-bold text-admin-text-primary">
                Regras do Jogo
              </label>
            </div>
            <div className="bg-admin-bg rounded-xl p-4 space-y-3">
              {Object.entries(match.game_rules).map(([key, value]) => (
                <div key={key} className="bg-admin-card-bg rounded-lg p-3 border border-admin-border hover:border-admin-primary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-admin-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-admin-text-primary font-bold block mb-1 text-sm">
                        {translateRuleKey(key)}
                      </span>
                      <span className="text-admin-text-secondary text-sm leading-relaxed">
                        {Array.isArray(value) ? (
                          <ul className="list-none space-y-1 ml-2">
                            {value.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-admin-primary mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="font-medium">{String(value)}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ID e Metadados */}
      <div className="admin-card bg-admin-bg/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-admin-text-secondary">ID da Partida:</span>
            <span className="text-admin-text-muted font-mono text-xs">{match.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-admin-text-secondary">Criado em:</span>
            <span className="text-admin-text-primary">
              {new Date(match.created_at).toLocaleString('pt-BR')}
            </span>
          </div>
          {match.created_by && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-admin-text-secondary">Criado por:</span>
              <span className="text-admin-text-primary">{match.created_by.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





