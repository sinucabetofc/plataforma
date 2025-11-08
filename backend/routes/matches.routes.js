/**
 * ============================================================
 * Matches Routes - Rotas de Partidas
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matches.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

// ============================================================
// Rate Limiters Específicos
// ============================================================

const createMatchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50,
  message: {
    success: false,
    message: 'Limite de criação de partidas atingido. Tente novamente mais tarde.'
  }
});

const listMatchesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,
  message: {
    success: false,
    message: 'Muitas requisições. Aguarde um momento.'
  }
});

const updateMatchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100,
  message: {
    success: false,
    message: 'Limite de atualizações atingido. Tente novamente mais tarde.'
  }
});

// ============================================================
// Rotas Públicas
// ============================================================

/**
 * GET /api/matches/health
 * Health check do serviço
 */
router.get('/health', matchesController.health);

/**
 * GET /api/matches
 * Lista partidas com filtros opcionais
 * Query params: status, sport, player_id, created_by, influencer_id, limit, offset
 */
router.get('/', listMatchesLimiter, matchesController.listMatches);

/**
 * GET /api/matches/:id
 * Busca uma partida específica por ID (com séries)
 */
router.get('/:id', listMatchesLimiter, matchesController.getMatch);

// ============================================================
// Rotas Protegidas (Requerem Autenticação)
// ============================================================

/**
 * POST /api/matches
 * Cria uma nova partida (e suas séries automaticamente)
 * Body: {
 *   scheduled_at,
 *   location?,
 *   sport?,
 *   youtube_url?,
 *   player1_id,
 *   player2_id,
 *   game_rules?,
 *   influencer_id?,
 *   influencer_commission?,
 *   total_series?
 * }
 * Apenas admins e parceiros
 */
router.post('/', authenticateToken, createMatchLimiter, matchesController.createMatch);

/**
 * PATCH /api/matches/:id
 * Atualiza dados de uma partida
 * Body: { scheduled_at?, location?, sport?, youtube_url?, stream_active?, game_rules?, influencer_id?, influencer_commission? }
 * Admins e parceiros (donos)
 */
router.patch('/:id', authenticateToken, updateMatchLimiter, matchesController.updateMatch);

/**
 * PATCH /api/matches/:id/status
 * Atualiza o status de uma partida
 * Body: { status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada' }
 * Apenas admins e parceiros (donos)
 */
router.patch('/:id/status', authenticateToken, updateMatchLimiter, matchesController.updateMatchStatus);

/**
 * DELETE /api/matches/:id
 * Deleta uma partida
 * Apenas admins
 */
router.delete('/:id', authenticateToken, matchesController.deleteMatch);

// ============================================================
// Exportar Router
// ============================================================

module.exports = router;




