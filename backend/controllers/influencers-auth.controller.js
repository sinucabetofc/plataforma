/**
 * ============================================================
 * Influencers Auth Controller
 * ============================================================
 * Autenticação de influencers/parceiros
 * Data: 08/11/2025
 */

const { supabase } = require('../config/supabase.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * POST /api/influencers/auth/login
 * Login de influencer
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    console.log('🔐 [INFLUENCER AUTH] Tentativa de login:', email);

    // Buscar influencer por email
    const { data: influencer, error } = await supabase
      .from('influencers')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !influencer) {
      console.error('❌ [INFLUENCER AUTH] Influencer não encontrado:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar se está ativo
    if (!influencer.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, influencer.password_hash);

    if (!passwordMatch) {
      console.error('❌ [INFLUENCER AUTH] Senha incorreta:', email);
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        influencerId: influencer.id,
        email: influencer.email,
        type: 'influencer'
      },
      process.env.JWT_SECRET || 'sinucabet-secret-key',
      { expiresIn: '7d' }
    );

    // Remover senha do retorno
    delete influencer.password_hash;

    console.log('✅ [INFLUENCER AUTH] Login bem-sucedido:', influencer.id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        influencer,
        token
      }
    });
  } catch (error) {
    console.error('❌ [INFLUENCER AUTH] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
};

/**
 * POST /api/influencers/auth/logout
 * Logout de influencer (apenas para consistência, JWT não tem logout real)
 */
const logout = async (req, res) => {
  try {
    console.log('👋 [INFLUENCER AUTH] Logout do influencer:', req.influencer?.id);

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('❌ [INFLUENCER AUTH] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer logout',
      error: error.message
    });
  }
};

/**
 * GET /api/influencers/auth/me
 * Retorna dados do influencer autenticado
 */
const me = async (req, res) => {
  try {
    const { id } = req.influencer;

    console.log('👤 [INFLUENCER AUTH] Buscando dados do influencer:', id);

    // Buscar dados completos
    const { data: influencer, error } = await supabase
      .from('influencers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !influencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer não encontrado'
      });
    }

    // Remover senha
    delete influencer.password_hash;

    // Buscar estatísticas básicas
    const { data: matches } = await supabase
      .from('matches')
      .select('id, status')
      .eq('influencer_id', id);

    const { data: commissions } = await supabase
      .from('influencer_commissions')
      .select('commission_amount, status')
      .eq('influencer_id', id);

    influencer.stats = {
      total_matches: matches?.length || 0,
      active_matches: matches?.filter(m => m.status === 'em_andamento').length || 0,
      total_commissions: commissions?.reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0) || 0,
      pending_commissions: commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0) || 0
    };

    console.log('✅ [INFLUENCER AUTH] Dados retornados:', influencer.id);

    res.json({
      success: true,
      data: influencer
    });
  } catch (error) {
    console.error('❌ [INFLUENCER AUTH] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados',
      error: error.message
    });
  }
};

/**
 * PATCH /api/influencers/auth/profile
 * Atualizar próprio perfil (dados básicos)
 */
const updateProfile = async (req, res) => {
  try {
    const { id } = req.influencer;
    const { name, phone, photo_url, social_media, pix_key, current_password, new_password } = req.body;

    console.log('✏️ [INFLUENCER AUTH] Atualizando perfil:', id);

    // Preparar dados para atualização
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (photo_url !== undefined) updateData.photo_url = photo_url;
    if (social_media) updateData.social_media = social_media;
    if (pix_key) updateData.pix_key = pix_key;

    // Se quiser mudar senha, precisa da senha atual
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual é obrigatória para alterar senha'
        });
      }

      // Buscar influencer para verificar senha atual
      const { data: influencer } = await supabase
        .from('influencers')
        .select('password_hash')
        .eq('id', id)
        .single();

      const passwordMatch = await bcrypt.compare(current_password, influencer.password_hash);

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }

      // Hash da nova senha
      updateData.password_hash = await bcrypt.hash(new_password, 10);
    }

    // Atualizar
    const { data: updated, error } = await supabase
      .from('influencers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [INFLUENCER AUTH] Erro ao atualizar:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar perfil',
        error: error.message
      });
    }

    // Remover senha
    delete updated.password_hash;

    console.log('✅ [INFLUENCER AUTH] Perfil atualizado:', updated.id);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updated
    });
  } catch (error) {
    console.error('❌ [INFLUENCER AUTH] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error.message
    });
  }
};

module.exports = {
  login,
  logout,
  me,
  updateProfile
};

