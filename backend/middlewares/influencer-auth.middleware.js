/**
 * ============================================================
 * Influencer Auth Middleware
 * ============================================================
 * Middleware para autenticação de influencers/parceiros
 * Data: 08/11/2025
 */

const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase.config');

/**
 * Middleware para verificar autenticação de influencer
 * Usa JWT manual (não Supabase Auth)
 */
const authenticateInfluencer = async (req, res, next) => {
  try {
    // 1. Extrair token do header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    console.log('🔓 [INFLUENCER AUTH] Verificando token...');

    // 2. Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sinucabet-secret-key');

    if (decoded.type !== 'influencer') {
      return res.status(403).json({
        success: false,
        message: 'Token inválido para influencer'
      });
    }

    console.log('✅ [INFLUENCER AUTH] Token válido para influencer:', decoded.influencerId);

    // 3. Buscar dados do influencer
    const { data: influencer, error } = await supabase
      .from('influencers')
      .select('id, email, name, is_active, commission_percentage')
      .eq('id', decoded.influencerId)
      .single();

    if (error || !influencer) {
      console.error('❌ [INFLUENCER AUTH] Erro ao buscar influencer:', error);
      return res.status(401).json({
        success: false,
        message: 'Influencer não encontrado'
      });
    }

    // 4. Verificar se está ativo
    if (!influencer.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.'
      });
    }

    // 5. Adicionar dados do influencer ao request
    req.influencer = {
      id: influencer.id,
      email: influencer.email,
      name: influencer.name,
      commission_percentage: influencer.commission_percentage
    };

    console.log('✅ [INFLUENCER AUTH] req.influencer setado:', {
      id: req.influencer.id,
      email: req.influencer.email
    });

    // 6. Continuar para próximo middleware/controller
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Faça login novamente.'
      });
    }

    console.error('❌ [INFLUENCER AUTH] Erro inesperado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao validar autenticação'
    });
  }
};

module.exports = {
  authenticateInfluencer
};

