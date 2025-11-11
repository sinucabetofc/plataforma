/**
 * ============================================================
 * LiveBetsPanel - Painel de Apostas Ao Vivo
 * ============================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { get } from '../../utils/api';
import Loader from './Loader';
import { TrendingUp, Users, DollarSign } from 'lucide-react';

export default function LiveBetsPanel({ matchId, match }) {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchBets = async (showLoader = false) => {
      if (!match?.series || match.series.length === 0) {
        setBets([]);
        setLoading(false);
        setIsInitialLoad(false);
        return;
      }

      try {
        // Só mostra loader no carregamento inicial
        if (showLoader) {
          setLoading(true);
        }
        
        // Buscar apostas de todas as séries
        const promises = match.series.map(serie => 
          get(`/bets/serie/${serie.id}`)
            .then(r => {
              // Backend retorna all_bets, não bets
              const betsArray = r.data?.all_bets || [];
              return {
              ...r,
                bets: betsArray.map(bet => ({
                ...bet,
                serie_number: serie.serie_number
              }))
              };
            })
            .catch((err) => {
              console.error(`Erro ao buscar apostas da série ${serie.id}:`, err);
              return { bets: [] };
            })
        );
        
        const results = await Promise.all(promises);
        const allBets = results.flatMap(r => r.bets || []);
        setBets(allBets);
      } catch (error) {
        console.error('Erro ao buscar apostas:', error);
        setBets([]);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
        setIsInitialLoad(false);
      }
    };

    // Carregamento inicial (com loader)
    fetchBets(true);
    
    // Atualizar a cada 5 segundos (SEM loader)
    const interval = setInterval(() => fetchBets(false), 5000);
    return () => clearInterval(interval);
  }, [match]);

  const totalBets = bets.length;
  const totalAmount = bets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
  const totalMatched = bets.reduce((sum, bet) => sum + (bet.matched_amount || 0), 0);

  // Helper para status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendente':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40', icon: '⏳', label: 'Pendente' };
      case 'parcialmente_aceita':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', icon: '🔄', label: 'Parcial' };
      case 'aceita':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40', icon: '🤝', label: 'Casada' };
      case 'ganha':
        return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/40', icon: '🎉', label: 'Ganhou' };
      case 'perdida':
        return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', icon: '😢', label: 'Perdeu' };
      case 'cancelada':
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/40', icon: '🚫', label: 'Cancelada' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/40', icon: '❓', label: status };
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <TrendingUp size={20} />
            Apostas Ao Vivo
          </h3>
        </div>
        <div className="card-body">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between w-full">
          <h3 className="card-title flex items-center gap-2">
            <TrendingUp size={20} />
            Apostas Ao Vivo
          </h3>
          {/* Indicador de atualização ao vivo */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle"></div>
            <span className="text-xs text-gray-500">Atualiza a cada 5s</span>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-blue-400" />
              <span className="text-xs text-gray-400 font-medium">Total de Apostas</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">{totalBets}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-green-400" />
              <span className="text-xs text-gray-400 font-medium">Volume Total</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              R$ {(totalAmount / 100).toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-orange-400" />
              <span className="text-xs text-gray-400 font-medium">Casado</span>
            </div>
            <p className="text-3xl font-bold text-orange-400">
              R$ {(totalMatched / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Lista de Apostas */}
        {bets.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8">
            <div className="text-center text-gray-500">
              <Users size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Nenhuma aposta ainda</p>
              <p className="text-sm text-gray-600 mt-1">As apostas aparecerão aqui em tempo real</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {bets.map((bet) => {
              const statusBadge = getStatusBadge(bet.status);
              const matchPercentage = bet.match_percentage || 
                (bet.amount > 0 && bet.matched_amount > 0 
                  ? Math.round((bet.matched_amount / bet.amount) * 100) 
                  : 0);

              return (
                <div
                  key={bet.id}
                  className={`bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 ${statusBadge.border} rounded-xl p-4 hover:shadow-lg hover:shadow-${statusBadge.text.split('-')[1]}-500/10 transition-all duration-300`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {/* Nome do usuário */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <p className="font-bold text-white text-base">
                          {bet.user?.name || bet.user?.email || 'Usuário'}
                        </p>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                          Série {bet.serie_number || '?'}
                        </span>
                      </div>
                      
                      {/* Jogador escolhido */}
                      <p className="text-sm text-gray-400">
                        Apostou em: <span className="text-verde-accent font-semibold">{bet.chosen_player?.name || 'Jogador'}</span>
                      </p>
                    </div>
                    
                    {/* Valor */}
                    <div className="text-right ml-3">
                      <p className="font-bold text-verde-neon text-xl">
                        R$ {(bet.amount / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Matching Info (para parcialmente aceita) */}
                  {bet.status === 'parcialmente_aceita' && matchPercentage > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Matching</span>
                        <span className="text-xs font-semibold text-orange-400">{matchPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-orange-400 h-full transition-all duration-500"
                          style={{ width: `${matchPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          Casado: R$ {((bet.matched_amount || 0) / 100).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Pendente: R$ {((bet.remaining_amount || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border} rounded-lg text-xs font-semibold`}>
                      <span>{statusBadge.icon}</span>
                      <span>{statusBadge.label}</span>
                    </span>

                    {/* Info adicional */}
                    {bet.status === 'aceita' && (
                      <span className="text-xs text-gray-500">
                        100% casada
                      </span>
                    )}
                    {bet.status === 'ganha' && bet.actual_return && (
                      <span className="text-xs text-green-400 font-semibold">
                        + R$ {(bet.actual_return / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}




