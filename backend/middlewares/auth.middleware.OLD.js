/**
 * ============================================================
 * Auth Middleware - Middleware de Autenticação
 * ============================================================
 */

const { verifyToken } = require('../utils/jwt.util');
const { unauthorizedResponse, errorResponse } = require('../utils/response.util');

/**
 * Middleware para verificar token JWT
 * Adiciona o payload decodificado em req.user
 */
const authenticateToken = (req, res, next) => {
  try {
    // 1. Extrair token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return unauthorizedResponse(res, 'Token de autenticação não fornecido');
    }

    // 2. Verificar e decodificar token
    const decoded = verifyToken(token);

    if (!decoded) {
      return unauthorizedResponse(res, 'Token inválido ou expirado');
    }

    console.log('🔓 [AUTH MIDDLEWARE] Token decodificado:');
    console.log('   - user_id:', decoded.user_id);
    console.log('   - email:', decoded.email);

    // 3. Adicionar dados do usuário ao request
    req.user = {
      id: decoded.user_id, // Corrigido: JWT usa 'user_id'
      email: decoded.email
    };

    console.log('✅ [AUTH MIDDLEWARE] req.user setado:', req.user);

    // 4. Continuar para próximo middleware/controller
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return unauthorizedResponse(res, 'Token malformado');
    }
    
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Token expirado');
    }

    return errorResponse(res, 500, 'Erro ao validar autenticação');
  }
};

/**
 * Middleware opcional de autenticação
 * Se houver token válido, adiciona req.user, senão continua sem autenticação
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = {
          id: decoded.user_id, // Corrigido: JWT usa 'user_id'
          email: decoded.email
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




