/**
 * ============================================================
 * Matches Controller - Controlador de Partidas
 * ============================================================
 */

const matchesService = require('../services/matches.service');
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse
} = require('../utils/response.util');

class MatchesController {
  /**
   * POST /api/matches
   * Cria uma nova partida
   */
  async createMatch(req, res) {
    try {
      const matchData = req.body;
      const createdBy = req.user.id;

      // Validar dados básicos
      if (!matchData.scheduled_at) {
        return validationErrorResponse(res, [{
          field: 'scheduled_at',
          message: 'Data/hora agendada é obrigatória'
        }]);
      }

      if (!matchData.player1_id || !matchData.player2_id) {
        return validationErrorResponse(res, [{
          field: 'players',
          message: 'Ambos jogadores são obrigatórios'
        }]);
      }

      const match = await matchesService.createMatch(matchData, createdBy);

      return successResponse(res, 201, 'Partida criada com sucesso', match);
    } catch (error) {
      console.error('Erro no controller createMatch:', error);

      if (error.code === 'INVALID_PLAYERS') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'PLAYER_NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'PLAYER_INACTIVE') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao criar partida');
    }
  }

  /**
   * GET /api/matches
   * Lista partidas com filtros opcionais
   */
  async listMatches(req, res) {
    try {
      const filters = {
        status: req.query.status,
        sport: req.query.sport,
        player_id: req.query.player_id,
        created_by: req.query.created_by,
        influencer_id: req.query.influencer_id,
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      };

      const result = await matchesService.listMatches(filters);

      return successResponse(res, 200, 'Partidas listadas com sucesso', result);
    } catch (error) {
      console.error('Erro no controller listMatches:', error);

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao listar partidas');
    }
  }

  /**
   * GET /api/matches/:id
   * Busca uma partida por ID
   */
  async getMatch(req, res) {
    try {
      const { id } = req.params;

      const match = await matchesService.getMatchById(id);

      return successResponse(res, 200, 'Partida encontrada', match);
    } catch (error) {
      console.error('Erro no controller getMatch:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar partida');
    }
  }

  /**
   * PATCH /api/matches/:id
   * Atualiza dados de uma partida
   */
  async updateMatch(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const match = await matchesService.updateMatch(id, updateData);

      return successResponse(res, 200, 'Partida atualizada com sucesso', match);
    } catch (error) {
      console.error('Erro no controller updateMatch:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao atualizar partida');
    }
  }

  /**
   * PATCH /api/matches/:id/status
   * Atualiza o status de uma partida
   */
  async updateMatchStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return validationErrorResponse(res, [{
          field: 'status',
          message: 'Status é obrigatório'
        }]);
      }

      const match = await matchesService.updateMatchStatus(id, status);

      return successResponse(res, 200, 'Status atualizado com sucesso', match);
    } catch (error) {
      console.error('Erro no controller updateMatchStatus:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'INVALID_STATUS') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao atualizar status');
    }
  }

  /**
   * DELETE /api/matches/:id
   * Deleta uma partida
   */
  async deleteMatch(req, res) {
    try {
      const { id } = req.params;

      const result = await matchesService.deleteMatch(id);

      return successResponse(res, 200, result.message);
    } catch (error) {
      console.error('Erro no controller deleteMatch:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'MATCH_HAS_BETS') {
        return errorResponse(res, 400, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao deletar partida');
    }
  }

  /**
   * GET /api/matches/health
   * Verifica saúde do serviço de partidas
   */
  async health(req, res) {
    return successResponse(res, 200, 'Serviço de partidas está funcionando', {
      timestamp: new Date().toISOString(),
      service: 'matches'
    });
  }
}

module.exports = new MatchesController();






