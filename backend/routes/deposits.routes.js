/**
 * ============================================================
 * Deposits Routes - Rotas de Gerenciamento de Depósitos (Admin)
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const depositsController = require('../controllers/deposits.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// ============================================================
// Todas as rotas requerem autenticação de ADMIN
// ============================================================

/**
 * @route   GET /api/admin/deposits
 * @desc    Lista todos os depósitos com filtros
 * @access  Private (Admin)
 * @query   ?page=1&limit=20&status=pending&user_id=uuid
 */
router.get('/', authenticateToken, (req, res) => {
  depositsController.getDeposits(req, res);
});

/**
 * @route   GET /api/admin/deposits/:id
 * @desc    Busca detalhes de um depósito específico
 * @access  Private (Admin)
 */
router.get('/:id', authenticateToken, (req, res) => {
  depositsController.getDepositById(req, res);
});

/**
 * @route   PUT /api/admin/deposits/:id/approve
 * @desc    Aprova um depósito pendente (marca como completed)
 * @access  Private (Admin)
 */
router.put('/:id/approve', authenticateToken, (req, res) => {
  depositsController.approveDeposit(req, res);
});

/**
 * @route   PUT /api/admin/deposits/:id/reject
 * @desc    Rejeita um depósito pendente (marca como failed)
 * @access  Private (Admin)
 */
router.put('/:id/reject', authenticateToken, (req, res) => {
  depositsController.rejectDeposit(req, res);
});

module.exports = router;

