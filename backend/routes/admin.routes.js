/**
 * ============================================================
 * Admin Routes - Rotas Administrativas
 * ============================================================
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Obtém estatísticas do dashboard admin
 * @access  Private (Admin only)
 */
router.get('/dashboard/stats', authenticateToken, (req, res) => {
  adminController.getDashboardStats(req, res);
});

/**
 * GET /api/admin/fake-stats
 * Estatísticas de saldo fake (debug/testes)
 */
router.get('/fake-stats', authenticateToken, (req, res) => {
  adminController.getFakeStats(req, res);
});

/**
 * @route   GET /api/admin/users
 * @desc    Lista todos os usuários com filtros e paginação
 * @access  Private (Admin only)
 */
router.get('/users', authenticateToken, (req, res) => {
  adminController.getUsers(req, res);
});

/**
 * @route   GET /api/admin/transactions
 * @desc    Lista todas as transações do sistema
 * @access  Private (Admin only)
 */
router.get('/transactions', authenticateToken, (req, res) => {
  adminController.getAllTransactions(req, res);
});

/**
 * @route   GET /api/admin/users/:userId/transactions
 * @desc    Obtém transações de um usuário específico
 * @access  Private (Admin only)
 */
router.get('/users/:userId/transactions', authenticateToken, (req, res) => {
  adminController.getUserTransactions(req, res);
});

/**
 * @route   GET /api/admin/users/:userId/bets
 * @desc    Obtém apostas de um usuário específico
 * @access  Private (Admin only)
 */
router.get('/users/:userId/bets', authenticateToken, (req, res) => {
  adminController.getUserBets(req, res);
});

/**
 * @route   GET /api/admin/bets
 * @desc    Lista todas as apostas (admin)
 * @access  Private (Admin only)
 */
router.get('/bets', authenticateToken, (req, res) => {
  adminController.getAllBets(req, res);
});

/**
 * @route   DELETE /api/admin/bets/:betId
 * @desc    Cancela uma aposta (admin pode cancelar qualquer aposta)
 * @access  Private (Admin only)
 */
router.delete('/bets/:betId', authenticateToken, (req, res) => {
  adminController.cancelBet(req, res);
});

/**
 * @route   POST /api/admin/users/:userId/adjust-balance
 * @desc    Ajustar saldo do usuário manualmente (adicionar ou remover)
 * @access  Private (Admin only)
 */
router.post('/users/:userId/adjust-balance', authenticateToken, (req, res) => {
  adminController.adjustUserBalance(req, res);
});

/**
 * @route   PATCH /api/admin/users/:userId/status
 * @desc    Atualiza o status de um usuário (ativar/bloquear)
 * @access  Private (Admin only)
 */
router.patch('/users/:userId/status', authenticateToken, (req, res) => {
  adminController.updateUserStatus(req, res);
});

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Obtém detalhes de um usuário específico
 * @access  Private (Admin only)
 * IMPORTANTE: Esta rota deve vir por último para não conflitar com as rotas mais específicas acima
 */
router.get('/users/:userId', authenticateToken, (req, res) => {
  adminController.getUserById(req, res);
});

/**
 * ============================================================
 * ROTAS DE MATCHES (ADMIN)
 * ============================================================
 */

/**
 * @route   GET /api/admin/matches
 * @desc    Lista todas as partidas (admin view)
 * @access  Private (Admin only)
 */
router.get('/matches', authenticateToken, (req, res) => {
  adminController.getMatches(req, res);
});

/**
 * @route   GET /api/admin/matches/:matchId
 * @desc    Obtém detalhes de uma partida específica
 * @access  Private (Admin only)
 */
router.get('/matches/:matchId', authenticateToken, (req, res) => {
  adminController.getMatchById(req, res);
});

/**
 * @route   POST /api/admin/matches
 * @desc    Cria uma nova partida
 * @access  Private (Admin only)
 */
router.post('/matches', authenticateToken, (req, res) => {
  adminController.createMatch(req, res);
});

/**
 * @route   PATCH /api/admin/matches/:matchId
 * @desc    Atualiza uma partida
 * @access  Private (Admin only)
 */
router.patch('/matches/:matchId', authenticateToken, (req, res) => {
  adminController.updateMatch(req, res);
});

/**
 * @route   DELETE /api/admin/matches/:matchId
 * @desc    Deleta uma partida
 * @access  Private (Admin only)
 */
router.delete('/matches/:matchId', authenticateToken, (req, res) => {
  adminController.deleteMatch(req, res);
});

/**
 * ============================================================
 * ROTAS DE DEPÓSITOS (ADMIN)
 * ============================================================
 */

/**
 * @route   GET /api/admin/deposits
 * @desc    Lista todos os depósitos com filtros
 * @access  Private (Admin only)
 */
router.get('/deposits', authenticateToken, (req, res) => {
  adminController.getDeposits(req, res);
});

/**
 * @route   GET /api/admin/deposits/:id
 * @desc    Obtém detalhes de um depósito específico
 * @access  Private (Admin only)
 */
router.get('/deposits/:id', authenticateToken, (req, res) => {
  adminController.getDepositById(req, res);
});

/**
 * @route   POST /api/admin/deposits/:id/approve
 * @desc    Aprova um depósito manualmente
 * @access  Private (Admin only)
 */
router.post('/deposits/:id/approve', authenticateToken, (req, res) => {
  adminController.approveDeposit(req, res);
});

/**
 * @route   POST /api/admin/deposits/:id/reject
 * @desc    Rejeita um depósito
 * @access  Private (Admin only)
 */
router.post('/deposits/:id/reject', authenticateToken, (req, res) => {
  adminController.rejectDeposit(req, res);
});

module.exports = router;
