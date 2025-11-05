/**
 * ============================================================
 * Admin Middleware - Middleware de Autorização Admin
 * ============================================================
 * Verifica se o usuário autenticado possui role='admin'
 */

const { supabase } = require('../config/supabase.config');
const { unauthorizedResponse, forbiddenResponse, errorResponse } = require('../utils/response.util');

/**
 * Middleware para verificar se o usuário é admin
 * IMPORTANTE: Este middleware deve ser usado APÓS authenticateToken
 * pois depende de req.user já estar preenchido
 */
const isAdmin = async (req, res, next) => {
  try {
    // 1. Verificar se req.user existe (deve ter sido setado pelo authenticateToken)
    if (!req.user || !req.user.id) {
      return unauthorizedResponse(res, 'Usuário não autenticado');
    }

    const userId = req.user.id;

    console.log('🔐 [ADMIN MIDDLEWARE] Verificando role do usuário:', userId);

    // 2. Buscar role do usuário na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, name, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('❌ [ADMIN MIDDLEWARE] Erro ao buscar usuário:', userError);
      return errorResponse(res, 500, 'Erro ao verificar permissões do usuário');
    }

    console.log('👤 [ADMIN MIDDLEWARE] Usuário encontrado:', {
      email: userData.email,
      role: userData.role
    });

    // 3. Verificar se o usuário tem role='admin'
    if (userData.role !== 'admin') {
      console.warn('⚠️ [ADMIN MIDDLEWARE] Acesso negado - usuário não é admin:', {
        email: userData.email,
        role: userData.role
      });
      return forbiddenResponse(res, 'Acesso negado. Apenas administradores podem acessar este recurso.');
    }

    console.log('✅ [ADMIN MIDDLEWARE] Acesso autorizado - admin confirmado');

    // 4. Adicionar informações extras ao req.user
    req.user.role = userData.role;
    req.user.name = userData.name;

    // 5. Continuar para o próximo middleware/controller
    next();
  } catch (error) {
    console.error('❌ [ADMIN MIDDLEWARE] Erro inesperado:', error);
    return errorResponse(res, 500, 'Erro ao validar permissões de administrador');
  }
};

module.exports = {
  isAdmin
};

