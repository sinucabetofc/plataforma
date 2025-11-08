/**
 * ============================================================
 * Influencers Panel Routes
 * ============================================================
 * Rotas do painel do influencer/parceiro
 * Data: 08/11/2025
 */

const express = require('express');
const router = express.Router();
const influencersPanelController = require('../controllers/influencers-panel.controller');
const { authenticateInfluencer } = require('../middlewares/influencer-auth.middleware');
const rateLimit = require('express-rate-limit');

// ============================================================
// Rate Limiters
// ============================================================

const standardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60,
  message: {
    success: false,
    message: 'Muitas requisições. Aguarde um momento.'
  }
});

const actionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30,
  message: {
    success: false,
    message: 'Muitas ações. Aguarde um momento.'
  }
});

// ============================================================
// Todas as rotas requerem autenticação de influencer
// ============================================================

router.use(authenticateInfluencer);

// ============================================================
// Rotas de Dashboard e Listagem
// ============================================================

/**
 * GET /api/influencers/dashboard
 * Dashboard com estatísticas
 */
router.get('/dashboard', standardLimiter, influencersPanelController.getDashboard);

/**
 * GET /api/influencers/matches
 * Listar partidas do influencer
 * Query params: status, limit, offset
 */
router.get('/matches', standardLimiter, influencersPanelController.listMatches);

/**
 * GET /api/influencers/matches/:id
 * Detalhes de uma partida + apostas
 */
router.get('/matches/:id', standardLimiter, influencersPanelController.getMatch);

// ============================================================
// Rotas de Controle de Partidas
// ============================================================

/**
 * PATCH /api/influencers/matches/:id/start
 * Iniciar partida
 */
router.patch('/matches/:id/start', actionLimiter, influencersPanelController.startMatch);

/**
 * PATCH /api/influencers/matches/:id/score
 * Atualizar placar
 * Body: { player1_score?, player2_score? }
 */
router.patch('/matches/:id/score', actionLimiter, influencersPanelController.updateScore);

// ============================================================
// Rotas de Controle de Séries
// ============================================================

/**
 * PATCH /api/influencers/series/:id/start
 * Iniciar série
 */
router.patch('/series/:id/start', actionLimiter, influencersPanelController.startSeries);

/**
 * PATCH /api/influencers/series/:id/enable-betting
 * Liberar apostas para série
 */
router.patch('/series/:id/enable-betting', actionLimiter, influencersPanelController.enableBetting);

// ============================================================
// Exportar Router
// ============================================================

module.exports = router;

