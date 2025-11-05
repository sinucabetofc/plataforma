/**
 * ============================================================
 * Game Routes - Rotas de Jogos
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

// ============================================================
// Rate Limiters Específicos
// ============================================================

// Rate limiter para criação de jogos - AUMENTADO
const createGameLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10000,
  message: {
    success: false,
    message: 'Você atingiu o limite de criação de jogos por hora. Tente novamente mais tarde.'
  }
});

// Rate limiter para listagem de jogos - AUMENTADO
const listGamesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10000,
  message: {
    success: false,
    message: 'Muitas requisições. Aguarde um momento.'
  }
});

// Rate limiter para atualização de status - AUMENTADO
const updateStatusLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10000,
  message: {
    success: false,
    message: 'Você atingiu o limite de atualizações de status por hora. Tente novamente mais tarde.'
  }
});

// ============================================================
// Rotas Públicas
// ============================================================

/**
 * GET /api/games/health
 * Health check do serviço
 */
router.get('/health', gameController.health);

/**
 * GET /api/games
 * Lista jogos com filtros opcionais
 * Query params: status, modality, limit, offset
 */
router.get('/', listGamesLimiter, gameController.listGames);

/**
 * GET /api/games/:id
 * Busca um jogo específico por ID
 */
router.get('/:id', listGamesLimiter, gameController.getGame);

// ============================================================
// Rotas Protegidas (Requerem Autenticação)
// ============================================================

/**
 * POST /api/games
 * Cria um novo jogo
 * Body: { player_a, player_b, modality, advantages?, series?, bet_limit? }
 * Retorna: Dados do jogo criado com status 'open'
 */
router.post('/', authenticateToken, createGameLimiter, gameController.createGame);

/**
 * PATCH /api/games/:id/status
 * Atualiza o status de um jogo
 * Body: { status, result? }
 * Nota: Apenas admins deveriam ter acesso (adicionar middleware de admin no futuro)
 */
router.patch('/:id/status', authenticateToken, updateStatusLimiter, gameController.updateGameStatus);

/**
 * POST /api/games/:id/result
 * Finaliza um jogo e distribui ganhos das apostas
 * Body: { result: 'player_a' | 'player_b' | 'draw' }
 * - Atualiza status do jogo para finished
 * - Distribui ganhos das apostas casadas
 * - Atualiza Wallet dos vencedores
 * - Cria Transaction tipo win
 * Nota: Apenas admins deveriam ter acesso
 */
router.post('/:id/result', authenticateToken, updateStatusLimiter, gameController.finishGame);

// ============================================================
// Exportar Router
// ============================================================

module.exports = router;

