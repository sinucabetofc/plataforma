/**
 * ============================================================
 * Admin Withdrawals Routes
 * ============================================================
 * Rotas para admin gerenciar saques dos parceiros
 */

const express = require('express');
const router = express.Router();
const adminWithdrawalsService = require('../services/admin-withdrawals.service');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

/**
 * GET /api/admin/withdrawals
 * Listar todos os saques (Admin)
 */
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const result = await adminWithdrawalsService.getAllWithdrawals(filters);

    res.json(result);
  } catch (error) {
    console.error('Erro ao listar saques:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao listar saques'
    });
  }
});

/**
 * GET /api/admin/withdrawals/stats
 * Estatísticas de saques (Admin)
 */
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await withdrawalsService.getWithdrawalsStats();
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao buscar estatísticas'
    });
  }
});

/**
 * GET /api/admin/withdrawals/:id
 * Buscar saque específico (Admin)
 */
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await withdrawalsService.getWithdrawalById(id, req.user.id, 'admin');
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar saque:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao buscar saque'
    });
  }
});

/**
 * PATCH /api/admin/withdrawals/:id/approve
 * Aprovar saque (Admin)
 */
router.patch('/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { withdrawal_type } = req.body; // 'influencer' ou 'user'
    
    const result = await adminWithdrawalsService.approveWithdrawal(id, withdrawal_type, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Erro ao aprovar saque:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao aprovar saque'
    });
  }
});

/**
 * PATCH /api/admin/withdrawals/:id/reject
 * Rejeitar saque (Admin)
 */
router.patch('/:id/reject', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, withdrawal_type } = req.body; // 'influencer' ou 'user'

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Motivo da rejeição é obrigatório'
      });
    }
    
    const result = await adminWithdrawalsService.rejectWithdrawal(id, withdrawal_type, req.user.id, reason);
    res.json(result);
  } catch (error) {
    console.error('Erro ao rejeitar saque:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao rejeitar saque'
    });
  }
});

module.exports = router;

