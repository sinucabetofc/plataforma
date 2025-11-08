/**
 * ============================================================
 * Wallet Routes - Rotas de Carteira
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rateLimit = require('express-rate-limit');

// ============================================================
// Rate Limiters Específicos
// ============================================================

// Rate limiter para depósitos - AUMENTADO
const depositLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10000,
  message: {
    success: false,
    message: 'Você atingiu o limite de depósitos por hora. Tente novamente mais tarde.'
  }
});

// Rate limiter para saques - AUMENTADO
const withdrawLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10000,
  message: {
    success: false,
    message: 'Você atingiu o limite de saques por hora. Tente novamente mais tarde.'
  }
});

// Rate limiter para consultas de carteira - AUMENTADO
const walletLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10000,
  message: {
    success: false,
    message: 'Muitas consultas à carteira. Aguarde um momento.'
  }
});

// Rate limiter para webhook - AUMENTADO
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10000,
  message: {
    success: false,
    message: 'Webhook rate limit excedido'
  }
});

// ============================================================
// Rotas Públicas
// ============================================================

/**
 * GET /api/wallet/health
 * Health check do serviço
 */
router.get('/health', walletController.health);

/**
 * POST /api/wallet/webhook/woovi
 * Webhook da Woovi para confirmação de pagamentos
 * Nota: Esta rota não precisa de autenticação JWT
 */
router.post('/webhook/woovi', webhookLimiter, walletController.wooviWebhook);

// ============================================================
// Rotas Protegidas (Requerem Autenticação)
// ============================================================

/**
 * GET /api/wallet
 * Retorna dados da carteira do usuário autenticado
 * - Saldo disponível
 * - Saldo bloqueado
 * - Últimas 10 transações
 */
router.get('/', authenticateToken, walletLimiter, walletController.getWallet);

/**
 * POST /api/wallet/deposit
 * Cria um depósito via Pix
 * Body: { amount: number, description?: string }
 * Retorna: QR Code Pix e dados da transação
 */
router.post('/deposit', authenticateToken, depositLimiter, walletController.createDeposit);

/**
 * POST /api/wallet/withdraw
 * Cria uma solicitação de saque via Pix
 * Body: { amount: number, pix_key: string, description?: string }
 * Retorna: Dados da solicitação de saque (pendente aprovação do admin)
 */
router.post('/withdraw', authenticateToken, withdrawLimiter, walletController.createWithdraw);

/**
 * GET /api/wallet/transactions/:transactionId
 * Busca uma transação específica (para polling de status)
 * Retorna: Dados da transação incluindo status atualizado
 */
router.get('/transactions/:transactionId', authenticateToken, walletLimiter, walletController.getTransaction);

// ============================================================
// Exportar Router
// ============================================================

module.exports = router;




