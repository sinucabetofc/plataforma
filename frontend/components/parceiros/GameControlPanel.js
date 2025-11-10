/**
 * ============================================================
 * Game Control Panel - Controles do Jogo (Parceiros)
 * ============================================================
 */

import { useState } from 'react';
import { Play, Edit2, Unlock, CheckCircle, Lock } from 'lucide-react';

export default function GameControlPanel({ match, series, onAction, isLoading }) {
  const handleStartMatch = () => {
    if (confirm('Tem certeza que deseja iniciar a partida?')) {
      onAction('start-match');
    }
  };

  const handleStartSeries = (seriesId) => {
    if (confirm('Tem certeza que deseja iniciar esta série?')) {
      onAction('start-series', { seriesId });
    }
  };

  const handleEnableBetting = (seriesId) => {
    // Libera imediatamente sem confirmação
    onAction('enable-betting', { seriesId });
  };

  return (
    <div className="space-y-6">
      {/* Match Controls */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-admin-text-primary mb-4">
          Controles da Partida
        </h3>

        {/* Start Match Button */}
        {match?.status === 'agendada' && (
          <button
            onClick={handleStartMatch}
            disabled={isLoading}
            className="w-full admin-btn-primary"
          >
            <Play size={20} />
            Iniciar Partida
          </button>
        )}

        {/* Match In Progress Message */}
        {match?.status === 'em_andamento' && (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎱</div>
            <p className="text-admin-text-primary font-semibold text-lg">Partida em Andamento</p>
            <p className="text-admin-text-secondary text-sm mt-2">
              Use o placar ao vivo acima para atualizar
            </p>
          </div>
        )}

        {/* Match Finished Message */}
        {match?.status === 'finalizada' && (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-status-success mx-auto mb-3" />
            <p className="text-admin-text-primary font-semibold text-lg">Partida Finalizada</p>
          </div>
        )}
      </div>

      {/* Series Controls */}
      {series && series.length > 0 && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-admin-text-primary mb-4">Séries</h3>

          <div className="space-y-3">
            {series
              .sort((a, b) => (a.serie_number || a.series_number) - (b.serie_number || b.series_number))
              .map((s) => (
              <div
                key={s.id}
                className="p-4 bg-admin-gray-light rounded-lg border border-admin-gray-dark"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-admin-text-primary font-semibold text-lg">
                    Série {s.serie_number || s.series_number}
                  </p>
                  <div className="flex gap-2">
                    {s.status === 'pendente' && (
                      <button
                        onClick={() => handleStartSeries(s.id)}
                        disabled={isLoading}
                        className="px-3 py-2 bg-[#27E502] hover:bg-[#1fc600] text-admin-black text-sm rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center gap-1"
                        title="Iniciar Série"
                      >
                        <Play size={16} />
                        Iniciar
                      </button>
                    )}

                    {!s.betting_enabled && s.status !== 'finalizada' && (
                      <button
                        onClick={() => handleEnableBetting(s.id)}
                        disabled={isLoading}
                        className="px-3 py-2 bg-status-warning hover:bg-yellow-500 text-admin-black text-sm rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center gap-1"
                        title="Liberar Apostas"
                      >
                        <Unlock size={16} />
                        Liberar
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    s.status === 'pendente' ? 'status-badge-info' :
                    s.status === 'em_andamento' ? 'status-badge-success' :
                    'status-badge-default'
                  }`}>
                    {s.status === 'pendente' ? 'Pendente' : 
                     s.status === 'em_andamento' ? 'Em Andamento' : 'Finalizada'}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                    s.betting_enabled ? 'status-badge-success' : 'status-badge-default'
                  }`}>
                    {s.betting_enabled ? (
                      <>
                        <Unlock size={12} />
                        Apostas Abertas
                      </>
                    ) : (
                      <>
                        <Lock size={12} />
                        Apostas Fechadas
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
