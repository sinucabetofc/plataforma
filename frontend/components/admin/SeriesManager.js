/**
 * ============================================================
 * SeriesManager - Gerenciador de Séries
 * ============================================================
 * Componente para gerenciar todas as séries de uma partida
 */

'use client';

import { useState } from 'react';
import { 
  useCreateSerie,
  useReleaseSerie, 
  useStartSerie, 
  useFinishSerie, 
  useCancelSerie,
  useDeleteSerie,
  useUpdateSerie
} from '../../hooks/admin/useSeries';
import { 
  Play, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle,
  Plus,
  Trophy,
  Clock,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from './Loader';

export default function SeriesManager({ 
  matchId, 
  match
}) {
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishingSerieId, setFinishingSerieId] = useState(null);
  const [editingSerieId, setEditingSerieId] = useState(null);
  const [editSerieNumber, setEditSerieNumber] = useState('');

  const createSerie = useCreateSerie();
  const releaseSerie = useReleaseSerie();
  const startSerie = useStartSerie();
  const finishSerie = useFinishSerie();
  const cancelSerie = useCancelSerie();
  const deleteSerie = useDeleteSerie();
  const updateSerie = useUpdateSerie();

  // Usar séries do match ou array vazio
  const series = match?.series || [];
  const loading = false;

  const handleAddSerie = async () => {
    if (!confirm('Adicionar nova série a esta partida?')) return;
    await createSerie.mutateAsync(matchId);
  };

  const handleEditSerie = (serie) => {
    setEditingSerieId(serie.id);
    setEditSerieNumber(serie.serie_number.toString());
  };

  const handleSaveEdit = async () => {
    if (!editSerieNumber || editSerieNumber === '') {
      toast.error('Número da série é obrigatório');
      return;
    }

    await updateSerie.mutateAsync({
      serieId: editingSerieId,
      data: { serie_number: parseInt(editSerieNumber) }
    });
    
    setEditingSerieId(null);
    setEditSerieNumber('');
  };

  const handleCancelEdit = () => {
    setEditingSerieId(null);
    setEditSerieNumber('');
  };

  const handleDeleteSerie = async (serieId) => {
    const serie = series.find(s => s.id === serieId);
    if (!confirm(`Deletar Série ${serie.serie_number}?\n\nAtenção: Não é possível deletar séries com apostas ou finalizadas.`)) {
      return;
    }

    await deleteSerie.mutateAsync(serieId);
  };

  const handleRelease = async (serieId) => {
    await releaseSerie.mutateAsync(serieId);
  };

  const handleStart = async (serieId) => {
    if (!confirm('Iniciar série? Isso travará as apostas.')) return;
    await startSerie.mutateAsync(serieId);
  };

  const handleFinish = (serieId) => {
    setFinishingSerieId(serieId);
    setShowFinishModal(true);
  };

  const handleCancelSerie = async (serieId) => {
    if (!confirm('Cancelar série? As apostas serão reembolsadas.')) return;
    await cancelSerie.mutateAsync(serieId);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pendente: { color: 'bg-gray-500', text: 'Pendente', icon: Clock },
      liberada: { color: 'bg-green-500', text: 'Aberta', icon: Unlock },
      em_andamento: { color: 'bg-blue-500', text: 'Ao Vivo', icon: Play },
      encerrada: { color: 'bg-purple-500', text: 'Encerrada', icon: CheckCircle },
      cancelada: { color: 'bg-red-500', text: 'Cancelada', icon: XCircle },
    };

    const badge = badges[status] || badges.pendente;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white ${badge.color}`}>
        <Icon size={14} />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return <Loader text="Carregando séries..." />;
  }

  return (
    <div className="admin-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b-2 border-admin-border">
        <div>
          <h2 className="text-2xl font-bold text-admin-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-admin-primary/20 flex items-center justify-center">
              <Trophy size={24} className="text-admin-primary" />
            </div>
            Séries da Partida
          </h2>
          <p className="text-sm text-admin-text-secondary mt-1 ml-13">
            {series.length} série{series.length !== 1 ? 's' : ''} cadastrada{series.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          className="btn btn-primary btn-sm flex items-center gap-2 shadow-lg"
          onClick={handleAddSerie}
          disabled={createSerie.isPending || match.status === 'finalizada' || match.status === 'cancelada'}
          title={
            match.status === 'finalizada' ? 'Não é possível adicionar série em partida finalizada' :
            match.status === 'cancelada' ? 'Não é possível adicionar série em partida cancelada' :
            'Adicionar nova série'
          }
        >
          <Plus size={16} />
          Nova Série
        </button>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-12 text-admin-text-secondary">
          <p>Nenhuma série cadastrada</p>
        </div>
      ) : (
        <div className="space-y-5">
          {series.map((serie) => (
            <div
              key={serie.id}
              className="border-2 rounded-xl p-6 transition-all shadow-md hover:shadow-xl border-admin-border hover:border-admin-primary/60 bg-admin-card-bg"
            >
              {/* Header da Série */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-admin-border">
                <div className="flex items-center gap-4 flex-1">
                  {editingSerieId === serie.id ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        value={editSerieNumber}
                        onChange={(e) => setEditSerieNumber(e.target.value)}
                        className="input w-20 text-center font-bold"
                        placeholder="#"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}
                        className="btn btn-success btn-sm"
                        disabled={updateSerie.isPending}
                      >
                        Salvar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-lg bg-admin-primary/20 flex items-center justify-center">
                        <span className="text-admin-primary font-black text-xl">
                          {serie.serie_number}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-admin-text-primary">
                          Série {serie.serie_number}
                        </h3>
                        {getStatusBadge(serie.status)}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Placar Destaque */}
                  <div className="bg-admin-bg rounded-xl px-6 py-3 border-2 border-admin-border">
                    <div className="flex items-center gap-5">
                      <span className="text-3xl font-black text-blue-500">{serie.player1_score}</span>
                      <span className="text-2xl font-bold text-admin-text-secondary">×</span>
                      <span className="text-3xl font-black text-purple-500">{serie.player2_score}</span>
                    </div>
                  </div>

                  {/* Menu de Opções */}
                  {(serie.status === 'pendente' || serie.status === 'liberada') && (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditSerie(serie); }}
                        className="btn btn-secondary btn-sm p-2"
                        title="Editar número da série"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSerie(serie.id); }}
                        className="btn btn-danger btn-sm p-2"
                        title="Excluir série"
                        disabled={deleteSerie.isPending}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Jogadores com Fotos */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Jogador 1 */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-admin-border flex-shrink-0">
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
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-bold"
                      style={{ display: match.player1?.photo_url ? 'none' : 'flex' }}
                    >
                      {(match.player_a?.name || 'J')[0]}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-admin-text-primary text-sm truncate">
                      {match.player_a?.name || 'Jogador 1'}
                    </p>
                    <p className="text-xs text-admin-text-muted truncate">
                      {match.player_a?.nickname || ''}
                    </p>
                  </div>
                </div>

                {/* Jogador 2 */}
                <div className="flex items-center gap-2 flex-row-reverse text-right">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-admin-border flex-shrink-0">
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
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 text-white text-sm font-bold"
                      style={{ display: match.player2?.photo_url ? 'none' : 'flex' }}
                    >
                      {(match.player_b?.name || 'J')[0]}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-admin-text-primary text-sm truncate">
                      {match.player_b?.name || 'Jogador 2'}
                    </p>
                    <p className="text-xs text-admin-text-muted truncate">
                      {match.player_b?.nickname || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vencedor */}
              {serie.winner_player_id && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy size={20} className="text-green-600" />
                    <div className="flex items-center gap-2">
                      {/* Foto do vencedor */}
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-admin-border">
                        {serie.winner_player_id === match.player1?.id ? (
                          match.player1?.photo_url ? (
                            <img
                              src={match.player1.photo_url}
                              alt="Vencedor"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-600 text-white text-xs font-bold">
                              {(match.player_a?.name || 'J')[0]}
                            </div>
                          )
                        ) : (
                          match.player2?.photo_url ? (
                            <img
                              src={match.player2.photo_url}
                              alt="Vencedor"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-600 text-white text-xs font-bold">
                              {(match.player_b?.name || 'J')[0]}
                            </div>
                          )
                        )}
                      </div>
                      <span className="text-sm text-green-600 font-semibold">
                        Vencedor: {serie.winner_player_id === match.player1?.id ? match.player_a?.name : match.player_b?.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-wrap gap-2">
                {serie.status === 'pendente' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRelease(serie.id); }}
                    className="btn btn-success btn-sm flex items-center gap-1"
                    disabled={releaseSerie.isPending}
                  >
                    <Unlock size={14} />
                    Liberar para Apostas
                  </button>
                )}

                {serie.status === 'liberada' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStart(serie.id); }}
                    className="btn btn-primary btn-sm flex items-center gap-1"
                    disabled={startSerie.isPending}
                  >
                    <Play size={14} />
                    Iniciar Série
                  </button>
                )}

                {serie.status === 'em_andamento' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleFinish(serie.id); }}
                    className="btn btn-success btn-sm flex items-center gap-1"
                    disabled={finishSerie.isPending}
                  >
                    <CheckCircle size={14} />
                    Finalizar Série
                  </button>
                )}

                {(serie.status === 'liberada' || serie.status === 'em_andamento') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCancelSerie(serie.id); }}
                    className="btn btn-danger btn-sm flex items-center gap-1"
                    disabled={cancelSerie.isPending}
                  >
                    <XCircle size={14} />
                    Cancelar
                  </button>
                )}
              </div>

              {/* Timestamps */}
              <div className="mt-4 pt-4 border-t border-admin-border text-xs text-admin-text-muted grid grid-cols-2 gap-2">
                {serie.started_at && (
                  <div>
                    <span className="font-medium">Iniciada:</span>{' '}
                    {new Date(serie.started_at).toLocaleString('pt-BR')}
                  </div>
                )}
                {serie.ended_at && (
                  <div>
                    <span className="font-medium">Finalizada:</span>{' '}
                    {new Date(serie.ended_at).toLocaleString('pt-BR')}
                  </div>
                )}
                {serie.betting_locked_at && (
                  <div>
                    <span className="font-medium">Apostas travadas:</span>{' '}
                    {new Date(serie.betting_locked_at).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Finalização */}
      {showFinishModal && (
        <FinishSerieModal
          serie={series.find(s => s.id === finishingSerieId)}
          match={match}
          onClose={() => {
            setShowFinishModal(false);
            setFinishingSerieId(null);
          }}
          onFinish={async (data) => {
            await finishSerie.mutateAsync({ serieId: finishingSerieId, ...data });
            setShowFinishModal(false);
            setFinishingSerieId(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Modal de Finalização de Série
 */
function FinishSerieModal({ serie, match, onClose, onFinish }) {
  const [player1Score, setPlayer1Score] = useState(serie.player1_score || 0);
  const [player2Score, setPlayer2Score] = useState(serie.player2_score || 0);
  const [winnerId, setWinnerId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!winnerId) {
      alert('Selecione o vencedor');
      return;
    }

    onFinish({
      winner_player_id: winnerId,
      player1_score: parseInt(player1Score),
      player2_score: parseInt(player2Score),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full p-6 border-2 border-gray-800">
        <h3 className="text-2xl font-bold text-admin-text-primary mb-6">
          Finalizar Série {serie.serie_number}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Placar Final */}
          <div>
            <label className="block text-sm font-medium text-admin-text-secondary mb-2">
              Placar Final
            </label>
            <div className="grid grid-cols-3 gap-2 items-center">
              <div>
                <label className="text-xs text-admin-text-muted mb-1 block">
                  {match.player_a?.name}
                </label>
                <input
                  type="number"
                  min="0"
                  value={player1Score}
                  onChange={(e) => setPlayer1Score(e.target.value)}
                  className="input w-full text-center text-lg font-bold"
                  required
                />
              </div>
              
              <div className="text-center text-2xl font-bold text-admin-text-secondary">
                ×
              </div>

              <div>
                <label className="text-xs text-admin-text-muted mb-1 block text-right">
                  {match.player_b?.name}
                </label>
                <input
                  type="number"
                  min="0"
                  value={player2Score}
                  onChange={(e) => setPlayer2Score(e.target.value)}
                  className="input w-full text-center text-lg font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Vencedor */}
          <div>
            <label className="block text-sm font-medium text-admin-text-secondary mb-2">
              Vencedor *
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 border-admin-border rounded-lg cursor-pointer hover:border-admin-primary transition-colors">
                <input
                  type="radio"
                  name="winner"
                  value={match.player1?.id}
                  checked={winnerId === match.player1?.id}
                  onChange={(e) => setWinnerId(e.target.value)}
                  className="w-4 h-4"
                  required
                />
                <span className="font-medium text-admin-text-primary">
                  {match.player_a?.name}
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 border-admin-border rounded-lg cursor-pointer hover:border-admin-primary transition-colors">
                <input
                  type="radio"
                  name="winner"
                  value={match.player2?.id}
                  checked={winnerId === match.player2?.id}
                  onChange={(e) => setWinnerId(e.target.value)}
                  className="w-4 h-4"
                  required
                />
                <span className="font-medium text-admin-text-primary">
                  {match.player_b?.name}
                </span>
              </label>
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-yellow-600">
              ⚠️ Ao finalizar, os prêmios serão distribuídos automaticamente para os vencedores das apostas.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-verde-neon hover:bg-verde-accent text-black font-bold rounded-lg transition-colors duration-200"
            >
              Finalizar e Distribuir Prêmios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




