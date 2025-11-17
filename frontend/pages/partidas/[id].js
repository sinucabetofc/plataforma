/**
 * ============================================================
 * Página: /partidas/[id]
 * Descrição: Detalhes completos da partida + apostas
 * ============================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { getYouTubeEmbedUrl } from '../../utils/youtube';
import { 
  formatDate, 
  formatTime, 
  formatMoney,
  formatCurrency, 
  formatMatchStatus,
  formatPercent 
} from '../../utils/formatters';
import SEO, { getEventSchema, getBreadcrumbSchema } from '../../components/SEO';
import AuthModal from '../../components/AuthModal';
import DepositModal from '../../components/DepositModal';
import ConfirmModal from '../../components/ConfirmModal';
import AnimatedScore from '../../components/AnimatedScore';
import ScoreNotification from '../../components/ScoreNotification';
import { Trophy } from 'lucide-react';

// Componente de Fallback para erros do YouTube
function YoutubeErrorFallback({ youtubeUrl, onRetry }) {
  return (
    <div className="aspect-video bg-gradient-to-br from-red-900/20 via-[#0a0a0a] to-[#000000] flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Ícone */}
        <div className="text-6xl mb-4">📺</div>
        
        {/* Título */}
        <h3 className="text-xl font-bold text-white mb-2">
          Vídeo com Restrição de Incorporação
        </h3>
        
        {/* Descrição */}
        <p className="text-gray-400 text-sm mb-6">
          Este vídeo não pode ser exibido aqui devido às configurações de privacidade do proprietário no YouTube.
        </p>
        
        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Botão principal: Abrir no YouTube */}
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all shadow-lg"
          >
            <span>▶️</span>
            <span>Assistir no YouTube</span>
            <span>↗</span>
          </a>
          
          {/* Botão secundário: Tentar novamente */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
            >
              <span>🔄</span>
              <span>Tentar Novamente</span>
            </button>
          )}
        </div>
        
        {/* Dica */}
        <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <p className="text-yellow-400 text-xs flex items-center justify-center gap-2">
            <span>💡</span>
            <span>O proprietário do vídeo desativou a incorporação. Assista diretamente no YouTube.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PartidaDetalhesPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, authenticated } = useAuth();
  
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [youtubeError, setYoutubeError] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isInitialFetch = true;

    const fetchMatchDetails = async () => {
      try {
        // Só mostra loading na primeira vez
        if (isInitialFetch) {
          setLoading(true);
        }
        const matchData = await api.matches.getById(id);
        setMatch(matchData);
      } catch (err) {
        console.error('Erro ao buscar partida:', err);
        setError(err.message || 'Erro ao carregar partida');
      } finally {
        if (isInitialFetch) {
          setLoading(false);
          isInitialFetch = false;
        }
      }
    };

    fetchMatchDetails();

    // Atualização automática a cada 3 segundos para placar ao vivo
    const interval = setInterval(() => {
      fetchMatchDetails();
    }, 3000);

    return () => clearInterval(interval);
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
  // Busca série atual (liberada ou em andamento) para exibir componente de apostas
  // Apostas só serão permitidas se status = 'liberada'
  const currentSerie = match?.series?.find(s => s.status === 'liberada' || s.status === 'em_andamento');

  // SEO e Structured Data
  const matchTitle = `${match.player1?.name || 'Jogador 1'} vs ${match.player2?.name || 'Jogador 2'}`;
  const matchDescription = `Partida de sinuca entre ${match.player1?.name || 'Jogador 1'} e ${match.player2?.name || 'Jogador 2'}. Acompanhe ao vivo e faça suas apostas na SinucaBet!`;
  const matchUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const eventSchema = getEventSchema(match);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Início', url: 'https://sinucabet.com.br/home' },
    { name: 'Partidas', url: 'https://sinucabet.com.br/partidas' },
    { name: matchTitle, url: matchUrl },
  ]);

  const structuredData = [eventSchema, breadcrumbSchema].filter(Boolean);

  return (
    <>
      <SEO
        title={matchTitle}
        description={matchDescription}
        keywords={`${match.player1?.name}, ${match.player2?.name}, sinuca, apostas sinuca, partida sinuca, sinuca ao vivo, ${matchTitle}`}
        url={matchUrl}
        type="website"
        structuredData={structuredData}
      />

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
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                    match.status === 'agendada' 
                      ? 'bg-blue-500/20 border-blue-500' 
                      : match.status === 'em_andamento'
                      ? 'bg-red-500/20 border-red-500 animate-pulse'
                      : match.status === 'finalizada'
                      ? 'bg-verde-neon/20 border-verde-neon'
                      : 'bg-gray-500/20 border-gray-500'
                  }`}>
                    <div className={
                      match.status === 'agendada' 
                        ? 'text-blue-400' 
                        : match.status === 'em_andamento'
                        ? 'text-red-400'
                        : match.status === 'finalizada'
                        ? 'text-verde-neon'
                        : 'text-gray-400'
                    }>{formatMatchStatus(match.status).icon}</div>
                    <span className={`text-sm font-semibold ${
                      match.status === 'agendada' 
                        ? 'text-blue-300' 
                        : match.status === 'em_andamento'
                        ? 'text-red-300'
                        : match.status === 'finalizada'
                        ? 'text-verde-neon'
                        : 'text-gray-300'
                    }`}>{formatMatchStatus(match.status).label}</span>
                  </div>
                  
                  {match.game_rules?.game_type && (
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      match.game_rules.game_type === 'NUMERADA' 
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500' 
                        : match.game_rules.game_type === 'LISA'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                        : 'bg-orange-500/20 text-orange-300 border-orange-500'
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
                  <p className="text-sm text-gray-400">({match.player1.nickname})</p>
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
                  <p className="text-sm text-gray-400">({match.player2.nickname})</p>
                )}
              </div>
            </div>

            {/* Vantagens */}
            {match.game_rules && (match.game_rules.advantages || match.game_rules.points_to_win) && (
              <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg border border-yellow-500/30">
                <p className="text-sm font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                  ⭐ Vantagens:
                </p>
                <ul className="text-sm text-yellow-100 space-y-1 list-disc list-inside">
                  {match.game_rules.advantages && (
                    Array.isArray(match.game_rules.advantages) ? (
                      match.game_rules.advantages.map((advantage, idx) => (
                        <li key={idx}>{advantage}</li>
                      ))
                    ) : (
                      <li>{match.game_rules.advantages}</li>
                    )
                  )}
                  {match.game_rules.points_to_win && (
                    <li>Jogo até {match.game_rules.points_to_win} pontos</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* YouTube Player com Fallback */}
          {match.youtube_url && (
            <div className="mb-6">
              <div className="bg-[#000000] rounded-lg overflow-hidden border border-gray-800">
                {!youtubeError ? (
                  <>
                    <div className="aspect-video relative bg-black">
                      <iframe
                        src={getYouTubeEmbedUrl(match.youtube_url, { 
                          autoplay: true, 
                          mute: false, 
                          controls: true 
                        })}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onError={() => setYoutubeError(true)}
                      />
                    </div>
                    <div className="p-3 bg-red-900/20 border-t border-red-800">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-red-400 text-sm font-semibold flex items-center gap-2">
                          <span className="animate-pulse">🔴</span>
                          Transmissão ao vivo
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setYoutubeError(true)}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-gray-800"
                            title="Vídeo não carrega? Clique aqui"
                          >
                            ⚠️ Vídeo com erro?
                          </button>
                          <button
                            onClick={() => window.open(match.youtube_url, '_blank')}
                            className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800"
                          >
                            Abrir no YouTube ↗
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <YoutubeErrorFallback 
                    youtubeUrl={match.youtube_url}
                    onRetry={() => setYoutubeError(false)}
                  />
                )}
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
                <SerieCard key={serie.id} serie={serie} match={match} currentUserId={user?.id} />
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
        onClose={() => {
          setShowDepositModal(false);
          setPixData(null);
          setTransactionId(null);
        }}
        onDeposit={async (amount) => {
          try {
            const result = await api.wallet.deposit({ amount });
            if (result.success) {
              toast.success('QR Code gerado! Aguardando pagamento...');
              setPixData(result.data.pix);
              setTransactionId(result.data.transaction_id);
            }
          } catch (error) {
            toast.error('Erro ao criar depósito');
          }
        }}
        pixData={pixData}
        transactionId={transactionId}
        onPaymentSuccess={() => {
          setPixData(null);
          setTransactionId(null);
          window.location.reload();
        }}
      />
    </>
  );
}

// Componente de Aposta Individual (reutilizável e responsivo)
function BetItem({ bet, isWinner, onCancel, canCancel = false, playerName = '' }) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    try {
      setCancelling(true);
      await onCancel(bet.id);
      toast.success('Aposta cancelada com sucesso!');
      setShowCancelModal(false);
    } catch (err) {
      console.error('Erro ao cancelar aposta:', err);
      toast.error(err.message || 'Erro ao cancelar aposta');
    } finally {
      setCancelling(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  // Calcular matching fracionado
  const matchedAmount = bet.matched_amount || 0;
  const remainingAmount = bet.remaining_amount || 0;
  const matchPercentage = bet.match_percentage || 
    (bet.amount > 0 && matchedAmount > 0 ? Math.round((matchedAmount / (bet.amount * 100)) * 100) : 0);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pendente':
        return {
          icon: '⏳',
          label: 'AGUARDANDO',
          borderColor: 'border-yellow-500/50',
          bgColor: 'bg-yellow-900/10',
          messageColor: 'text-yellow-400',
          message: '⏰ Aguardando emparceiramento com aposta oposta'
        };
      case 'parcialmente_aceita':
        return {
          icon: '🔄',
          label: 'PARCIAL',
          borderColor: 'border-orange-500',
          bgColor: 'bg-orange-900/20',
          messageColor: 'text-orange-400',
          message: `🔄 Aposta parcialmente casada (${matchPercentage}%)`
        };
      case 'aceita':
        return {
          icon: '🤝',
          label: 'CASADA',
          borderColor: 'border-blue-500',
          bgColor: 'bg-blue-900/20',
          messageColor: 'text-blue-400',
          message: '🤝 Aposta casada com sucesso! Aguarde o resultado da série'
        };
      case 'ganha':
        const totalWin = bet.actual_return 
          ? bet.actual_return / 100 
          : (matchedAmount / 100) * 2 + (remainingAmount / 100);
        
        const winMessage = matchPercentage < 100 && matchPercentage > 0
          ? `🎉 Parabéns! Ganhou R$ ${((matchedAmount / 100) * 2).toFixed(2)} + R$ ${(remainingAmount / 100).toFixed(2)} de reembolso = ${formatCurrency(totalWin)}`
          : `🎉 Parabéns! Você ganhou ${formatCurrency(totalWin)} apostando R$ ${bet.amount.toFixed(2)}!`;
        
        return {
          icon: '🎉',
          label: 'GANHOU',
          borderColor: 'border-verde-neon',
          bgColor: 'bg-verde-neon/10',
          messageColor: 'text-verde-neon',
          message: winMessage
        };
      case 'perdida':
        const lossMessage = remainingAmount > 0
          ? `💔 Perdeu R$ ${(matchedAmount / 100).toFixed(2)} • Reembolso: R$ ${(remainingAmount / 100).toFixed(2)}`
          : `💔 Infelizmente você perdeu R$ ${(matchedAmount / 100).toFixed(2)} nesta aposta`;
        
        return {
          icon: '😭',
          label: 'PERDEU',
          borderColor: 'border-red-500',
          bgColor: 'bg-red-900/20',
          messageColor: 'text-red-400',
          message: lossMessage
        };
      case 'cancelada':
        return {
          icon: '🚫',
          label: 'Cancelada',
          borderColor: 'border-gray-500/50',
          bgColor: 'bg-gray-900/10',
          messageColor: 'text-gray-400',
          message: '❌ Aposta cancelada'
        };
      case 'reembolsada':
        return {
          icon: '💰',
          label: 'Reembolsada',
          borderColor: 'border-purple-500/50',
          bgColor: 'bg-purple-900/10',
          messageColor: 'text-purple-400',
          message: '💵 Valor reembolsado'
        };
      default:
        return {
          icon: '❓',
          label: 'Desconhecido',
          borderColor: 'border-gray-500/50',
          bgColor: 'bg-gray-900/10',
          messageColor: 'text-gray-400',
          message: 'Status desconhecido'
        };
    }
  };

  const config = getStatusConfig(bet.status || 'pendente');

  // Para apostas ganhas/perdidas, mostrar visual especial focado no resultado
  if (bet.status === 'ganha' || bet.status === 'perdida') {
    return (
      <div className={`rounded-lg overflow-hidden border-2 transition-all ${config.borderColor} ${config.bgColor}`}>
        <div className="p-4">
          {/* Resultado Principal */}
          <div className="text-center mb-3">
            <div className="text-4xl mb-2">{config.icon}</div>
            <p className={`text-lg font-bold ${config.messageColor} mb-1`}>
              {bet.status === 'ganha' ? 'VOCÊ GANHOU!' : 'VOCÊ PERDEU'}
            </p>
            {playerName && (
              <p className="text-xs text-gray-400 mb-2">
                Apostou em: <span className="text-white font-semibold">{playerName}</span>
              </p>
            )}
          </div>

          {/* Valor */}
          <div className={`p-3 rounded-lg ${
            bet.status === 'ganha' 
              ? 'bg-verde-neon/10 border border-verde-neon/30' 
              : 'bg-red-900/20 border border-red-500/30'
          }`}>
            <p className="text-center">
              <span className={`text-2xl font-bold ${
                bet.status === 'ganha' ? 'text-verde-neon' : 'text-red-400'
              }`}>
                {bet.status === 'ganha' ? '+' : '-'} R$ {
                  bet.status === 'ganha' 
                    ? bet.amount.toFixed(2)
                    : (matchedAmount / 100).toFixed(2)
                }
              </span>
            </p>
            
            {/* Detalhes para aposta ganha */}
            {bet.status === 'ganha' && (
              <div className="mt-2">
                <p className="text-center text-xs text-verde-accent font-semibold">
                  Ganho: {formatCurrency(
                    bet.actual_return 
                      ? bet.actual_return / 100 
                      : (matchedAmount / 100) * 2 + (remainingAmount / 100)
                  )}
              </p>
                
                {/* Se foi parcial, mostrar breakdown */}
                {matchPercentage < 100 && matchPercentage > 0 && remainingAmount > 0 && (
                  <div className="mt-2 pt-2 border-t border-verde-neon/20">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>💰 Ganho (R$ {(matchedAmount / 100).toFixed(2)} × 2):</span>
                      <span className="text-verde-accent font-semibold">R$ {((matchedAmount / 100) * 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>💵 Reembolso (não casado):</span>
                      <span className="text-verde-accent font-semibold">R$ {(remainingAmount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Detalhes para aposta perdida com reembolso */}
            {bet.status === 'perdida' && remainingAmount > 0 && (
              <div className="mt-2 pt-2 border-t border-red-500/20">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>💔 Perdeu (casado):</span>
                  <span className="text-red-400 font-semibold">R$ {(matchedAmount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>💵 Reembolso (não casado):</span>
                  <span className="text-verde-accent font-semibold">R$ {(remainingAmount / 100).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Mensagem */}
          <p className={`text-xs ${config.messageColor} text-center mt-3`}>
            {config.message}
          </p>
        </div>
      </div>
    );
  }

  // Para outros status, mostrar formato normal
  return (
    <div className={`rounded-lg overflow-hidden border-2 transition-all ${config.borderColor} ${config.bgColor}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 gap-2">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <span className="text-base">{config.icon}</span>
          <span className="text-xs font-medium text-gray-300">{bet.label}</span>
          {bet.isMyBet && (
            <span className="px-2.5 py-1 bg-verde-neon/30 border-2 border-verde-neon/60 rounded-full text-[10px] font-black text-verde-neon uppercase shadow-lg shadow-verde-neon/20">
              ⭐ Minha aposta
          </span>
          )}
        </div>
        <span className={`text-sm font-bold ${bet.status === 'perdida' ? 'text-red-400' : 'text-white'}`}>
          {bet.status === 'perdida' ? '-' : ''} R$ {
            bet.status === 'perdida' 
              ? (matchedAmount / 100).toFixed(2)
              : bet.amount.toFixed(2)
          }
        </span>
      </div>
      <div className="px-3 pb-2">
        <p className={`text-[10px] ${config.messageColor} flex items-center gap-1`}>
          <span>{config.message}</span>
        </p>
        
        {/* Barra de Progresso para Parcialmente Aceita */}
        {(bet.status === 'parcialmente_aceita' || matchPercentage > 0) && matchPercentage < 100 && (
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-400 h-full transition-all duration-500"
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
            <p className="text-[9px] text-gray-400 mt-1">
              R$ {(matchedAmount / 100).toFixed(2)} casado de R$ {bet.amount.toFixed(2)} ({matchPercentage}%)
            </p>
          </div>
        )}
        
        {/* Botão Cancelar - mostra valor reembolsável */}
        {canCancel && (bet.status === 'pendente' || bet.status === 'parcialmente_aceita') && remainingAmount > 0 && (
          <button
            onClick={handleCancelClick}
            disabled={cancelling}
            className="mt-2 w-full py-2 px-3 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-400 text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelling ? '⏳ Cancelando...' : `🚫 Cancelar (Reembolso: R$ ${(remainingAmount / 100).toFixed(2)})`}
          </button>
        )}

        {/* Modal de Confirmação */}
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
          title="Cancelar Aposta"
          message={
            remainingAmount > 0 && remainingAmount < bet.amount * 100
              ? `Cancelar aposta parcialmente casada?\n\nValor total: ${formatCurrency(bet.amount)}\nValor casado: ${formatCurrency(matchedAmount / 100)} (mantido)\nReembolso: ${formatCurrency(remainingAmount / 100)}`
              : `Tem certeza que deseja cancelar esta aposta de ${formatCurrency(bet.amount)}? O valor será reembolsado para sua carteira.`
          }
          confirmText="Sim, Cancelar"
          cancelText="Não, Manter"
          variant="danger"
          isLoading={cancelling}
        />
      </div>
    </div>
  );
}

