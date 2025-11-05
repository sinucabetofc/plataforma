/**
 * ============================================================
 * Página: /partidas/[id]
 * Descrição: Detalhes completos da partida + apostas
 * ============================================================
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { 
  formatDate, 
  formatTime, 
  formatMoney, 
  formatMatchStatus,
  formatPercent 
} from '../../utils/formatters';
import AuthModal from '../../components/AuthModal';
import DepositModal from '../../components/DepositModal';

export default function PartidaDetalhesPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        const matchData = await api.matches.getById(id);
        setMatch(matchData);
      } catch (err) {
        console.error('Erro ao buscar partida:', err);
        setError(err.message || 'Erro ao carregar partida');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎱</div>
          <p className="text-white text-lg">Carregando partida...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-[#171717] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-white mb-2">Partida não encontrada</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/partidas')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Voltar para Partidas
          </button>
        </div>
      </div>
    );
  }

  const isLive = match?.scheduled_at && new Date(match.scheduled_at) <= new Date();
  const currentSerie = match?.series?.find(s => s.status === 'liberada');

  return (
    <>
      <Head>
        <title>{match.player1.name} vs {match.player2.name} - SinucaBet</title>
      </Head>

      <div className="min-h-screen bg-[#171717] py-6">
        <div className="max-w-5xl mx-auto px-4">
          {/* Botão Voltar */}
          <button
            onClick={() => router.push('/partidas')}
            className="mb-2 text-gray-400 hover:text-white flex items-center gap-2"
          >
            ← Voltar para Partidas
          </button>

          {/* Header da Partida */}
          <div className="bg-[#000000] rounded-lg border border-gray-800 p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full">
                    <div className="text-yellow-500">📅</div>
                    <span className="text-gray-300 text-sm">{formatMatchStatus(match.status).label}</span>
                  </div>
                  
                  {match.game_rules?.game_type && (
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      match.game_rules.game_type === 'NUMERADA' 
                        ? 'bg-purple-900/30 text-purple-400' 
                        : match.game_rules.game_type === 'LISA'
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'bg-orange-900/30 text-orange-400'
                    }`}>
                      {match.game_rules.game_type === 'NUMERADA' ? 'JOGO DE BOLA NUMERADA' : 
                       match.game_rules.game_type === 'LISA' ? 'JOGO DE BOLAS LISAS' : 
                       match.game_rules.game_type}
                    </div>
                  )}
                </div>
                
                <p className="text-gray-400 text-sm">
                  📍 {match.location || 'Localização não informada'}
                </p>
                <p className="text-gray-400 text-sm">
                  📅 {formatDate(match.scheduled_at)} às {formatTime(match.scheduled_at)}
                </p>
              </div>
            </div>

            {/* Jogadores */}
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="flex-1 text-center max-w-xs">
                {match.player1.photo_url && (
                  <img
                    src={match.player1.photo_url}
                    alt={match.player1.name}
                    className="w-16 h-16 rounded-lg mx-auto mb-2 object-cover border-2 border-green-600"
                  />
                )}
                <h2 className="text-lg font-bold text-white mb-1">{match.player1.name}</h2>
                {match.player1.nickname && (
                  <p className="text-sm text-gray-400 mb-1">({match.player1.nickname})</p>
                )}
                {match.player1.win_rate !== undefined && (
                  <p className="text-xs text-gray-500">
                    Taxa de ganho: <span className="text-green-500 font-semibold">{formatPercent(match.player1.win_rate)}</span>
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                  VS
                </div>
              </div>

              <div className="flex-1 text-center max-w-xs">
                {match.player2.photo_url && (
                  <img
                    src={match.player2.photo_url}
                    alt={match.player2.name}
                    className="w-16 h-16 rounded-lg mx-auto mb-2 object-cover border-2 border-green-600"
                  />
                )}
                <h2 className="text-lg font-bold text-white mb-1">{match.player2.name}</h2>
                {match.player2.nickname && (
                  <p className="text-sm text-gray-400 mb-1">({match.player2.nickname})</p>
                )}
                {match.player2.win_rate !== undefined && (
                  <p className="text-xs text-gray-500">
                    Taxa de ganho: <span className="text-green-500 font-semibold">{formatPercent(match.player2.win_rate)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Regras */}
            {match.game_rules && (
              <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
                <p className="text-sm font-semibold text-white mb-2">📋 Regras:</p>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  {match.game_rules.advantages && (
                    <li>{match.game_rules.advantages}</li>
                  )}
                  {match.game_rules.points_to_win && (
                    <li>Jogo até {match.game_rules.points_to_win} pontos</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* YouTube Player */}
          {match.youtube_url && (
            <div className="mb-6">
              <div className="bg-[#000000] rounded-lg overflow-hidden border border-gray-800">
                <div className="aspect-video">
                  <iframe
                    src={`${match.youtube_url.replace('watch?v=', 'embed/')}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-3 bg-red-900/20 border-t border-red-800">
                  <p className="text-red-400 text-sm font-semibold flex items-center gap-2">
                    <span className="animate-pulse">🔴</span>
                    Transmissão ao vivo
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Campo de Aposta Único - Aparece apenas quando há série liberada */}
          {currentSerie && (
            <div className="mb-6">
              <BettingSection 
                serie={currentSerie} 
                match={match}
                onOpenLoginModal={() => setShowLoginModal(true)}
                onOpenDepositModal={() => setShowDepositModal(true)}
              />
            </div>
          )}

          {/* Séries da Partida */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              🎯 Séries da Partida
            </h3>
            <div className="space-y-4">
              {match.series?.map((serie) => (
                <SerieCard key={serie.id} serie={serie} match={match} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Login */}
      <AuthModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Modal de Depósito */}
      <DepositModal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={async (amount) => {
          // Lógica de depósito
          await api.wallet.deposit({ amount });
          window.location.reload();
        }}
      />
    </>
  );
}

