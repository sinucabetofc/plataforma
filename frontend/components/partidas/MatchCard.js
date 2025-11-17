/**
 * ============================================================
 * MatchCard - Card de Partida
 * ============================================================
 */

import Link from 'next/link';
import { formatDate, formatTime, formatMatchStatus, formatPercent } from '../../utils/formatters';

export default function MatchCard({ match }) {
  const statusInfo = formatMatchStatus(match.status);
  const scheduledDate = new Date(match.scheduled_at);
  const isLive = match.status === 'em_andamento';
  const isFinished = match.status === 'finalizada';

  return (
    <Link href={`/partidas/${match.id}`}>
      <div className={`
        bg-[#000000] rounded-lg shadow-md hover:shadow-xl 
        transition-all duration-300 cursor-pointer
        border-2 border-gray-800 hover:border-green-600
        ${isLive ? 'animate-pulse-slow' : ''}
      `}>
        {/* Header do Card */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex justify-between items-center mb-3">
            {/* Badge de Status */}
            <span className={`
              px-3 py-1 rounded-full text-xs font-semibold border
              flex items-center gap-1
              ${match.status === 'agendada' 
                ? 'bg-blue-500/20 text-blue-300 border-blue-500' 
                : match.status === 'em_andamento'
                ? 'bg-red-500/20 text-red-300 border-red-500 animate-pulse'
                : match.status === 'finalizada'
                ? 'bg-verde-neon/20 text-verde-neon border-verde-neon'
                : 'bg-gray-500/20 text-gray-300 border-gray-500'
              }
            `}>
              <span>{statusInfo.icon}</span>
              {statusInfo.label}
            </span>

            {/* Sport */}
            <span className="text-xs text-gray-400 uppercase font-medium">
              {match.sport === 'sinuca' ? '🎱 Sinuca' : '⚽ Futebol'}
            </span>
          </div>

          {/* Badge de Tipo de Jogo (Modalidade) */}
          {match.game_rules?.game_type && (
            <div className="flex items-center">
              <span className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold uppercase border
                ${match.game_rules.game_type === 'NUMERADA' 
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500' 
                  : match.game_rules.game_type === 'LISA'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                  : match.game_rules.game_type === 'BOLINHO'
                  ? 'bg-green-500/20 text-green-300 border-green-500'
                  : 'bg-orange-500/20 text-orange-300 border-orange-500'
                }
              `}>
                {match.game_rules.game_type === 'NUMERADA' ? 'NUMERADA' : 
                 match.game_rules.game_type === 'LISA' ? 'LISA' : 
                 match.game_rules.game_type === 'BOLINHO' ? 'BOLINHO' :
                 match.game_rules.game_type}
              </span>
            </div>
          )}
        </div>

        {/* Jogadores */}
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            {/* Jogador 1 */}
            <div className="flex-1 text-center">
              {match.player1?.photo_url && (
                <img
                  src={match.player1.photo_url}
                  alt={match.player1.name}
                  className="w-16 h-16 rounded-lg mx-auto mb-2 object-cover border-2 border-green-600"
                />
              )}
              <h3 className="font-bold text-white text-sm">
                {match.player1?.name}
              </h3>
              {match.player1?.nickname && (
                <p className="text-xs text-gray-400">
                  ({match.player1.nickname})
                </p>
              )}
              {match.player1?.win_rate !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  Win Rate: <span className="font-semibold text-green-500">{formatPercent(match.player1.win_rate)}</span>
                </p>
              )}
            </div>

            {/* VS no centro */}
            <div className="flex-shrink-0">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                VS
              </div>
            </div>

            {/* Jogador 2 */}
            <div className="flex-1 text-center">
              {match.player2?.photo_url && (
                <img
                  src={match.player2.photo_url}
                  alt={match.player2.name}
                  className="w-16 h-16 rounded-lg mx-auto mb-2 object-cover border-2 border-green-600"
                />
              )}
              <h3 className="font-bold text-white text-sm">
                {match.player2?.name}
              </h3>
              {match.player2?.nickname && (
                <p className="text-xs text-gray-400">
                  ({match.player2.nickname})
                </p>
              )}
              {match.player2?.win_rate !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  Win Rate: <span className="font-semibold text-green-500">{formatPercent(match.player2.win_rate)}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info da Partida */}
        <div className="px-6 pb-4 space-y-2">
          {/* Local e Data */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="flex items-center gap-1">
              📍 {match.location}
            </span>
            <span className="flex items-center gap-1">
              {isLive ? (
                <span className="text-green-600 font-semibold">● AO VIVO</span>
              ) : (
                <>
                  📅 {formatDate(match.scheduled_at)} às {formatTime(match.scheduled_at)}
                </>
              )}
            </span>
          </div>

          {/* Transmissão */}
          {match.youtube_url && isLive && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
              <span>🔴</span>
              <span className="font-semibold">Transmissão ao vivo disponível</span>
            </div>
          )}
        </div>

        {/* Vantagens e Séries */}
        <div className="px-6 pb-4 space-y-3">
          {/* Vantagens */}
          {match.game_rules?.advantages && (
            <div className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
              <p className="text-xs font-semibold text-yellow-500 mb-2 flex items-center gap-1">
                ⭐ Vantagens
              </p>
              <div className="space-y-1">
                {Array.isArray(match.game_rules.advantages) ? (
                  match.game_rules.advantages.map((advantage, idx) => (
                    <p key={idx} className="text-xs text-gray-300">
                      • {advantage}
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-gray-300">
                    {match.game_rules.advantages}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Séries com Placar */}
          {match.series && match.series.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-green-500 flex items-center gap-1">
                  🎯 Séries
                </p>
                <p className="text-sm font-bold text-white">
                  {match.series.length} {match.series.length === 1 ? 'série' : 'séries'}
                </p>
              </div>
              
              {/* Lista de Séries com Placar */}
              <div className="space-y-2">
                {match.series.map((serie) => {
                  const hasWinner = serie.winner_player_id;
                  const player1Won = serie.winner_player_id === match.player1?.id;
                  // Mostra placar se série está liberada, em andamento ou encerrada
                  const showScore = serie.status === 'liberada' || serie.status === 'em_andamento' || serie.status === 'encerrada';
                  
                  return (
                    <div key={serie.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-800 last:border-0">
                      {/* Status e Número da Série */}
                      <div className="flex items-center gap-2">
                        {serie.status === 'liberada' && (
                          <span className="text-green-400">🟢</span>
                        )}
                        {serie.status === 'em_andamento' && (
                          <span className="text-blue-400">🔵</span>
                        )}
                        {serie.status === 'encerrada' && (
                          <span className="text-purple-400">✅</span>
                        )}
                        {serie.status === 'pendente' && (
                          <span className="text-gray-500">⏳</span>
                        )}
                        
                        <span className="font-medium text-gray-300">
                          Série {serie.serie_number}
                        </span>
                      </div>
                      
                      {/* Placar ao vivo (liberada, em andamento ou encerrada) */}
                      {showScore ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${hasWinner && player1Won ? 'text-green-400' : 'text-white'}`}>
                            {serie.player1_score || 0}
                          </span>
                          <span className="text-gray-500">×</span>
                          <span className={`font-bold ${hasWinner && !player1Won ? 'text-green-400' : 'text-white'}`}>
                            {serie.player2_score || 0}
                          </span>
                          {hasWinner && (
                            <span className="text-yellow-400 text-xs">🏆</span>
                          )}
                          {serie.status === 'liberada' && !hasWinner && (
                            <span className="text-green-400 text-xs animate-pulse">🎯</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">
                          {serie.status === 'pendente' ? 'Aguardando' : 'Cancelada'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Botão */}
        <div className="px-6 pb-6">
          <button className={`
            w-full py-3 rounded-lg font-semibold text-white
            transition-all duration-300
            ${isFinished 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-green-600 hover:bg-green-700'
            }
            hover:shadow-lg transform hover:scale-105
          `}>
            {isFinished ? 'Ver Resultado' : 'Ver Detalhes e Apostar'}
          </button>
        </div>
      </div>
    </Link>
  );
}

/**
 * Componente auxiliar - Status da Série
 */
function SerieStatus({ serie, match }) {
  const getSerieStatus = () => {
    switch (serie.status) {
      case 'pendente':
        return { icon: '⏳', text: 'Aguardando', color: 'text-gray-500' };
      case 'liberada':
        return { icon: '🟢', text: 'Apostas Abertas', color: 'text-green-600' };
      case 'em_andamento':
        return { icon: '🔵', text: 'Em Andamento', color: 'text-blue-600' };
      case 'encerrada':
        return { icon: '✅', text: 'Encerrada', color: 'text-purple-600' };
      case 'cancelada':
        return { icon: '❌', text: 'Cancelada', color: 'text-red-600' };
      default:
        return { icon: '⏳', text: 'Aguardando', color: 'text-gray-500' };
    }
  };

  const status = getSerieStatus();
  const hasWinner = serie.winner_player_id;
  const winnerIsPlayer1 = serie.winner_player_id === match.player1?.id;

  return (
    <div className="flex items-center justify-between text-xs">
      <span className={`flex items-center gap-1 ${status.color}`}>
        <span>{status.icon}</span>
        <span className="font-medium">Série {serie.serie_number}:</span>
        <span>{status.text}</span>
      </span>
      
      {(serie.status === 'em_andamento' || serie.status === 'encerrada') && (
        <span className="font-semibold text-gray-700">
          {serie.player1_score} x {serie.player2_score}
          {hasWinner && (
            <span className="ml-2 text-green-600">
              ({winnerIsPlayer1 ? match.player1?.nickname || match.player1?.name : match.player2?.nickname || match.player2?.name})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
