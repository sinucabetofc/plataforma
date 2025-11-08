/**
 * ============================================================
 * LiveScoreManager - Gerenciador de Placar ao Vivo
 * ============================================================
 * Atualiza placar em tempo real durante a série
 */

'use client';

import { useState, useEffect } from 'react';
import { useUpdateScore } from '../../hooks/admin/useSeries';
import { Plus, Minus, Save } from 'lucide-react';

export default function LiveScoreManager({ serie, match, onUpdate }) {
  const [player1Score, setPlayer1Score] = useState(serie.player1_score || 0);
  const [player2Score, setPlayer2Score] = useState(serie.player2_score || 0);
  const [hasChanges, setHasChanges] = useState(false);

  const updateScore = useUpdateScore();

  // Sincronizar com os dados da série
  useEffect(() => {
    setPlayer1Score(serie.player1_score || 0);
    setPlayer2Score(serie.player2_score || 0);
    setHasChanges(false);
  }, [serie.player1_score, serie.player2_score]);

  // Verificar mudanças
  useEffect(() => {
    const changed = 
      player1Score !== (serie.player1_score || 0) ||
      player2Score !== (serie.player2_score || 0);
    setHasChanges(changed);
  }, [player1Score, player2Score, serie.player1_score, serie.player2_score]);

  const handleSave = async () => {
    await updateScore.mutateAsync({
      serieId: serie.id,
      player1_score: parseInt(player1Score),
      player2_score: parseInt(player2Score),
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setPlayer1Score(serie.player1_score || 0);
    setPlayer2Score(serie.player2_score || 0);
  };

  // Só mostrar se a série estiver em andamento
  if (serie.status !== 'em_andamento') {
    return null;
  }

  return (
    <div className="admin-card">
      <h2 className="text-2xl font-bold text-admin-text-primary mb-6">
        📊 Placar ao Vivo - Série {serie.serie_number}
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Jogador 1 */}
        <div className="space-y-3">
          {/* Nome e Foto */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-admin-border shadow-lg">
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
            <h3 className="text-lg font-semibold text-admin-text-primary text-center">
              {match.player_a?.name}
            </h3>
          </div>
          
          <div className="bg-admin-bg rounded-lg p-4 border-2 border-blue-500/30">
            <div className="text-6xl font-bold text-center text-blue-600 mb-4">
              {player1Score}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setPlayer1Score(Math.max(0, player1Score - 1))}
                className="btn btn-secondary flex-1 flex items-center justify-center"
              >
                <Minus size={20} />
              </button>
              <button
                onClick={() => setPlayer1Score(player1Score + 1)}
                className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-white transition-all hover:brightness-110 shadow-lg"
                style={{ backgroundColor: '#27E502' }}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Jogador 2 */}
        <div className="space-y-3">
          {/* Nome e Foto */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-admin-border shadow-lg">
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
            <h3 className="text-lg font-semibold text-admin-text-primary text-center">
              {match.player_b?.name}
            </h3>
          </div>
          
          <div className="bg-admin-bg rounded-lg p-4 border-2 border-purple-500/30">
            <div className="text-6xl font-bold text-center text-purple-600 mb-4">
              {player2Score}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setPlayer2Score(Math.max(0, player2Score - 1))}
                className="btn btn-secondary flex-1 flex items-center justify-center"
              >
                <Minus size={20} />
              </button>
              <button
                onClick={() => setPlayer2Score(player2Score + 1)}
                className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-white transition-all hover:brightness-110 shadow-lg"
                style={{ backgroundColor: '#27E502' }}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      {hasChanges && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleReset}
            className="btn btn-secondary flex-1"
            disabled={updateScore.isPending}
          >
            Resetar
          </button>
          <button
            onClick={handleSave}
            className="btn btn-success flex-1 flex items-center justify-center gap-2"
            disabled={updateScore.isPending}
          >
            <Save size={18} />
            Salvar Placar
          </button>
        </div>
      )}

      {/* Indicador de salvamento automático */}
      {!hasChanges && (
        <div className="mt-4 text-center">
          <span className="text-sm text-green-600">
            ✓ Placar sincronizado
          </span>
        </div>
      )}
    </div>
  );
}





