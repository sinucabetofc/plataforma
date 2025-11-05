/**
 * ============================================================
 * Bet Controller - Controlador de Apostas
 * ============================================================
 */

const betService = require('../services/bet.service');
const { createBetSchema } = require('../validators/bet.validator');
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse
} = require('../utils/response.util');

class BetController {
  /**
   * POST /api/bets
   * Cria uma nova aposta
   */
  async createBet(req, res) {
    try {
      // 1. Validar dados de entrada
      const validationResult = createBetSchema.safeParse(req.body);

      if (!validationResult.success) {
        return validationErrorResponse(res, validationResult.error.errors);
      }

      const { game_id, side, amount } = validationResult.data;
      const userId = req.user.id;

      // 2. Criar aposta
      const betResult = await betService.createBet(userId, game_id, side, amount);

      return successResponse(res, 201, 'Aposta criada com sucesso', betResult);
    } catch (error) {
      console.error('Erro no controller createBet:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'GAME_NOT_OPEN') {
        return errorResponse(res, 400, error.message, error.details);
      }

      if (error.code === 'INSUFFICIENT_BALANCE') {
        return errorResponse(res, 400, error.message, error.details);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao criar aposta');
    }
  }

  /**
   * GET /api/bets/game/:game_id
   * Lista apostas de um jogo específico
   */
  async getGameBets(req, res) {
    try {
      const { game_id } = req.params;

      const result = await betService.getGameBets(game_id);

      return successResponse(res, 200, 'Apostas do jogo obtidas com sucesso', result);
    } catch (error) {
      console.error('Erro no controller getGameBets:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar apostas do jogo');
    }
  }

  /**
   * GET /api/bets
   * Lista apostas do usuário autenticado
   */
  async getUserBets(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      
      const result = await betService.getUserBets(userId, limit, offset);

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
   * GET /api/bets/recent
   * Lista apostas recentes de todos os usuários
   */
  async getRecentBets(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await betService.getRecentBets(limit);

      return successResponse(res, 200, 'Últimas apostas obtidas com sucesso', result);
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

module.exports = new BetController();

