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
      <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-verde-neon/20 to-verde-accent/10 rounded-lg">
              <TrendingUp size={22} className="text-verde-neon" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Apostas Ao Vivo</h3>
              <p className="text-xs text-gray-500 mt-0.5">Monitoramento em tempo real</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-verde-neon mx-auto mb-4"></div>
              <p className="text-sm text-gray-400 font-medium">Carregando apostas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-6 py-5">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-verde-neon/20 to-verde-accent/10 rounded-lg">
              <TrendingUp size={22} className="text-verde-neon" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Apostas Ao Vivo</h3>
              <p className="text-xs text-gray-500 mt-0.5">Monitoramento em tempo real</p>
            </div>
          </div>
          {/* Indicador de atualização ao vivo */}
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle shadow-lg shadow-green-500/50"></div>
            <span className="text-xs text-gray-400 font-medium">Atualiza a cada 5s</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {/* Card 1: Total de Apostas */}
          <div className="bg-gray-900/80 border border-blue-500/30 rounded-lg p-3 hover:border-blue-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <Users size={16} className="text-blue-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Total de Apostas</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{totalBets}</p>
          </div>

          {/* Card 2: Volume Total */}
          <div className="bg-gray-900/80 border border-green-500/30 rounded-lg p-3 hover:border-green-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-green-500/20 rounded-lg">
                <DollarSign size={16} className="text-green-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Volume Total</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              R$ {(totalAmount / 100).toFixed(2)}
            </p>
          </div>

          {/* Card 3: Total Casado */}
          <div className="bg-gray-900/80 border border-orange-500/30 rounded-lg p-3 hover:border-orange-500/50 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-orange-500/20 rounded-lg">
                <TrendingUp size={16} className="text-orange-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Total Casado</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">
              R$ {(totalMatched / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Separador com gradiente */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#0a0a0a] px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Histórico de Apostas
            </span>
          </div>
        </div>

        {/* Título da Lista */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <span className="text-xl">📋</span>
            </div>
            <h4 className="text-lg font-bold text-white">Apostas Recentes</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Total:</span>
            <span className="text-sm font-bold text-white bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
              {bets.length}
            </span>
          </div>
        </div>

        {/* Lista de Apostas */}
        {bets.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900/30 to-transparent border-2 border-dashed border-gray-800 rounded-2xl p-16">
            <div className="text-center">
              <div className="inline-flex p-6 bg-gray-800/50 rounded-full mb-5">
                <Users size={64} className="text-gray-600" />
              </div>
              <p className="text-xl font-bold text-gray-300 mb-2">Nenhuma aposta ainda</p>
              <p className="text-sm text-gray-500">As apostas aparecerão aqui automaticamente a cada 5 segundos</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
            {bets.map((bet) => {
              const statusBadge = getStatusBadge(bet.status);
              const matchPercentage = bet.match_percentage || 
                (bet.amount > 0 && bet.matched_amount > 0 
                  ? Math.round((bet.matched_amount / bet.amount) * 100) 
                  : 0);

              return (
              <div
                key={bet.id}
                  className={`group relative bg-gradient-to-br from-gray-900/50 to-gray-950/30 border-2 ${statusBadge.border} rounded-2xl p-5 hover:shadow-2xl hover:border-opacity-60 transition-all duration-300 overflow-hidden`}
                >
                  {/* Background hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header - Alinhado */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1 min-w-0 mr-4">
                        {/* Nome do usuário + Série */}
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <p className="font-bold text-white text-lg truncate">
                        {bet.user?.name || bet.user?.email || 'Usuário'}
                      </p>
                          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/40 whitespace-nowrap shadow-sm">
                        Série {bet.serie_number || '?'}
                      </span>
                        </div>
                        
                        {/* Jogador escolhido */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 font-medium">Apostou em:</span>
                          <span className="text-sm text-verde-accent font-bold truncate">
                            {bet.chosen_player?.name || 'Jogador'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Valor - Destacado */}
                      <div className="text-right flex-shrink-0">
                        <div className="bg-verde-neon/10 border border-verde-neon/30 rounded-xl px-4 py-2.5 shadow-lg">
                          <p className="font-black text-verde-neon text-2xl whitespace-nowrap tracking-tight">
                            R$ {(bet.amount / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Matching Info (para parcialmente aceita) */}
                    {bet.status === 'parcialmente_aceita' && matchPercentage > 0 && (
                      <div className="mb-4 bg-gradient-to-br from-orange-600/10 to-orange-500/5 border-2 border-orange-500/30 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Progresso de Matching</span>
                          <span className="text-lg font-black text-orange-400">{matchPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden shadow-inner border border-gray-800">
                          <div 
                            className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 h-full transition-all duration-700 shadow-lg shadow-orange-500/30"
                            style={{ width: `${matchPercentage}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-800">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">✅ Casado</p>
                            <p className="text-base font-bold text-orange-400">
                              R$ {((bet.matched_amount || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                          <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-800">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">⏳ Pendente</p>
                            <p className="text-base font-bold text-gray-400">
                              R$ {((bet.remaining_amount || 0) / 100).toFixed(2)}
                    </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Badge - Profissional */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2.5 px-5 py-2.5 ${statusBadge.bg} ${statusBadge.text} border-2 ${statusBadge.border} rounded-xl text-sm font-black uppercase tracking-wider shadow-lg`}>
                        <span className="text-lg">{statusBadge.icon}</span>
                        <span>{statusBadge.label}</span>
                      </span>

                      {/* Info adicional - Destacada */}
                      <div className="text-right flex-shrink-0">
                        {bet.status === 'aceita' && (
                          <div className="bg-blue-600/20 border border-blue-500/40 px-3 py-1.5 rounded-lg">
                            <span className="text-xs text-blue-400 font-bold">✓ 100% casada</span>
                          </div>
                        )}
                        {bet.status === 'ganha' && bet.actual_return && (
                          <div className="bg-green-600/20 border border-green-500/40 px-3 py-1.5 rounded-lg">
                            <span className="text-sm text-green-400 font-black">+ R$ {(bet.actual_return / 100).toFixed(2)}</span>
                          </div>
                        )}
                        {bet.status === 'pendente' && (
                          <div className="bg-yellow-600/20 border border-yellow-500/40 px-3 py-1.5 rounded-lg">
                            <span className="text-xs text-yellow-400 font-bold">⏰ Aguardando</span>
                          </div>
                        )}
                      </div>
                    </div>
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




