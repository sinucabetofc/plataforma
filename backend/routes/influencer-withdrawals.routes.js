/**
 * ============================================================
 * Influencer Withdrawals Routes
 * ============================================================
 * Rotas para gerenciamento de saques dos parceiros
 */

const express = require('express');
const router = express.Router();
const withdrawalsService = require('../services/influencer-withdrawals.service');
const { authenticateInfluencer } = require('../middleware/auth.middleware');

/**
 * POST /api/influencers/withdrawals
 * Solicitar novo saque (Influencer)
 */
router.post('/', authenticateInfluencer, async (req, res) => {
  try {
    const influencerId = req.influencer.id;
    const { amount, notes } = req.body;

    const result = await withdrawalsService.requestWithdrawal(influencerId, {
      amount: parseFloat(amount),
      notes
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao solicitar saque:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao solicitar saque'
    });
  }
});

/**
 * GET /api/influencers/withdrawals
 * Listar saques (Influencer vê apenas os seus)
 */
router.get('/', authenticateInfluencer, async (req, res) => {
  try {
    const influencerId = req.influencer.id;
    const filters = {
      status: req.query.status,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const result = await withdrawalsService.listWithdrawals(influencerId, 'influencer', filters);

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
 * GET /api/influencers/withdrawals/:id
 * Buscar saque específico
 */
router.get('/:id', authenticateInfluencer, async (req, res) => {
  try {
    const influencerId = req.influencer.id;
    const { id } = req.params;

    const result = await withdrawalsService.getWithdrawalById(id, influencerId, 'influencer');

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
 * DELETE /api/influencers/withdrawals/:id
 * Cancelar saque pendente (Influencer)
 */
router.delete('/:id', authenticateInfluencer, async (req, res) => {
  try {
    const influencerId = req.influencer.id;
    const { id } = req.params;

    const result = await withdrawalsService.cancelWithdrawal(id, influencerId);

    res.json(result);
  } catch (error) {
    console.error('Erro ao cancelar saque:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro ao cancelar saque'
    });
  }
});

module.exports = router;

