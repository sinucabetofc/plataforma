/**
 * ============================================================
 * Admin Withdrawals Routes
 * ============================================================
 * Rotas para admin gerenciar saques dos parceiros
 */

const express = require('express');
const router = express.Router();
const withdrawalsService = require('../services/influencer-withdrawals.service');
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
      influencer_id: req.query.influencer_id,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const result = await withdrawalsService.listWithdrawals(req.user.id, 'admin', filters);

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
    const { notes } = req.body;
    
    const result = await withdrawalsService.approveWithdrawal(id, req.user.id, notes);
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
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Motivo da rejeição é obrigatório'
      });
    }
    
    const result = await withdrawalsService.rejectWithdrawal(id, req.user.id, reason);
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

