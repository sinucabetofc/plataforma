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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Card 1: Total de Apostas */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-5 shadow-lg hover:shadow-xl hover:from-blue-500/25 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 rounded-lg">
                  <Users size={20} className="text-blue-400" />
                </div>
                <span className="text-sm text-gray-300 font-medium">Total de Apostas</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-blue-400">{totalBets}</p>
          </div>

          {/* Card 2: Volume Total */}
          <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-5 shadow-lg hover:shadow-xl hover:from-green-500/25 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-500/20 rounded-lg">
                  <DollarSign size={20} className="text-green-400" />
                </div>
                <span className="text-sm text-gray-300 font-medium">Volume Total</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-green-400">
              R$ {(totalAmount / 100).toFixed(2)}
            </p>
          </div>

          {/* Card 3: Total Casado */}
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 rounded-xl p-5 shadow-lg hover:shadow-xl hover:from-orange-500/25 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/20 rounded-lg">
                  <TrendingUp size={20} className="text-orange-400" />
                </div>
                <span className="text-sm text-gray-300 font-medium">Total Casado</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-orange-400">
              R$ {(totalMatched / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-800 mb-6"></div>

        {/* Título da Lista */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📋</span>
            <span>Apostas Recentes</span>
          </h4>
          <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
            {bets.length} {bets.length === 1 ? 'aposta' : 'apostas'}
          </span>
        </div>

        {/* Lista de Apostas */}
        {bets.length === 0 ? (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 border-dashed border-gray-700 rounded-xl p-12">
            <div className="text-center text-gray-500">
              <Users size={56} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold text-gray-400">Nenhuma aposta ainda</p>
              <p className="text-sm text-gray-600 mt-2">As apostas aparecerão aqui em tempo real</p>
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
                  className={`bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border-2 ${statusBadge.border} rounded-xl p-4 hover:shadow-lg transition-all duration-200`}
                >
                  {/* Header - Alinhado */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      {/* Nome do usuário + Série alinhados */}
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-white text-base truncate">
                          {bet.user?.name || bet.user?.email || 'Usuário'}
                        </p>
                        <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30 whitespace-nowrap">
                          Série {bet.serie_number || '?'}
                        </span>
                      </div>
                      
                      {/* Jogador escolhido */}
                      <p className="text-sm text-gray-400 truncate">
                        Apostou em: <span className="text-verde-accent font-semibold">{bet.chosen_player?.name || 'Jogador'}</span>
                      </p>
                    </div>
                    
                    {/* Valor - Alinhado à direita */}
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="font-bold text-verde-neon text-xl whitespace-nowrap">
                        R$ {(bet.amount / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Matching Info (para parcialmente aceita) */}
                  {bet.status === 'parcialmente_aceita' && matchPercentage > 0 && (
                    <div className="mb-3 bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 font-medium">Progresso de Matching</span>
                        <span className="text-sm font-bold text-orange-400">{matchPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-orange-400 h-full transition-all duration-500 shadow-lg"
                          style={{ width: `${matchPercentage}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-2.5">
                        <div className="text-left">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Casado</p>
                          <p className="text-sm font-semibold text-orange-400">
                            R$ {((bet.matched_amount || 0) / 100).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Pendente</p>
                          <p className="text-sm font-semibold text-gray-400">
                            R$ {((bet.remaining_amount || 0) / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Badge - Alinhado */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border} rounded-lg text-xs font-bold uppercase tracking-wide`}>
                      <span className="text-base">{statusBadge.icon}</span>
                      <span>{statusBadge.label}</span>
                    </span>

                    {/* Info adicional - Alinhada */}
                    <div className="text-right flex-shrink-0">
                      {bet.status === 'aceita' && (
                        <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 px-2 py-1 rounded">
                          100% casada
                        </span>
                      )}
                      {bet.status === 'ganha' && bet.actual_return && (
                        <span className="text-sm text-green-400 font-bold bg-green-500/10 px-2 py-1 rounded">
                          + R$ {(bet.actual_return / 100).toFixed(2)}
                        </span>
                      )}
                      {bet.status === 'pendente' && (
                        <span className="text-xs text-yellow-400 font-semibold bg-yellow-500/10 px-2 py-1 rounded">
                          Aguardando match
                        </span>
                      )}
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




