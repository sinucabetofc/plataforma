/**
 * ============================================================
 * Admin Middleware - Middleware de Administração
 * ============================================================
 * Verifica se o usuário autenticado possui role='admin'
 */

const { supabase } = require('../config/supabase.config');

/**
 * Verifica se o usuário é administrador
 */
const isAdmin = async (req, res, next) => {
  try {
    // Verificar se req.user já foi definido pelo middleware authenticateToken
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Buscar role do usuário no banco
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', req.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('❌ [ADMIN MIDDLEWARE] Erro ao buscar perfil:', profileError);
      return res.status(401).json({
        success: false,
        message: 'Dados do usuário não encontrados'
      });
    }

    // Verificar se é admin
    if (userProfile.role !== 'admin') {
      console.log(`⚠️ [ADMIN MIDDLEWARE] Acesso negado para usuário ${req.user.id} (role: ${userProfile.role})`);
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão de administrador.'
      });
    }

    // Verificar se está ativo
    if (!userProfile.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Sua conta está inativa. Entre em contato com o suporte.'
      });
    }

    // Adicionar role ao req.user
    req.user.role = userProfile.role;
    req.user.is_active = userProfile.is_active;

    console.log(`✅ [ADMIN MIDDLEWARE] Admin ${req.user.id} autorizado`);
    next();
  } catch (error) {
    console.error('❌ [ADMIN MIDDLEWARE] Erro inesperado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao validar permissões de administrador'
    });
  }
};

module.exports = { isAdmin };



