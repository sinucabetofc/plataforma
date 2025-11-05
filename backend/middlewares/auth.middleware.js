/**
 * ============================================================
 * Auth Middleware - NOVA VERSÃO com Supabase Auth
 * ============================================================
 * Migrado de JWT manual para Supabase Auth
 * Data: 05/11/2025
 */

const { supabase } = require('../config/supabase.config');
const { unauthorizedResponse, errorResponse } = require('../utils/response.util');

/**
 * Middleware para verificar autenticação via Supabase Auth
 * Usa o token JWT do Supabase em vez de manual
 */
const authenticateToken = async (req, res, next) => {
  try {
    // 1. Extrair token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return unauthorizedResponse(res, 'Token de autenticação não fornecido');
    }

    console.log('🔓 [AUTH MIDDLEWARE SUPABASE] Verificando token...');

    // 2. Verificar token usando Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error('❌ [AUTH MIDDLEWARE] Erro ao verificar token:', error);
      return unauthorizedResponse(res, 'Token inválido ou expirado');
    }

    console.log('✅ [AUTH MIDDLEWARE SUPABASE] Usuário autenticado:', data.user.email);

    // 3. Adicionar dados do usuário ao request
    req.user = {
      id: data.user.id,
      email: data.user.email,
      metadata: data.user.user_metadata
    };

    console.log('✅ [AUTH MIDDLEWARE] req.user setado:', {
      id: req.user.id,
      email: req.user.email
    });

    // 4. Continuar para próximo middleware/controller
    next();
  } catch (error) {
    console.error('❌ [AUTH MIDDLEWARE] Erro inesperado:', error);
    return errorResponse(res, 500, 'Erro ao validar autenticação');
  }
};

/**
 * Middleware opcional de autenticação
 * Se houver token válido, adiciona req.user, senão continua sem autenticação
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      
      if (!error && data.user) {
        req.user = {
          id: data.user.id,
          email: data.user.email,
          metadata: data.user.user_metadata
        };
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, apenas continue sem autenticação
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};

