/**
 * ============================================================
 * Influencers Auth Routes
 * ============================================================
 * Rotas de autenticação para influencers/parceiros
 * Data: 08/11/2025
 */

const express = require('express');
const router = express.Router();
const influencersAuthController = require('../controllers/influencers-auth.controller');
const { authenticateInfluencer } = require('../middlewares/influencer-auth.middleware');
const rateLimit = require('express-rate-limit');

// ============================================================
// Rate Limiters
// ============================================================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  }
});

// ============================================================
// Rotas Públicas
// ============================================================

/**
 * POST /api/influencers/auth/login
 * Login de influencer
 * Body: { email, password }
 */
router.post('/login', loginLimiter, influencersAuthController.login);

// ============================================================
// Rotas Protegidas (Requerem Autenticação)
// ============================================================

/**
 * POST /api/influencers/auth/logout
 * Logout de influencer
 */
router.post('/logout', authenticateInfluencer, influencersAuthController.logout);

/**
 * GET /api/influencers/auth/me
 * Retorna dados do influencer autenticado
 */
router.get('/me', authenticateInfluencer, influencersAuthController.me);

/**
 * PATCH /api/influencers/auth/profile
 * Atualizar próprio perfil
 * Body: { name?, phone?, photo_url?, social_media?, pix_key?, current_password?, new_password? }
 */
router.patch('/profile', authenticateInfluencer, influencersAuthController.updateProfile);

// ============================================================
// Exportar Router
// ============================================================

module.exports = router;