// Componente de Card de Série (apenas visualização)
function SerieCard({ serie, match, currentUserId }) {
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

  // Cancelar aposta
  const handleCancelBet = async (betId) => {
    await api.bets.cancel(betId);
    // Recarregar apostas após cancelamento
    const response = await api.bets.getBySerie(serie.id);
    setBetsData(response);
    // Forçar atualização da página para sincronizar saldo
    window.location.reload();
  };

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
        {/* Se estiver em andamento, mostra "AO VIVO", senão mostra badge normal */}
        {serie.status === 'em_andamento' ? (
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-verde-neon/20 text-verde-neon border border-verde-neon animate-pulse">
            ● AO VIVO
          </div>
        ) : (
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}>
            {statusInfo.icon} {statusInfo.label}
          </div>
        )}
      </div>

      {/* Placar - mostra quando liberada, em andamento ou encerrada */}
      {showScore && (
        <div className="p-6 bg-gradient-to-b from-[#0a0a0a] to-[#000000]">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-4 text-center font-semibold">
            Placar
          </p>
          <div className="flex items-center justify-center gap-6">
            {/* Jogador 1 */}
            <div className="text-center flex-1 max-w-xs">
              {/* Foto */}
              <div className="mb-3 flex justify-center">
                <div className={`w-20 h-20 rounded-full overflow-hidden shadow-xl ${
                  hasWinner && winnerIsPlayer1 ? 'ring-4 ring-verde-neon' : 'ring-2 ring-blue-500/50'
                }`}>
                  {match.player1?.photo_url ? (
                    <img
                      src={match.player1.photo_url}
                      alt={match.player1.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white text-2xl font-bold"
                    style={{ display: match.player1?.photo_url ? 'none' : 'flex' }}
                  >
                    {(match.player1?.name || 'J')[0]}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-2 font-medium">
                {match.player1.nickname || match.player1.name}
              </p>
              <AnimatedScore 
                score={serie.player1_score || 0}
                color={hasWinner && winnerIsPlayer1 ? 'text-verde-neon' : 'text-blue-500'}
                size="text-5xl"
              />
            </div>

            {/* VS */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-verde-neon to-verde-accent flex items-center justify-center shadow-verde-glow">
                <span className="text-black font-black text-2xl">VS</span>
              </div>
            </div>

            {/* Jogador 2 */}
            <div className="text-center flex-1 max-w-xs">
              {/* Foto */}
              <div className="mb-3 flex justify-center">
                <div className={`w-20 h-20 rounded-full overflow-hidden shadow-xl ${
                  hasWinner && !winnerIsPlayer1 ? 'ring-4 ring-verde-neon' : 'ring-2 ring-purple-500/50'
                }`}>
                  {match.player2?.photo_url ? (
                    <img
                      src={match.player2.photo_url}
                      alt={match.player2.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 text-white text-2xl font-bold"
                    style={{ display: match.player2?.photo_url ? 'none' : 'flex' }}
                  >
                    {(match.player2?.name || 'J')[0]}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-2 font-medium">
                {match.player2.nickname || match.player2.name}
              </p>
              <AnimatedScore 
                score={serie.player2_score || 0}
                color={hasWinner && !winnerIsPlayer1 ? 'text-verde-neon' : 'text-purple-500'}
                size="text-5xl"
              />
            </div>
          </div>

          {/* Notificação interativa de pontos */}
          {(serie.status === 'em_andamento' || serie.status === 'liberada') && !hasWinner && (
            <ScoreNotification
              player1Score={serie.player1_score || 0}
              player2Score={serie.player2_score || 0}
              player1Name={match.player1.nickname || match.player1.name}
              player2Name={match.player2.nickname || match.player2.name}
              isLive={true}
            />
          )}
          
          {hasWinner && (
            <div className="mt-6 p-4 bg-verde-neon/10 border-2 border-verde-neon rounded-lg">
              <p className="text-center text-verde-neon font-bold text-lg flex items-center justify-center gap-2">
                <Trophy size={24} />
                Vencedor: {winnerIsPlayer1 ? match.player1.nickname || match.player1.name : match.player2.nickname || match.player2.name}
              </p>
            </div>
          )}
          
          {serie.status === 'liberada' && !hasWinner && (
            <div className="mt-4 p-3 bg-verde-neon/5 border border-verde-neon/30 rounded-lg">
              <p className="text-center text-verde-accent font-semibold flex items-center justify-center gap-2">
                <span className="animate-pulse">🎯</span>
                <span>Placar ao vivo - Apostas abertas!</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Apostas da Série */}
      {(serie.status === 'liberada' || serie.status === 'em_andamento' || serie.status === 'encerrada') && (
        <div className="p-4 border-t border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-lg">💰</div>
            <h5 className="text-base font-bold text-white">
              {serie.status === 'encerrada' ? 'Suas Apostas' : 'Apostas da Série'} - Série {serie.serie_number}
            </h5>
          </div>
          
          {loadingBets ? (
            <div className="text-center py-6 text-gray-400">
              <div className="text-4xl mb-2">⏳</div>
              <p className="text-sm">Carregando apostas...</p>
            </div>
          ) : betsData && betsData.all_bets ? (
            (() => {
              // Se série ENCERRADA: mostrar apenas apostas do usuário com resultado
              if (serie.status === 'encerrada' && currentUserId) {
                const userBets = betsData.all_bets.filter(bet => 
                  bet.user_id === currentUserId && 
                  bet.status !== 'cancelada' && 
                  bet.status !== 'reembolsada'
                );

                if (userBets.length === 0) {
                  return (
                    <div className="text-center py-6 bg-[#1a1a1a]/50 rounded-lg border border-dashed border-gray-700">
                      <p className="text-sm text-gray-500">Você não apostou nesta série</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {userBets.map((bet, index) => {
                      const playerName = bet.chosen_player?.nickname || bet.chosen_player?.name || 'Jogador';
                      
                      return (
                        <BetItem 
                          key={bet.id}
                          bet={{ 
                            id: bet.id,
                            label: `Sua Aposta #${index + 1}`, 
                            amount: bet.amount / 100,
                            matched_amount: bet.matched_amount || 0,
                            remaining_amount: bet.remaining_amount || 0,
                            match_percentage: bet.match_percentage || 0,
                            status: bet.status 
                          }} 
                          isWinner={bet.status === 'ganha'}
                          onCancel={handleCancelBet}
                          canCancel={false}
                          playerName={playerName}
                        />
                      );
                    })}
                  </div>
                );
              }

              // Se série LIBERADA/EM_ANDAMENTO: mostrar TODAS as apostas (para facilitar emparceiramento)
              return (
          <div className="space-y-3">
            {/* Apostas no Jogador 1 */}
                  <div className="border border-green-700/30 bg-gradient-to-br from-green-900/10 to-transparent rounded-lg overflow-hidden">
                    <div className="border-b px-3 py-2 bg-green-900/20 border-green-700/30">
                  <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-sm font-bold text-green-400">
                      {match.player1.nickname || match.player1.name}
                  </p>
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                      {betsData.by_player && Object.values(betsData.by_player).some(p => 
                    p.player.id === match.player1.id && 
                    p.bets.some(bet => bet.status !== 'cancelada' && bet.status !== 'reembolsada')
                  ) ? (
                  Object.values(betsData.by_player)
                    .filter(p => p.player.id === match.player1.id)
                    .flatMap(p => p.bets)
                          .filter(bet => bet.status !== 'cancelada' && bet.status !== 'reembolsada')
                    .map((bet, index) => {
                            const canCancel = bet.user_id === currentUserId;
                            const playerName = match.player1.nickname || match.player1.name;
                      
                      return (
                        <BetItem 
                          key={bet.id}
                          bet={{ 
                            id: bet.id,
                            label: `Aposta #${index + 1}`, 
                                  amount: bet.amount / 100,
                                  matched_amount: bet.matched_amount || 0,
                                  remaining_amount: bet.remaining_amount || 0,
                                  match_percentage: bet.match_percentage || 0,
                                  status: bet.status,
                                  isMyBet: bet.user_id === currentUserId
                          }} 
                                isWinner={false}
                          onCancel={handleCancelBet}
                          canCancel={canCancel}
                                playerName={playerName}
                        />
                      );
                    })
                ) : (
                  <div className="text-center py-4 bg-[#1a1a1a]/50 rounded-lg border border-dashed border-gray-700">
                    <p className="text-xs text-gray-500">Nenhuma aposta ainda</p>
                  </div>
                )}
              </div>
            </div>

            {/* Apostas no Jogador 2 */}
                  <div className="border border-blue-700/30 bg-gradient-to-br from-blue-900/10 to-transparent rounded-lg overflow-hidden">
                    <div className="border-b px-3 py-2 bg-blue-900/20 border-blue-700/30">
                  <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm font-bold text-blue-400">
                      {match.player2.nickname || match.player2.name}
                  </p>
                </div>
              </div>
              
              <div className="p-3 space-y-2">
                      {betsData.by_player && Object.values(betsData.by_player).some(p => 
                    p.player.id === match.player2.id && 
                    p.bets.some(bet => bet.status !== 'cancelada' && bet.status !== 'reembolsada')
                  ) ? (
                  Object.values(betsData.by_player)
                    .filter(p => p.player.id === match.player2.id)
                    .flatMap(p => p.bets)
                          .filter(bet => bet.status !== 'cancelada' && bet.status !== 'reembolsada')
                    .map((bet, index) => {
                            const canCancel = bet.user_id === currentUserId;
                            const playerName = match.player2.nickname || match.player2.name;
                      
                      return (
                        <BetItem 
                          key={bet.id}
                          bet={{ 
                            id: bet.id,
                            label: `Aposta #${index + 1}`, 
                                  amount: bet.amount / 100,
                                  matched_amount: bet.matched_amount || 0,
                                  remaining_amount: bet.remaining_amount || 0,
                                  match_percentage: bet.match_percentage || 0,
                                  status: bet.status,
                                  isMyBet: bet.user_id === currentUserId
                          }} 
                                isWinner={false}
                          onCancel={handleCancelBet}
                          canCancel={canCancel}
                                playerName={playerName}
                        />
                      );
                    })
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
              );
            })()
          ) : (
            <div className="text-center py-6 bg-[#1a1a1a]/50 rounded-lg border border-dashed border-gray-700">
              <p className="text-sm text-gray-500">Carregando...</p>
            </div>
          )}
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
    
    // 🔍 DEBUG: Verificar valor sendo enviado
    console.log('🎯 [FRONTEND] Valor digitado:', amount);
    console.log('🎯 [FRONTEND] Valor em centavos:', amountInCents);
    
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
      
      const betPayload = {
        serie_id: serie.id,
        chosen_player_id: selectedPlayer,
        amount: amountInCents
      };
      
      console.log('🎯 [FRONTEND] Enviando para API:', betPayload);
      
      await api.bets.create(betPayload);
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
          <div className={`px-3 py-1 rounded-full ${
            serie.status === 'em_andamento' 
              ? 'bg-red-500/20 border border-red-500 animate-pulse' 
              : 'bg-[#27E502]'
          }`}>
            <span className={`text-xs font-semibold ${
              serie.status === 'em_andamento' ? 'text-red-400' : 'text-black'
            }`}>
              {serie.status === 'em_andamento' ? '● AO VIVO' : 'LIBERADA'}
            </span>
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


