/**
 * ============================================================
 * Influencers Routes - Admin CRUD
 * ============================================================
 * Rotas para gerenciamento de influencers (apenas admin)
 * Data: 08/11/2025
 */

const express = require('express');
const router = express.Router();
const influencersController = require('../controllers/influencers.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

// ============================================================
// Rate Limiters
// ============================================================

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20,
  message: {
    success: false,
    message: 'Limite de criação atingido. Tente novamente mais tarde.'
  }
});

const updateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100,
  message: {
    success: false,
    message: 'Limite de atualizações atingido. Tente novamente mais tarde.'
  }
});

// ============================================================
// Middleware para verificar se é admin
// ============================================================

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }
  next();
};

// ============================================================
// Rotas
// ============================================================

/**
 * GET /api/admin/influencers/health
 * Health check
 */
router.get('/health', influencersController.health);

/**
 * POST /api/admin/influencers
 * Criar novo influencer
 */
router.post('/', authenticateToken, requireAdmin, createLimiter, influencersController.createInfluencer);

/**
 * GET /api/admin/influencers
 * Listar todos os influencers
 * Query params: is_active, search, limit, offset
 */
router.get('/', authenticateToken, requireAdmin, influencersController.listInfluencers);

/**
 * GET /api/admin/influencers/:id
 * Buscar influencer específico
 */
router.get('/:id', authenticateToken, requireAdmin, influencersController.getInfluencer);

/**
 * PATCH /api/admin/influencers/:id
 * Atualizar influencer
 */
router.patch('/:id', authenticateToken, requireAdmin, updateLimiter, influencersController.updateInfluencer);

/**
 * DELETE /api/admin/influencers/:id
 * Deletar/desativar influencer
 * Query param: permanent=true para deletar permanentemente
 */
router.delete('/:id', authenticateToken, requireAdmin, influencersController.deleteInfluencer);

// ============================================================
// Exportar Router
// ============================================================

module.exports = router;

