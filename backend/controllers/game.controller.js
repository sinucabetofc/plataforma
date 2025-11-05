/**
 * ============================================================
 * Game Controller - Controlador de Jogos
 * ============================================================
 */

const gameService = require('../services/game.service');
const { 
  createGameSchema, 
  updateGameStatusSchema, 
  listGamesFiltersSchema 
} = require('../validators/game.validator');
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse
} = require('../utils/response.util');

class GameController {
  /**
   * POST /api/games
   * Cria um novo jogo
   */
  async createGame(req, res) {
    try {
      // 1. Validar dados de entrada
      const validationResult = createGameSchema.safeParse(req.body);

      if (!validationResult.success) {
        return validationErrorResponse(res, validationResult.error.errors);
      }

      const gameData = validationResult.data;

      // 2. Criar jogo
      const game = await gameService.createGame(gameData);

      return successResponse(res, 201, 'Jogo criado com sucesso', game);
    } catch (error) {
      console.error('Erro no controller createGame:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao criar jogo');
    }
  }

  /**
   * GET /api/games
   * Lista jogos com filtros opcionais
   */
  async listGames(req, res) {
    try {
      // 1. Validar query parameters
      const filters = {
        status: req.query.status,
        modality: req.query.modality,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const validationResult = listGamesFiltersSchema.safeParse(filters);

      if (!validationResult.success) {
        return validationErrorResponse(res, validationResult.error.errors);
      }

      // 2. Listar jogos
      const result = await gameService.listGames(validationResult.data);

      return successResponse(res, 200, 'Jogos listados com sucesso', result);
    } catch (error) {
      console.error('Erro no controller listGames:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao listar jogos');
    }
  }

  /**
   * GET /api/games/:id
   * Busca um jogo por ID
   */
  async getGame(req, res) {
    try {
      const { id } = req.params;

      const game = await gameService.getGameById(id);

      return successResponse(res, 200, 'Jogo encontrado', game);
    } catch (error) {
      console.error('Erro no controller getGame:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar jogo');
    }
  }

  /**
   * PATCH /api/games/:id/status
   * Atualiza o status de um jogo
   */
  async updateGameStatus(req, res) {
    try {
      const { id } = req.params;

      // 1. Validar dados de entrada
      const validationResult = updateGameStatusSchema.safeParse(req.body);

      if (!validationResult.success) {
        return validationErrorResponse(res, validationResult.error.errors);
      }

      const { status, result } = validationResult.data;

      // 2. Atualizar status do jogo
      const game = await gameService.updateGameStatus(id, status, result);

      return successResponse(res, 200, 'Status do jogo atualizado com sucesso', game);
    } catch (error) {
      console.error('Erro no controller updateGameStatus:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao atualizar status do jogo');
    }
  }

  /**
   * POST /api/games/:id/result
   * Finaliza um jogo e distribui ganhos
   */
  async finishGame(req, res) {
    try {
      const { id } = req.params;

      // 1. Validar dados de entrada
      const validationResult = updateGameStatusSchema.safeParse(req.body);

      if (!validationResult.success) {
        return validationErrorResponse(res, validationResult.error.errors);
      }

      const { result } = validationResult.data;

      if (!result) {
        return errorResponse(res, 400, 'O resultado do jogo é obrigatório');
      }

      // 2. Finalizar jogo e distribuir ganhos
      const distributionResult = await gameService.finishGameAndDistributeWinnings(id, result);

      return successResponse(res, 200, 'Jogo finalizado e ganhos distribuídos', distributionResult);
    } catch (error) {
      console.error('Erro no controller finishGame:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'GAME_ALREADY_FINISHED') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'GAME_NOT_STARTED') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao finalizar jogo');
    }
  }

  /**
   * GET /api/games/health
   * Verifica saúde do serviço de jogos
   */
  async health(req, res) {
    return successResponse(res, 200, 'Serviço de jogos está funcionando', {
      timestamp: new Date().toISOString(),
      service: 'games'
    });
  }
}

module.exports = new GameController();

