/**
 * ============================================================
 * Series Routes - Rotas de Séries
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/series.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

// ============================================================
// Rate Limiters Específicos
// ============================================================

const listSeriesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  message: {
    success: false,
    message: 'Muitas requisições. Aguarde um momento.'
  }
});

const updateSerieLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 200,
  message: {
    success: false,
    message: 'Limite de atualizações atingido. Tente novamente mais tarde.'
  }
});

// ============================================================
// Rotas Públicas
// ============================================================

/**
 * GET /api/series/health
 * Health check do serviço
 */
router.get('/health', seriesController.health);

/**
 * GET /api/series/finished
 * Busca séries finalizadas (últimos resultados)
 * IMPORTANTE: Deve vir antes de /:id para não ser capturada como ID
 */
router.get('/finished', listSeriesLimiter, seriesController.getFinishedSeries);

/**
 * GET /api/series/match/:matchId
 * Busca séries de uma partida específica
 */
router.get('/match/:matchId', listSeriesLimiter, seriesController.getSeriesByMatch);

/**
 * GET /api/series/:id
 * Busca uma série específica por ID
 */
router.get('/:id', listSeriesLimiter, seriesController.getSerie);

// ============================================================
// Rotas Protegidas (Requerem Autenticação)
// ============================================================

/**
 * POST /api/series/:id/release
 * Libera uma série para apostas
 * Apenas admins e parceiros (donos da partida)
 */
router.post('/:id/release', authenticateToken, updateSerieLimiter, seriesController.releaseSerie);

/**
 * POST /api/series/:id/start
 * Inicia uma série (travar apostas)
 * Apenas admins e parceiros (donos da partida)
 */
router.post('/:id/start', authenticateToken, updateSerieLimiter, seriesController.startSerie);

/**
 * POST /api/series/:id/finish
 * Finaliza uma série com vencedor
 * Body: { winner_player_id, player1_score?, player2_score? }
 * Triggers vão:
 * - Atualizar apostas (ganhas/perdidas)
 * - Creditar ganhos nas wallets
 * - Atualizar estatísticas dos jogadores
 * Apenas admins e parceiros (donos da partida)
 */
router.post('/:id/finish', authenticateToken, updateSerieLimiter, seriesController.finishSerie);

/**
 * POST /api/series/:id/cancel
 * Cancela uma série e reembolsa apostas
 * Apenas admins e parceiros (donos da partida)
 */
router.post('/:id/cancel', authenticateToken, updateSerieLimiter, seriesController.cancelSerie);

/**
 * PATCH /api/series/:id/score
 * Atualiza placar de uma série em andamento
 * Body: { player1_score?, player2_score? }
 * Apenas admins e parceiros (donos da partida)
 */
router.patch('/:id/score', authenticateToken, updateSerieLimiter, seriesController.updateScore);

// ============================================================
// Exportar Router
// ============================================================

module.exports = router;

