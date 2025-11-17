/**
 * ============================================================
 * Players Routes - Rotas de Jogadores
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const playersController = require('../controllers/players.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

// ============================================================
// Rate Limiters Específicos
// ============================================================

const createPlayerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50,
  message: {
    success: false,
    message: 'Limite de criação de jogadores atingido. Tente novamente mais tarde.'
  }
});

const listPlayersLimiter = rateLimit({
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
 * GET /api/players/health
 * Health check do serviço
 */
router.get('/health', playersController.health);

/**
 * GET /api/players
 * Lista jogadores com filtros opcionais
 * Query params: active, search, limit, offset
 */
router.get('/', listPlayersLimiter, playersController.listPlayers);

/**
 * GET /api/players/stats
 * Busca estatísticas gerais dos jogadores
 */
router.get('/stats', listPlayersLimiter, playersController.getStats);

/**
 * GET /api/players/:id
 * Busca um jogador específico por ID
 */
router.get('/:id', listPlayersLimiter, playersController.getPlayer);

// ============================================================
// Rotas Protegidas (Requerem Autenticação)
// ============================================================

/**
 * POST /api/players
 * Cria um novo jogador
 * Body: { name, nickname?, photo_url?, bio? }
 * Apenas admins e parceiros
 */
router.post('/', authenticateToken, createPlayerLimiter, playersController.createPlayer);

/**
 * PATCH /api/players/:id
 * Atualiza dados de um jogador
 * Body: { name?, nickname?, photo_url?, bio?, active? }
 * Apenas admins e parceiros
 */
router.patch('/:id', authenticateToken, createPlayerLimiter, playersController.updatePlayer);

/**
 * DELETE /api/players/:id
 * Deleta (soft delete) um jogador
 * Apenas admins
 */
router.delete('/:id', authenticateToken, playersController.deletePlayer);

// ============================================================
// Exportar Router
// ============================================================

module.exports = router;






