/**
 * ============================================================
 * Bets Routes - Rotas de Apostas (Nova Estrutura)
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const betsController = require('../controllers/bets.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

// ============================================================
// Rate Limiters Específicos
// ============================================================

const createBetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100,
  message: {
    success: false,
    message: 'Limite de apostas atingido. Tente novamente mais tarde.'
  }
});

const listBetsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
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
router.get('/health', betsController.health);

/**
 * GET /api/bets/recent
 * Lista apostas recentes de todos os usuários
 * Query params: limit (padrão: 10)
 */
router.get('/recent', listBetsLimiter, betsController.getRecentBets);

/**
 * GET /api/bets/serie/:serieId
 * Lista apostas de uma série específica
 * Retorna: apostas agrupadas por jogador, estatísticas, etc
 */
router.get('/serie/:serieId', listBetsLimiter, betsController.getSerieBets);

// ============================================================
// Rotas Protegidas (Requerem Autenticação)
// ============================================================

/**
 * GET /api/bets/user
 * Lista todas as apostas do usuário autenticado
 * Query params: status, limit, offset
 */
router.get('/user', authenticateToken, listBetsLimiter, betsController.getUserBets);

/**
 * POST /api/bets
 * Cria uma nova aposta
 * Body: { serie_id, chosen_player_id, amount }
 * - Valida que série está liberada
 * - Debita saldo automaticamente (trigger)
 * - Retorna aposta criada e saldo atualizado
 */
router.post('/', authenticateToken, createBetLimiter, betsController.createBet);

/**
 * DELETE /api/bets/:id
 * Cancela uma aposta (apenas pendente, antes de série iniciar)
 * - Reembolsa valor automaticamente
 * - Cria transação de reembolso
 */
router.delete('/:id', authenticateToken, betsController.cancelBet);

// ============================================================
// Exportar Router
// ============================================================

module.exports = router;