// Componente de Aposta Individual (reutilizável e responsivo)
function BetItem({ bet, isWinner }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'matched':
        return {
          icon: '✅',
          label: 'Casada',
          borderColor: isWinner ? 'border-yellow-500/50' : 'border-green-500/50',
          bgColor: isWinner ? 'bg-yellow-900/10' : 'bg-green-900/10',
          badgeBg: 'bg-green-600/20',
          badgeBorder: 'border-green-600/40',
          badgeText: 'text-green-400',
          messageColor: 'text-green-400',
          message: '🤝 Casada com aposta oposta - Ativa'
        };
      case 'pending':
        return {
          icon: '⏳',
          label: 'Aguardando',
          borderColor: 'border-yellow-500/50',
          bgColor: 'bg-yellow-900/10',
          badgeBg: 'bg-yellow-600/20',
          badgeBorder: 'border-yellow-600/40',
          badgeText: 'text-yellow-400',
          messageColor: 'text-yellow-400',
          message: '⏰ Aguardando aposta oposta...'
        };
      default:
        return {
          icon: '❓',
          label: 'Desconhecido',
          borderColor: 'border-gray-500/50',
          bgColor: 'bg-gray-900/10',
          badgeBg: 'bg-gray-600/20',
          badgeBorder: 'border-gray-600/40',
          badgeText: 'text-gray-400',
          messageColor: 'text-gray-400',
          message: 'Status desconhecido'
        };
    }
  };

  const config = getStatusConfig(bet.status || 'matched');

  return (
    <div className={`rounded-lg overflow-hidden border-2 transition-all ${config.borderColor} ${config.bgColor}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 gap-2">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <span className="text-base">{config.icon}</span>
          <span className="text-xs font-medium text-gray-300">{bet.label}</span>
          <span className={`px-2 py-0.5 ${config.badgeBg} border ${config.badgeBorder} rounded-full text-[10px] font-bold ${config.badgeText} uppercase whitespace-nowrap`}>
            {config.label}
          </span>
        </div>
        <span className="text-sm font-bold text-white ml-6 sm:ml-0">R$ {bet.amount.toFixed(2)}</span>
      </div>
      <div className="px-3 pb-2">
        <p className={`text-[10px] ${config.messageColor} flex items-center gap-1`}>
          <span>{config.message}</span>
        </p>
      </div>
    </div>
  );
}

// Componente de Card de Série (apenas visualização)
function SerieCard({ serie, match }) {
  const [betsData, setBetsData] = useState(null);
  const [loadingBets, setLoadingBets] = useState(false);

  // Buscar apostas da série quando ela estiver liberada ou em andamento
  useEffect(() => {
    const fetchBets = async () => {
      if (serie.status === 'liberada' || serie.status === 'em_andamento' || serie.status === 'encerrada') {
        try {
          setLoadingBets(true);
          const response = await api.bets.getBySerie(serie.id);
          setBetsData(response);
        } catch (error) {
          console.error('Erro ao buscar apostas da série:', error);
          setBetsData(null);
        } finally {
          setLoadingBets(false);
        }
      }
    };
    
    fetchBets();
  }, [serie.id, serie.status]);

  const getStatusInfo = () => {
    switch (serie.status) {
      case 'pendente':
        return { label: 'Aguardando', color: 'text-gray-500', bgColor: 'bg-gray-900/30', borderColor: 'border-gray-700', icon: '⏳' };
      case 'liberada':
        return { label: 'Liberada', color: 'text-green-500', bgColor: 'bg-green-900/30', borderColor: 'border-green-700', icon: '🟢' };
      case 'em_andamento':
        return { label: 'Em andamento', color: 'text-blue-500', bgColor: 'bg-blue-900/30', borderColor: 'border-blue-700', icon: '🔵' };
      case 'encerrada':
        return { label: 'Encerrada', color: 'text-[#28E404]', bgColor: 'bg-[#28E404]/20', borderColor: 'border-[#28E404]', icon: '✅' };
      case 'cancelada':
        return { label: 'Cancelada', color: 'text-red-500', bgColor: 'bg-red-900/30', borderColor: 'border-red-700', icon: '❌' };
      default:
        return { label: 'Desconhecido', color: 'text-gray-500', bgColor: 'bg-gray-900/30', borderColor: 'border-gray-700', icon: '❓' };
    }
  };

  const statusInfo = getStatusInfo();
  
  // Mostra placar se série está liberada, em andamento ou encerrada
  const showScore = serie.status === 'liberada' || serie.status === 'em_andamento' || serie.status === 'encerrada';
  
  const hasWinner = serie.winner_player_id;
  const winnerIsPlayer1 = hasWinner && serie.winner_player_id === match.player1?.id;

  return (
    <div className={`bg-[#000000] rounded-lg border ${statusInfo.borderColor} overflow-hidden`}>
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h4 className="text-lg font-bold text-white">Série {serie.serie_number}</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
          {statusInfo.icon} {statusInfo.label}
        </div>
      </div>

      {/* Placar - mostra quando liberada, em andamento ou encerrada */}
      {showScore && (
        <div className="p-4">
          <p className="text-gray-400 text-sm mb-2">Placar:</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">{match.player1.nickname || match.player1.name}</p>
              <p className={`text-4xl font-bold ${hasWinner && winnerIsPlayer1 ? 'text-green-500' : 'text-white'}`}>
                {serie.player1_score || 0}
              </p>
            </div>
            <div className="text-2xl font-bold text-gray-600">×</div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">{match.player2.nickname || match.player2.name}</p>
              <p className={`text-4xl font-bold ${hasWinner && !winnerIsPlayer1 ? 'text-green-500' : 'text-white'}`}>
                {serie.player2_score || 0}
              </p>
            </div>
          </div>
          
          {hasWinner && (
            <p className="text-center mt-3 text-green-500 font-semibold">
              🏆 Vencedor: {winnerIsPlayer1 ? match.player1.nickname || match.player1.name : match.player2.nickname || match.player2.name}
            </p>
          )}
          
          {serie.status === 'liberada' && !hasWinner && (
            <p className="text-center mt-3 text-green-500 font-semibold flex items-center justify-center gap-2">
              <span className="animate-pulse">🎯</span>
              <span>Placar ao vivo - Apostas abertas!</span>
            </p>
          )}
        </div>
      )}

      {/* Apostas da Série - Mostra quando liberada, em andamento ou encerrada */}
      {(serie.status === 'liberada' || serie.status === 'em_andamento' || serie.status === 'encerrada') && (
        <div className="p-4 border-t border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-lg">💰</div>
            <h5 className="text-base font-bold text-white">Apostas da Série {serie.serie_number}</h5>
          </div>
          
          {/* Grid de Apostas por Jogador */}
          <div className="space-y-3">
            {/* Apostas no Jogador 1 */}
            <div className={`border rounded-lg overflow-hidden ${
              serie.status === 'encerrada' && winnerIsPlayer1
                ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-transparent'
                : 'border-green-700/30 bg-gradient-to-br from-green-900/10 to-transparent'
            }`}>
              {/* Header do Jogador 1 */}
              <div className={`border-b px-3 py-2 ${
                serie.status === 'encerrada' && winnerIsPlayer1
                  ? 'bg-yellow-900/30 border-yellow-700/30'
                  : 'bg-green-900/20 border-green-700/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      serie.status === 'encerrada' && winnerIsPlayer1 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <p className={`text-sm font-bold ${
                      serie.status === 'encerrada' && winnerIsPlayer1 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {match.player1.nickname || match.player1.name}
                      {serie.status === 'encerrada' && winnerIsPlayer1 && (
                        <span className="ml-1 text-yellow-500">🏆</span>
                      )}
                    </p>
                  </div>
                  <p className={`text-xs font-bold ${
                    serie.status === 'encerrada' && winnerIsPlayer1 ? 'text-yellow-300' : 'text-green-300'
                  }`}>
                    Total: R$ {betsData && betsData.by_player && Object.values(betsData.by_player).find(p => p.player.id === match.player1.id)
                      ? (Object.values(betsData.by_player).find(p => p.player.id === match.player1.id).total_amount / 100).toFixed(2)
                      : '0,00'}
                  </p>
                </div>
              </div>
              
              {/* Lista de Apostas */}
              <div className="p-3 space-y-2">
                {loadingBets ? (
                  <div className="text-center py-3 text-xs text-gray-400">
                    Carregando apostas...
                  </div>
                ) : betsData && betsData.by_player && Object.values(betsData.by_player).some(p => p.player.id === match.player1.id && p.bets.length > 0) ? (
                  Object.values(betsData.by_player)
                    .filter(p => p.player.id === match.player1.id)
                    .flatMap(p => p.bets)
                    .map((bet, index) => (
                      <BetItem 
                        key={bet.id}
                        bet={{ 
                          label: `Aposta #${index + 1}`, 
                          amount: bet.amount / 100, // Convertendo centavos para reais
                          status: bet.status 
                        }} 
                        isWinner={serie.status === 'encerrada' && winnerIsPlayer1}
                      />
                    ))
                ) : (
                  <div className="text-center py-4 bg-[#1a1a1a]/50 rounded-lg border border-dashed border-gray-700">
                    <p className="text-xs text-gray-500">Nenhuma aposta ainda</p>
                  </div>
                )}
              </div>
            </div>

            {/* Apostas no Jogador 2 */}
            <div className={`border rounded-lg overflow-hidden ${
              serie.status === 'encerrada' && !winnerIsPlayer1 && hasWinner
                ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-transparent'
                : 'border-blue-700/30 bg-gradient-to-br from-blue-900/10 to-transparent'
            }`}>
              {/* Header do Jogador 2 */}
              <div className={`border-b px-3 py-2 ${
                serie.status === 'encerrada' && !winnerIsPlayer1 && hasWinner
                  ? 'bg-yellow-900/30 border-yellow-700/30'
                  : 'bg-blue-900/20 border-blue-700/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      serie.status === 'encerrada' && !winnerIsPlayer1 && hasWinner ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <p className={`text-sm font-bold ${
                      serie.status === 'encerrada' && !winnerIsPlayer1 && hasWinner ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {match.player2.nickname || match.player2.name}
                      {serie.status === 'encerrada' && !winnerIsPlayer1 && hasWinner && (
                        <span className="ml-1 text-yellow-500">🏆</span>
                      )}
                    </p>
                  </div>
                  <p className={`text-xs font-bold ${
                    serie.status === 'encerrada' && !winnerIsPlayer1 && hasWinner ? 'text-yellow-300' : 'text-blue-300'
                  }`}>
                    Total: R$ {betsData && betsData.by_player && Object.values(betsData.by_player).find(p => p.player.id === match.player2.id)
                      ? (Object.values(betsData.by_player).find(p => p.player.id === match.player2.id).total_amount / 100).toFixed(2)
                      : '0,00'}
                  </p>
                </div>
              </div>
              
              {/* Lista de Apostas */}
              <div className="p-3 space-y-2">
                {loadingBets ? (
                  <div className="text-center py-3 text-xs text-gray-400">
                    Carregando apostas...
                  </div>
                ) : betsData && betsData.by_player && Object.values(betsData.by_player).some(p => p.player.id === match.player2.id && p.bets.length > 0) ? (
                  Object.values(betsData.by_player)
                    .filter(p => p.player.id === match.player2.id)
                    .flatMap(p => p.bets)
                    .map((bet, index) => (
                      <BetItem 
                        key={bet.id}
                        bet={{ 
                          label: `Aposta #${index + 1}`, 
                          amount: bet.amount / 100, // Convertendo centavos para reais
                          status: bet.status 
                        }} 
                        isWinner={serie.status === 'encerrada' && !winnerIsPlayer1 && hasWinner}
                      />
                    ))
                ) : (
                  <div className="text-center py-4 bg-[#1a1a1a]/50 rounded-lg border border-dashed border-gray-700">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <span>💤</span>
                      <span>Nenhuma aposta ainda</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status - sempre mostra */}
      <div className="p-4">
        {serie.status === 'pendente' && (
          <div className="text-center py-2 text-gray-500 text-sm">⏳ Aguardando liberação</div>
        )}
        {serie.status === 'liberada' && (
          <div className="text-center py-2 text-green-400 text-sm font-semibold">🟢 Série liberada para apostas</div>
        )}
        {serie.status === 'em_andamento' && (
          <div className="text-center py-2 text-blue-400 text-sm font-semibold">🔵 Série em andamento</div>
        )}
        {serie.status === 'encerrada' && (
          <div className="text-center py-2 text-[#28E404] text-sm font-semibold">✅ Série encerrada</div>
        )}
        {serie.status === 'cancelada' && (
          <div className="text-center py-2 text-red-500 text-sm font-semibold">❌ Série cancelada</div>
        )}
      </div>
    </div>
  );
}

// Seção de Aposta (estilo VAGBET)
function BettingSection({ serie, match, onOpenLoginModal, onOpenDepositModal }) {
  const { user, authenticated } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [amount, setAmount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) {
      setWalletLoading(false);
      return;
    }

    const fetchWallet = async () => {
      try {
        setWalletLoading(true);
        const walletData = await api.wallet.get();
        setWallet(walletData.wallet);
      } catch (err) {
        console.error('Erro ao buscar carteira:', err);
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWallet();
  }, [authenticated]);

  const addAmount = (value) => {
    const currentAmount = parseFloat(amount) || 0;
    setAmount((currentAmount + value).toFixed(2));
  };

  const clearAmount = () => {
    setAmount('10');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPlayer) {
      toast.error('Selecione um jogador');
      return;
    }

    const amountInCents = parseInt(parseFloat(amount) * 100);
    
    if (amountInCents < 1000) {
      toast.error('Valor mínimo de aposta: R$ 10,00');
      return;
    }

    if (wallet && amountInCents > wallet.balance) {
      toast.error('Saldo insuficiente');
      return;
    }

    try {
      setLoading(true);
      await api.bets.create({
        serie_id: serie.id,
        chosen_player_id: selectedPlayer,
        amount: amountInCents
      });
      toast.success('🎉 Aposta realizada com sucesso!');
      
      // Aguardar 1.5s para mostrar o toast antes de recarregar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Erro ao criar aposta:', err);
      toast.error(err.message || 'Erro ao criar aposta');
      setLoading(false);
    }
  };

  // Validações
  const amountInCents = amount ? parseInt(parseFloat(amount) * 100) : 0;
  const hasInsufficientBalance = wallet && amountInCents > wallet.balance;
  const potentialReturn = amountInCents * 2;

  return (
    <div className="bg-[#0a0a0a] rounded-lg border border-gray-800 overflow-hidden">
      {/* Header compacto */}
      <div className="px-4 py-3 border-b border-gray-800 bg-[#111]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">🎯 Fazer Aposta</h3>
            <p className="text-xs text-gray-500">Série {serie.serie_number}</p>
          </div>
          <div className="px-3 py-1 bg-[#27E502] rounded-full">
            <span className="text-xs font-semibold text-black">LIBERADA</span>
          </div>
        </div>
      </div>

      {/* Mensagem se não estiver autenticado */}
      {!authenticated ? (
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="text-5xl mb-3">🔒</div>
            <h4 className="text-lg font-bold text-white mb-2">Login Necessário</h4>
            <p className="text-gray-400 text-sm mb-4">
              Você precisa estar logado para fazer apostas
            </p>
          </div>
          <button
            onClick={onOpenLoginModal}
            className="w-full py-3 bg-[#27E502] hover:bg-[#22C002] text-black font-bold rounded-lg transition-all"
          >
            Fazer Login
          </button>
        </div>
      ) : walletLoading ? (
        <div className="p-6 text-center">
          <div className="text-4xl mb-2">⏳</div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Seleção de Jogador - Estilo VAGBET */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Escolha o vencedor:</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedPlayer(match.player1.id)}
              className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                selectedPlayer === match.player1.id
                  ? 'border-green-500 bg-green-900/30 text-white'
                  : 'border-gray-700 bg-[#1a1a1a] text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="text-center">
                <p className="font-bold text-sm">{match.player1.nickname || match.player1.name}</p>
                {match.player1.win_rate && (
                  <p className="text-xs mt-1 opacity-75">Taxa: {formatPercent(match.player1.win_rate)}</p>
                )}
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedPlayer(match.player2.id)}
              className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                selectedPlayer === match.player2.id
                  ? 'border-green-500 bg-green-900/30 text-white'
                  : 'border-gray-700 bg-[#1a1a1a] text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="text-center">
                <p className="font-bold text-sm">{match.player2.nickname || match.player2.name}</p>
                {match.player2.win_rate && (
                  <p className="text-xs mt-1 opacity-75">Taxa: {formatPercent(match.player2.win_rate)}</p>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Valor da Aposta */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm font-semibold text-gray-300">Valor de sua aposta:</label>
            {wallet && (
              <span className="text-xs text-gray-500">
                Saldo: <span className="text-green-500 font-semibold">{formatMoney(wallet.balance)}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-2">(mínimo R$ 10,00)</p>
          
          {/* Input de Valor */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
            <input
              type="number"
              step="0.01"
              min="10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border rounded-lg text-white text-lg font-bold focus:ring-2 focus:border-transparent ${
                hasInsufficientBalance 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-700 focus:ring-green-500'
              }`}
            />
          </div>

          {/* Alerta de Saldo Insuficiente */}
          {hasInsufficientBalance && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-3">
              <p className="text-red-400 text-sm font-semibold text-center mb-3 flex items-center justify-center gap-2">
                ⚠️ Saldo insuficiente! Você tem apenas {formatMoney(wallet.balance)}
              </p>
              <button
                type="button"
                onClick={onOpenDepositModal}
                className="w-full py-2 bg-[#27E502] hover:bg-[#22C002] text-black font-bold rounded-lg transition-all"
              >
                💳 Depositar
              </button>
            </div>
          )}

          {/* Botões de Atalho - Estilo VAGBET */}
          <div className="grid grid-cols-6 gap-2">
            <button
              type="button"
              onClick={() => addAmount(10)}
              className="py-2 px-2 bg-[#1a1a1a] border border-gray-700 rounded text-xs font-semibold text-white hover:border-blue-500 hover:bg-blue-900/30 transition-all"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => addAmount(50)}
              className="py-2 px-2 bg-[#1a1a1a] border border-gray-700 rounded text-xs font-semibold text-white hover:border-blue-500 hover:bg-blue-900/30 transition-all"
            >
              +50
            </button>
            <button
              type="button"
              onClick={() => addAmount(100)}
              className="py-2 px-2 bg-[#1a1a1a] border border-gray-700 rounded text-xs font-semibold text-white hover:border-blue-500 hover:bg-blue-900/30 transition-all"
            >
              +100
            </button>
            <button
              type="button"
              onClick={() => addAmount(500)}
              className="py-2 px-2 bg-[#1a1a1a] border border-gray-700 rounded text-xs font-semibold text-white hover:border-blue-500 hover:bg-blue-900/30 transition-all"
            >
              +500
            </button>
            <button
              type="button"
              onClick={() => addAmount(1000)}
              className="py-2 px-1 bg-[#1a1a1a] border border-gray-700 rounded text-xs font-semibold text-white hover:border-blue-500 hover:bg-blue-900/30 transition-all"
            >
              +1.000
            </button>
            <button
              type="button"
              onClick={clearAmount}
              className="py-2 px-2 bg-red-900/30 border border-red-700 rounded text-xs font-semibold text-red-400 hover:bg-red-900/50 transition-all"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Botão de Apostar - Estilo VAGBET */}
        <button
          type="submit"
          disabled={!selectedPlayer || !amount || parseFloat(amount) < 10 || loading || hasInsufficientBalance}
          className="w-full py-4 bg-[#27E502] hover:bg-[#22C002] text-black font-bold text-lg rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? 'Processando...' : hasInsufficientBalance ? 'Saldo Insuficiente' : 'Apostar'}
        </button>

        {/* Ganho Potencial - Destaque em Amarelo (estilo VAGBET) */}
        {amount && parseFloat(amount) >= 10 && selectedPlayer && !hasInsufficientBalance && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
            <p className="text-yellow-400 text-sm font-semibold text-center">
              Em caso de vitória e emparceiramento seu ganho será de:{' '}
              <span className="text-yellow-300 font-bold text-lg">{formatMoney(potentialReturn)}</span>
            </p>
          </div>
        )}
      </form>
      )}
    </div>
  );
}
