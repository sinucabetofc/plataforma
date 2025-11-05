/**
 * ============================================================
 * Bet Routes - Rotas de Apostas
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const betController = require('../controllers/bet.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

// ============================================================
// Rate Limiters Específicos - AUMENTADOS
// ============================================================

// Rate limiter para criação de apostas - AUMENTADO
const createBetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10000,
  message: {
    success: false,
    message: 'Você atingiu o limite de apostas por hora. Tente novamente mais tarde.'
  }
});

// Rate limiter para listagem de apostas - AUMENTADO
const listBetsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10000,
  message: {
    success: false,
    message: 'Muitas requisições. Aguarde um momento.'
  }
});

// ============================================================
// Rotas Públicas
// ============================================================

/**
 * GET /api/bets/health
 * Health check do serviço
 */
router.get('/health', betController.health);

/**
 * GET /api/bets/game/:game_id
 * Lista apostas de um jogo específico
 * Retorna: apostas e total apostado por lado
 */
router.get('/game/:game_id', listBetsLimiter, betController.getGameBets);

/**
 * GET /api/bets/recent
 * Lista apostas recentes de todos os usuários
 * Query params: limit (padrão: 10)
 */
router.get('/recent', listBetsLimiter, betController.getRecentBets);

// ============================================================
// Rotas Protegidas (Requerem Autenticação)
// ============================================================

/**
 * GET /api/bets
 * Lista todas as apostas do usuário autenticado
 * Query params: limit, offset
 */
router.get('/', authenticateToken, listBetsLimiter, betController.getUserBets);

/**
 * POST /api/bets
 * Cria uma nova aposta
 * Body: { game_id, side, amount }
 * - Bloqueia saldo
 * - Realiza matching automático (1x1 ou emparceirado)
 * - Retorna status da aposta e saldo atualizado
 */
router.post('/', authenticateToken, createBetLimiter, betController.createBet);

// ============================================================
// Exportar Router
// ============================================================

module.exports = router;

