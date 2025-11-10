/**
 * ============================================================
 * SeriesManager - Gerenciamento de Séries
 * ============================================================
 */

'use client';

import { useState } from 'react';
import {
  useSeries,
  useCreateSerie,
  useReleaseSerie,
  useStartSerie,
  useFinishSerie,
  useCancelSerie,
  useDeleteSerie,
  useUpdateSerie,
} from '../../hooks/admin/useSeries';
import {
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  Save,
  X,
  Trophy,
  Lock,
  Unlock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from './Loader';
import StatusBadge from './StatusBadge';

export default function SeriesManager({ matchId, match }) {
  const [editingSerie, setEditingSerie] = useState(null);
  const [editData, setEditData] = useState({});
  const [finishingSerieId, setFinishingSerieId] = useState(null);
  const [finishData, setFinishData] = useState({
    winner_player_id: null,
    player1_score: 0,
    player2_score: 0,
  });

  const { data: seriesData, isLoading } = useSeries(matchId);
  const createSerie = useCreateSerie();
  const releaseSerie = useReleaseSerie();
  const startSerie = useStartSerie();
  const finishSerie = useFinishSerie();
  const cancelSerie = useCancelSerie();
  const deleteSerie = useDeleteSerie();
  const updateSerie = useUpdateSerie();

  const series = seriesData?.series || [];

  const handleCreateSerie = () => {
    if (confirm('Criar uma nova série para esta partida?')) {
      createSerie.mutate(matchId);
    }
  };

  const handleRelease = (serieId) => {
    if (confirm('Liberar esta série para apostas?')) {
      releaseSerie.mutate(serieId);
    }
  };

  const handleStart = (serieId) => {
    if (confirm('Iniciar série? Apostas serão travadas.')) {
      startSerie.mutate(serieId);
    }
  };

  const handleCancelSerie = (serieId) => {
    if (confirm('Cancelar série? Todas as apostas serão reembolsadas.')) {
      cancelSerie.mutate(serieId);
    }
  };

  const handleDeleteSerie = (serieId) => {
    if (confirm('Deletar esta série permanentemente? Esta ação não pode ser desfeita.')) {
      deleteSerie.mutate(serieId);
    }
  };

  const handleEditSerie = (serie) => {
    setEditingSerie(serie.id);
    setEditData({ serie_number: serie.serie_number });
  };

  const handleSaveEdit = async (serieId) => {
    await updateSerie.mutateAsync({
      serieId,
      data: editData,
    });
    setEditingSerie(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingSerie(null);
    setEditData({});
  };

  const handleOpenFinish = (serie) => {
    setFinishingSerieId(serie.id);
    setFinishData({
      winner_player_id: null,
      player1_score: serie.player1_score || 0,
      player2_score: serie.player2_score || 0,
    });
  };

  const handleFinishSerie = async () => {
    if (!finishData.winner_player_id) {
      toast.error('Por favor, selecione o vencedor da série');
      return;
    }

    try {
      await finishSerie.mutateAsync({
        serieId: finishingSerieId,
        ...finishData,
      });

      setFinishingSerieId(null);
      setFinishData({
        winner_player_id: null,
        player1_score: 0,
        player2_score: 0,
      });
    } catch (error) {
      console.error('Erro ao finalizar série:', error);
      toast.error('Erro ao finalizar série. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="admin-card">
        <h3 className="text-xl font-bold text-admin-text-primary mb-4">Séries da Partida</h3>
        <Loader />
      </div>
    );
  }

  return (
    <div className="admin-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-admin-text-primary flex items-center gap-2">
          <Trophy size={24} className="text-admin-primary" />
          Séries da Partida
        </h3>
        <button
          onClick={handleCreateSerie}
          disabled={createSerie.isPending || match.status === 'finalizada'}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Nova Série
        </button>
      </div>

      {/* Lista de Séries */}
      {series.length === 0 ? (
        <div className="bg-admin-bg rounded-lg p-8 text-center">
          <Trophy size={48} className="mx-auto mb-3 text-admin-text-muted opacity-50" />
          <p className="text-admin-text-secondary">Nenhuma série criada ainda</p>
          <p className="text-sm text-admin-text-muted mt-1">
            Clique em "Nova Série" para começar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {series.map((serie) => (
            <div
              key={serie.id}
              className="bg-admin-bg border border-admin-border rounded-lg p-4 hover:border-admin-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Número da Série */}
                  {editingSerie === serie.id ? (
                    <input
                      type="number"
                      value={editData.serie_number}
                      onChange={(e) =>
                        setEditData({ ...editData, serie_number: parseInt(e.target.value) })
                      }
                      className="input w-20 text-center"
                      min="1"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-admin-primary/20 text-admin-primary font-bold text-lg">
                      {serie.serie_number}
                    </div>
                  )}

                  <div>
                    <h4 className="text-lg font-bold text-admin-text-primary">
                      Série {serie.serie_number}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={serie.status} />
                      {serie.betting_enabled && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                          <Unlock size={12} />
                          Apostas Abertas
                        </span>
                      )}
                      {!serie.betting_enabled && (
                        <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full flex items-center gap-1">
                          <Lock size={12} />
                          Apostas Fechadas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões de Edição */}
                {editingSerie === serie.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-secondary btn-sm"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => handleSaveEdit(serie.id)}
                      className="btn btn-success btn-sm"
                      disabled={updateSerie.isPending}
                    >
                      <Save size={14} />
                    </button>
                  </div>
                ) : (
                  serie.status === 'pendente' && (
                    <button
                      onClick={() => handleEditSerie(serie)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit size={14} />
                    </button>
                  )
                )}
              </div>

              {/* Placar */}
              {serie.status !== 'pendente' && (
                <div className="bg-admin-card-bg rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-3 items-center text-center">
                    {/* Jogador 1 */}
                    <div className={`transition-all ${
                      serie.winner_player_id === match.player1?.id 
                        ? 'scale-105' 
                        : serie.status === 'encerrada' ? 'opacity-60' : ''
                    }`}>
                      <p className="text-sm text-admin-text-muted mb-1">
                        {match.player1?.name || 'Jogador 1'}
                      </p>
                      <p className={`text-2xl font-bold ${
                        serie.winner_player_id === match.player1?.id
                          ? 'text-verde-neon'
                          : 'text-admin-text-primary'
                      }`}>
                        {serie.player1_score || 0}
                      </p>
                      {serie.winner_player_id === match.player1?.id && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-verde-neon/20 rounded-full">
                          <Trophy size={12} className="text-verde-neon" />
                          <span className="text-xs font-bold text-verde-neon">Vencedor</span>
                        </div>
                      )}
                    </div>

                    <div className="text-admin-text-muted font-bold">VS</div>

                    {/* Jogador 2 */}
                    <div className={`transition-all ${
                      serie.winner_player_id === match.player2?.id 
                        ? 'scale-105' 
                        : serie.status === 'encerrada' ? 'opacity-60' : ''
                    }`}>
                      <p className="text-sm text-admin-text-muted mb-1">
                        {match.player2?.name || 'Jogador 2'}
                      </p>
                      <p className={`text-2xl font-bold ${
                        serie.winner_player_id === match.player2?.id
                          ? 'text-verde-neon'
                          : 'text-admin-text-primary'
                      }`}>
                        {serie.player2_score || 0}
                      </p>
                      {serie.winner_player_id === match.player2?.id && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-verde-neon/20 rounded-full">
                          <Trophy size={12} className="text-verde-neon" />
                          <span className="text-xs font-bold text-verde-neon">Vencedor</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-wrap gap-2">
                {/* Liberar para Apostas */}
                {serie.status === 'pendente' && (
                  <button
                    onClick={() => handleRelease(serie.id)}
                    disabled={releaseSerie.isPending}
                    className="btn btn-sm flex items-center gap-1 text-white font-semibold"
                    style={{ backgroundColor: '#27E502' }}
                  >
                    <Unlock size={14} />
                    Liberar Apostas
                  </button>
                )}

                {/* Iniciar Série */}
                {serie.status === 'liberada' && (
                  <button
                    onClick={() => handleStart(serie.id)}
                    disabled={startSerie.isPending}
                    className="btn btn-primary btn-sm flex items-center gap-1"
                  >
                    <Play size={14} />
                    Iniciar
                  </button>
                )}

                {/* Finalizar Série */}
                {serie.status === 'em_andamento' && (
                  <button
                    onClick={() => handleOpenFinish(serie)}
                    className="btn btn-success btn-sm flex items-center gap-1"
                  >
                    <CheckCircle size={14} />
                    Finalizar
                  </button>
                )}

                {/* Cancelar Série */}
                {(serie.status === 'liberada' || serie.status === 'em_andamento') && (
                  <button
                    onClick={() => handleCancelSerie(serie.id)}
                    disabled={cancelSerie.isPending}
                    className="btn btn-danger btn-sm flex items-center gap-1"
                  >
                    <XCircle size={14} />
                    Cancelar
                  </button>
                )}

                {/* Deletar Série */}
                {serie.status === 'pendente' && (
                  <button
                    onClick={() => handleDeleteSerie(serie.id)}
                    disabled={deleteSerie.isPending}
                    className="btn btn-danger btn-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Deletar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Finalização */}
      {finishingSerieId && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setFinishingSerieId(null)}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform px-4">
            <div className="bg-admin-card-bg border-2 border-admin-border rounded-xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-admin-text-primary mb-4">
                Finalizar Série
              </h3>

              {/* Selecionar Vencedor */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                  Selecione o Vencedor:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFinishData((prev) => ({
                        ...prev,
                        winner_player_id: match.player1?.id
                      }));
                    }}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      finishData.winner_player_id === match.player1?.id
                        ? 'border-verde-neon bg-verde-neon text-cinza-escuro shadow-xl'
                        : 'border-admin-border bg-admin-card-bg text-admin-text-primary hover:border-admin-primary/50 hover:bg-admin-border/20'
                    }`}
                  >
                    <p className="font-bold">{match.player1?.name || 'Jogador 1'}</p>
                    {finishData.winner_player_id === match.player1?.id && (
                      <p className="text-xs mt-1 font-semibold">✓ Vencedor</p>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFinishData((prev) => ({
                        ...prev,
                        winner_player_id: match.player2?.id
                      }));
                    }}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      finishData.winner_player_id === match.player2?.id
                        ? 'border-verde-neon bg-verde-neon text-cinza-escuro shadow-xl'
                        : 'border-admin-border bg-admin-card-bg text-admin-text-primary hover:border-admin-primary/50 hover:bg-admin-border/20'
                    }`}
                  >
                    <p className="font-bold">{match.player2?.name || 'Jogador 2'}</p>
                    {finishData.winner_player_id === match.player2?.id && (
                      <p className="text-xs mt-1 font-semibold">✓ Vencedor</p>
                    )}
                  </button>
                </div>
              </div>

              {/* Placar */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-admin-text-secondary mb-2">
                  Placar Final:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-admin-text-muted mb-1">
                      {match.player1?.name || 'Jogador 1'}
                    </label>
                    <input
                      type="number"
                      value={finishData.player1_score}
                      onChange={(e) =>
                        setFinishData({
                          ...finishData,
                          player1_score: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input w-full text-center"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-admin-text-muted mb-1">
                      {match.player2?.name || 'Jogador 2'}
                    </label>
                    <input
                      type="number"
                      value={finishData.player2_score}
                      onChange={(e) =>
                        setFinishData({
                          ...finishData,
                          player2_score: parseInt(e.target.value) || 0,
                        })
                      }
                      className="input w-full text-center"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => setFinishingSerieId(null)}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFinishSerie}
                  disabled={finishSerie.isPending || !finishData.winner_player_id}
                  className="btn btn-success flex-1"
                >
                  Finalizar Série
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
