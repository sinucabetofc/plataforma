/**
 * ============================================================
 * Players Controller - Controlador de Jogadores
 * ============================================================
 */

const playersService = require('../services/players.service');
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse
} = require('../utils/response.util');

class PlayersController {
  /**
   * POST /api/players
   * Cria um novo jogador
   */
  async createPlayer(req, res) {
    try {
      const playerData = req.body;

      // Validar dados básicos
      if (!playerData.name || playerData.name.trim() === '') {
        return validationErrorResponse(res, [{
          field: 'name',
          message: 'Nome do jogador é obrigatório'
        }]);
      }

      const player = await playersService.createPlayer(playerData);

      return successResponse(res, 201, 'Jogador criado com sucesso', player);
    } catch (error) {
      console.error('Erro no controller createPlayer:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao criar jogador');
    }
  }

  /**
   * GET /api/players
   * Lista jogadores com filtros opcionais
   */
  async listPlayers(req, res) {
    try {
      const filters = {
        active: req.query.active !== undefined ? req.query.active === 'true' : true,
        search: req.query.search,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await playersService.listPlayers(filters);

      return successResponse(res, 200, 'Jogadores listados com sucesso', result);
    } catch (error) {
      console.error('Erro no controller listPlayers:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao listar jogadores');
    }
  }

  /**
   * GET /api/players/:id
   * Busca um jogador por ID
   */
  async getPlayer(req, res) {
    try {
      const { id } = req.params;

      const player = await playersService.getPlayerById(id);

      return successResponse(res, 200, 'Jogador encontrado', player);
    } catch (error) {
      console.error('Erro no controller getPlayer:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar jogador');
    }
  }

  /**
   * PATCH /api/players/:id
   * Atualiza dados de um jogador
   */
  async updatePlayer(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const player = await playersService.updatePlayer(id, updateData);

      return successResponse(res, 200, 'Jogador atualizado com sucesso', player);
    } catch (error) {
      console.error('Erro no controller updatePlayer:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao atualizar jogador');
    }
  }

  /**
   * DELETE /api/players/:id
   * Deleta (soft delete) um jogador
   */
  async deletePlayer(req, res) {
    try {
      const { id } = req.params;

      const result = await playersService.deletePlayer(id);

      return successResponse(res, 200, result.message);
    } catch (error) {
      console.error('Erro no controller deletePlayer:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'PLAYER_HAS_MATCHES') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao deletar jogador');
    }
  }

  /**
   * GET /api/players/stats
   * Busca estatísticas gerais dos jogadores
   */
  async getStats(req, res) {
    try {
      const stats = await playersService.getPlayersStats();

      return successResponse(res, 200, 'Estatísticas obtidas com sucesso', stats);
    } catch (error) {
      console.error('Erro no controller getStats:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar estatísticas');
    }
  }

  /**
   * GET /api/players/health
   * Verifica saúde do serviço de jogadores
   */
  async health(req, res) {
    return successResponse(res, 200, 'Serviço de jogadores está funcionando', {
      timestamp: new Date().toISOString(),
      service: 'players'
    });
  }
}

module.exports = new PlayersController();




