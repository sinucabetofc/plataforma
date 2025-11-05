/**
 * ============================================================
 * Auth Controller - Controlador de Autenticação
 * ============================================================
 */

const authService = require('../services/auth.service');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  conflictResponse,
  unauthorizedResponse,
  notFoundResponse
} = require('../utils/response.util');

class AuthController {
  /**
   * POST /api/auth/register
   * Registra um novo usuário
   */
  async register(req, res) {
    try {
      // 1. Validar dados de entrada com Zod
      const validationResult = registerSchema.safeParse(req.body);

      if (!validationResult.success) {
        return validationErrorResponse(res, validationResult.error.errors);
      }

      const userData = validationResult.data;

      // 2. Chamar service para criar usuário
      console.log('🔵 [CONTROLLER] Chamando authService.register...');
      const result = await authService.register(userData);
      console.log('✅ [CONTROLLER] Usuário registrado com sucesso:', result.user?.email);

      // 3. Retornar resposta de sucesso
      return successResponse(res, 201, 'Usuário registrado com sucesso', {
        user_id: result.user.id,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          cpf: result.user.cpf,
          pix_key: result.user.pix_key,
          pix_type: result.user.pix_type,
          email_verified: result.user.email_verified,
          created_at: result.user.created_at
        },
        token: result.token,
        wallet: result.wallet
      });
    } catch (error) {
      console.error('❌ [CONTROLLER] Erro no controller de registro:', error);
      console.error('❌ [CONTROLLER] Error code:', error.code);
      console.error('❌ [CONTROLLER] Error message:', error.message);
      console.error('❌ [CONTROLLER] Error details:', error.details);

      // Tratar erros customizados do service
      if (error.code === 'CONFLICT') {
        return conflictResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, 'Erro ao criar usuário', { details: error.details });
      }

      if (error.code === 'AUTH_ERROR') {
        return errorResponse(res, 500, error.message || 'Erro ao criar conta no sistema de autenticação');
      }

      if (error.code === 'SYNC_ERROR') {
        return errorResponse(res, 500, error.message || 'Erro ao sincronizar dados do usuário');
      }

      if (error.code === 'INTERNAL_ERROR') {
        return errorResponse(res, 500, error.message || 'Erro interno ao processar registro');
      }

      // Erro genérico (com mais detalhes no log)
      console.error('❌ [CONTROLLER] Erro não tratado:', error);
      return errorResponse(res, 500, 'Erro interno ao processar registro', { 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  }

  /**
   * POST /api/auth/login
   * Realiza login do usuário
   */
  async login(req, res) {
    try {
      // 1. Validar dados de entrada com Zod
      const validationResult = loginSchema.safeParse(req.body);

      if (!validationResult.success) {
        return validationErrorResponse(res, validationResult.error.errors);
      }

      const credentials = validationResult.data;

      // 2. Chamar service para autenticar usuário
      const result = await authService.login(credentials);

      // 3. Retornar resposta de sucesso
      return successResponse(res, 200, 'Login realizado com sucesso', {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          cpf: result.user.cpf,
          pix_key: result.user.pix_key,
          pix_type: result.user.pix_type,
          email_verified: result.user.email_verified,
          created_at: result.user.created_at
        },
        token: result.token,
        wallet: result.wallet
      });
    } catch (error) {
      console.error('Erro no controller de login:', error);

      // Tratar erros customizados do service
      if (error.code === 'UNAUTHORIZED') {
        return unauthorizedResponse(res, error.message);
      }

      if (error.code === 'FORBIDDEN') {
        return errorResponse(res, 403, error.message);
      }

      // Erro genérico
      return errorResponse(res, 500, 'Erro interno ao processar login');
    }
  }

  /**
   * GET /api/auth/profile
   * Obtém perfil do usuário autenticado
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const result = await authService.getProfile(userId);

      return successResponse(res, 200, 'Perfil obtido com sucesso', result);
    } catch (error) {
      console.error('Erro no controller getProfile:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao buscar perfil');
    }
  }

  /**
   * PUT /api/auth/profile
   * Atualiza perfil do usuário autenticado
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const result = await authService.updateProfile(userId, updateData);

      return successResponse(res, 200, 'Perfil atualizado com sucesso', result);
    } catch (error) {
      console.error('Erro no controller updateProfile:', error);

      if (error.code === 'NOT_FOUND') {
        return notFoundResponse(res, error.message);
      }

      if (error.code === 'DATABASE_ERROR') {
        return errorResponse(res, 500, error.message, { details: error.details });
      }

      return errorResponse(res, 500, 'Erro ao atualizar perfil');
    }
  }

  /**
   * GET /api/auth/health
   * Verifica saúde do serviço de autenticação
   */
  async health(req, res) {
    return successResponse(res, 200, 'Serviço de autenticação está funcionando', {
      timestamp: new Date().toISOString(),
      service: 'auth'
    });
  }
}

module.exports = new AuthController();





