/**
 * ============================================================
 * Bets Controller - Controlador de Apostas (Nova Estrutura)
 * ============================================================
 */

const betsService = require('../services/bets.service');
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse
} = require('../utils/response.util');

class BetsController {
  /**
   * POST /api/bets
   * Cria uma nova aposta
   */
  async createBet(req, res) {
    try {
      const betData = req.body;
      const userId = req.user.id;

      // Validar dados
      if (!betData.serie_id) {
        return validationErrorResponse(res, [{
          field: 'serie_id',
          message: 'ID da série é obrigatório'
        }]);
      }

      if (!betData.chosen_player_id) {
        return validationErrorResponse(res, [{
          field: 'chosen_player_id',
          message: 'Jogador escolhido é obrigatório'
        }]);
      }

      if (!betData.amount || betData.amount < 1000) {
        return validationErrorResponse(res, [{
          field: 'amount',
          message: 'Valor mínimo da aposta é R$ 10,00 (1000 centavos)'
        }]);
      }

      const result = await betsService.createBet(userId, betData);

      return successResponse(res, 201, 'Aposta criada com sucesso', result);
    } catch (error) {
      console.error('Erro no controller createBet:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'SERIE_NOT_AVAILABLE') {
        return errorResponse(res, 400, error.message, error.details);
      }

      if (error.code === 'BETTING_DISABLED') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'INVALID_PLAYER') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'INSUFFICIENT_BALANCE') {
        return errorResponse(res, 400, error.message, error.details);
      }

      if (error.code === 'WALLET_NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao criar aposta');
    }
  }

  /**
   * GET /api/bets/serie/:serieId
   * Busca apostas de uma série específica
   */
  async getSerieBets(req, res) {
    try {
      const { serieId } = req.params;

      const result = await betsService.getSerieBets(serieId);

      return successResponse(res, 200, 'Apostas da série obtidas com sucesso', result);
    } catch (error) {
      console.error('Erro no controller getSerieBets:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar apostas da série');
    }
  }

  /**
   * GET /api/bets/user
   * Busca apostas do usuário autenticado
   */
  async getUserBets(req, res) {
    try {
      const userId = req.user.id;
      const filters = {
        status: req.query.status,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await betsService.getUserBets(userId, filters);

      return successResponse(res, 200, 'Apostas do usuário obtidas com sucesso', result);
    } catch (error) {
      console.error('Erro no controller getUserBets:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar apostas do usuário');
    }
  }

  /**
   * DELETE /api/bets/:id
   * Cancela uma aposta (apenas pendente)
   */
  async cancelBet(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await betsService.cancelBet(id, userId);

      return successResponse(res, 200, result.message, {
        refunded_amount: result.refunded_amount
      });
    } catch (error) {
      console.error('Erro no controller cancelBet:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'INVALID_STATUS') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'SERIE_STARTED') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao cancelar aposta');
    }
  }

  /**
   * GET /api/bets/recent
   * Busca apostas recentes
   */
  async getRecentBets(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;

      const bets = await betsService.getRecentBets(limit);

      return successResponse(res, 200, 'Apostas recentes obtidas com sucesso', { bets });
    } catch (error) {
      console.error('Erro no controller getRecentBets:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar apostas recentes');
    }
  }

  /**
   * GET /api/bets/health
   * Verifica saúde do serviço de apostas
   */
  async health(req, res) {
    return successResponse(res, 200, 'Serviço de apostas está funcionando', {
      timestamp: new Date().toISOString(),
      service: 'bets'
    });
  }
}

module.exports = new BetsController();




