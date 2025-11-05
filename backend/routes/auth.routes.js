/**
 * ============================================================
 * Auth Routes - Rotas de Autenticação
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiter específico para autenticação - AUMENTADO
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10000, // AUMENTADO para permitir múltiplas requisições
  message: {
    success: false,
    message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para registro - AUMENTADO
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10000, // AUMENTADO para permitir múltiplas requisições
  message: {
    success: false,
    message: 'Muitas tentativas de registro. Tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   POST /api/auth/register
 * @desc    Registra um novo usuário
 * @access  Public
 * @body    { name, email, password, phone, cpf, pix_key?, pix_type? }
 * @returns { success, message, data: { user_id, user, token, wallet } }
 */
router.post('/register', registerLimiter, (req, res) => {
  authController.register(req, res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Realiza login do usuário
 * @access  Public
 * @body    { email, password }
 * @returns { success, message, data: { user, token, wallet } }
 */
router.post('/login', authLimiter, (req, res) => {
  authController.login(req, res);
});

/**
 * @route   GET /api/auth/profile
 * @desc    Obtém perfil do usuário autenticado
 * @access  Private (requer autenticação)
 * @returns { success, message, data: { user } }
 */
router.get('/profile', authenticateToken, (req, res) => {
  authController.getProfile(req, res);
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualiza perfil do usuário autenticado
 * @access  Private (requer autenticação)
 * @body    { name?, phone?, pix_key?, pix_type? }
 * @returns { success, message, data: { user } }
 */
router.put('/profile', authenticateToken, authLimiter, (req, res) => {
  authController.updateProfile(req, res);
});

/**
 * @route   GET /api/auth/health
 * @desc    Verifica saúde do serviço de autenticação
 * @access  Public
 * @returns { success, message, data: { timestamp, service } }
 */
router.get('/health', (req, res) => {
  authController.health(req, res);
});

module.exports = router;





