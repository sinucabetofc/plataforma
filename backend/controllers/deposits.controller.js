/**
 * ============================================================
 * Deposits Controller - Gerenciamento de Depósitos (Admin)
 * ============================================================
 */

const depositsService = require('../services/deposits.service');
const {
  successResponse,
  errorResponse,
  notFoundResponse
} = require('../utils/response.util');

class DepositsController {
  /**
   * GET /api/deposits
   * Lista todos os depósitos com filtros
   */
  async getDeposits(req, res) {
    try {
      const { page = 1, limit = 20, status = null, user_id = null } = req.query;

      const result = await depositsService.getDeposits({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        user_id
      });

      return successResponse(res, 200, 'Depósitos listados com sucesso', result);
    } catch (error) {
      console.error('Erro no controller getDeposits:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao listar depósitos');
    }
  }

  /**
   * GET /api/deposits/:id
   * Busca detalhes de um depósito específico
   */
  async getDepositById(req, res) {
    try {
      const { id } = req.params;

      const deposit = await depositsService.getDepositById(id);

      return successResponse(res, 200, 'Depósito encontrado', { deposit });
    } catch (error) {
      console.error('Erro no controller getDepositById:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar depósito');
    }
  }

  /**
   * PUT /api/deposits/:id/approve
   * Aprova um depósito pendente
   */
  async approveDeposit(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const result = await depositsService.approveDeposit(id, adminId);

      return successResponse(res, 200, 'Depósito aprovado com sucesso', result);
    } catch (error) {
      console.error('Erro no controller approveDeposit:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'ALREADY_PROCESSED') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao aprovar depósito');
    }
  }

  /**
   * PUT /api/deposits/:id/reject
   * Rejeita um depósito pendente
   */
  async rejectDeposit(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const result = await depositsService.rejectDeposit(id, adminId, reason);

      return successResponse(res, 200, 'Depósito rejeitado com sucesso', result);
    } catch (error) {
      console.error('Erro no controller rejectDeposit:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'ALREADY_PROCESSED') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao rejeitar depósito');
    }
  }
}

module.exports = new DepositsController();

