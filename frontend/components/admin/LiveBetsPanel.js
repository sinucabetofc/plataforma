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

  useEffect(() => {
    const fetchBets = async () => {
      if (!match?.series || match.series.length === 0) {
        setBets([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    fetchBets();
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(fetchBets, 5000);
    return () => clearInterval(interval);
  }, [match]);

  const totalBets = bets.length;
  const totalAmount = bets.reduce((sum, bet) => sum + (bet.amount || 0), 0);

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
        <h3 className="card-title flex items-center gap-2">
          <TrendingUp size={20} />
          Apostas Ao Vivo
        </h3>
      </div>

      <div className="card-body">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-blue-400" />
              <span className="text-sm text-gray-400">Total de Apostas</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{totalBets}</p>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} className="text-green-400" />
              <span className="text-sm text-gray-400">Volume Total</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              R$ {(totalAmount / 100).toFixed(2)}
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
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bets.map((bet) => (
              <div
                key={bet.id}
                className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 hover:border-verde-neon/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">
                        {bet.user?.name || bet.user?.email || 'Usuário'}
                      </p>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        Série {bet.serie_number || '?'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Apostou em: <span className="text-verde-accent font-medium">{bet.chosen_player?.name || 'Jogador'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-verde-neon text-lg">
                      R$ {(bet.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">
                      {bet.status === 'pendente' ? 'Aguardando' : 
                       bet.status === 'aceita' ? 'Casada' : 
                       bet.status === 'ganha' ? 'Ganhou' : 
                       bet.status === 'perdida' ? 'Perdeu' : 
                       bet.status === 'cancelada' ? 'Cancelada' : bet.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




