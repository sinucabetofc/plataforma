/**
 * ============================================================
 * ScoreNotification - Mensagens interativas ao marcar pontos
 * ============================================================
 */

'use client';

import { useState, useEffect } from 'react';

const SCORE_MESSAGES = [
  { text: "Ponto para {player}", emoji: "🎉" },
  { text: "{player} Matou mais uma bola", emoji: "🎱" },
  { text: "Que jogada de {player}", emoji: "🔥" },
  { text: "{player} está dominando", emoji: "💪" },
  { text: "Espetacular, {player}", emoji: "⭐" },
  { text: "{player} não para", emoji: "🚀" },
  { text: "Show de bola de {player}", emoji: "✨" },
  { text: "{player} tá ON FIRE", emoji: "🔥" },
  { text: "Mais um pra conta de {player}", emoji: "🎯" },
  { text: "{player} fazendo história", emoji: "🏆" },
];

export default function ScoreNotification({ 
  player1Score, 
  player2Score, 
  player1Name, 
  player2Name,
  isLive = true
}) {
  const [message, setMessage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prevScores, setPrevScores] = useState({ p1: player1Score, p2: player2Score });

  useEffect(() => {
    if (!isLive) return;

    // Detectar mudança no placar
    const p1Changed = player1Score > prevScores.p1;
    const p2Changed = player2Score > prevScores.p2;

    if (p1Changed || p2Changed) {
      const playerName = p1Changed ? player1Name : player2Name;
      
      // Escolher mensagem aleatória
      const randomMessage = SCORE_MESSAGES[Math.floor(Math.random() * SCORE_MESSAGES.length)];
      const formattedMessage = randomMessage.text.replace('{player}', playerName);
      
      setMessage({ text: formattedMessage, emoji: randomMessage.emoji });
      setIsVisible(true);

      // Atualizar scores anteriores
      setPrevScores({ p1: player1Score, p2: player2Score });

      // Esconder após 3 segundos
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      // Limpar mensagem após animação (3.5s)
      const clearTimer = setTimeout(() => {
        setMessage(null);
      }, 3500);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [player1Score, player2Score, isLive]);

  if (!message) return null;

  return (
    <div 
      className={`transition-all duration-500 ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform -translate-y-4'
      }`}
    >
      <div className="mt-4 p-4 bg-gradient-to-r from-verde-neon/10 via-verde-accent/10 to-verde-neon/10 border-2 border-verde-neon rounded-lg shadow-verde-glow">
        {/* Badge +1 Ponto */}
        <div className="flex items-center justify-center mb-2">
          <div className="px-4 py-1 bg-verde-neon rounded-full">
            <span className="text-black font-black text-sm">+1 PONTO</span>
          </div>
        </div>
        
        {/* Frase interativa */}
        <p className="text-center text-verde-neon font-bold text-lg flex items-center justify-center gap-2 animate-pulse">
          <span className="text-2xl">{message.emoji}</span>
          <span>{message.text}</span>
          <span className="text-2xl">{message.emoji}</span>
        </p>
      </div>
    </div>
  );
}
