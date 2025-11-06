/**
 * ============================================================
 * AnimatedScore - Placar com Animação
 * ============================================================
 * Componente que anima mudanças no placar
 */

'use client';

import { useState, useEffect, useRef } from 'react';

export default function AnimatedScore({ score, color = 'text-verde-neon', size = 'text-6xl' }) {
  const [displayScore, setDisplayScore] = useState(score);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const previousScore = useRef(score);

  // Evitar erro de hidratação
  useEffect(() => {
    setIsMounted(true);
    setDisplayScore(score);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (score !== previousScore.current && score !== displayScore) {
      setIsAnimating(true);
      
      // Animar mudança
      const changeTimer = setTimeout(() => {
        setDisplayScore(score);
        previousScore.current = score;
      }, 150);
      
      // Remover animação
      const resetTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);

      return () => {
        clearTimeout(changeTimer);
        clearTimeout(resetTimer);
      };
    }
  }, [score, displayScore, isMounted]);

  // Renderizar sem animação no servidor
  if (!isMounted) {
    return (
      <span className={`${size} font-black ${color}`}>
        {score}
      </span>
    );
  }

  return (
    <span
      className={`${size} font-black ${color} transition-all duration-300 ${
        isAnimating ? 'animate-score-update' : ''
      }`}
    >
      {displayScore}
    </span>
  );
}


