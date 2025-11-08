/**
 * ============================================================
 * Influencers Controller - CRUD para Admin
 * ============================================================
 * Gerenciamento de influencers/parceiros
 * Data: 08/11/2025
 */

const { supabase } = require('../config/supabase.config');
const bcrypt = require('bcryptjs');

/**
 * Health check
 */
const health = (req, res) => {
  res.json({
    success: true,
    message: 'Influencers Controller OK',
    timestamp: new Date().toISOString()
  });
};

/**
 * POST /api/admin/influencers
 * Criar novo influencer
 */
const createInfluencer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      photo_url,
      social_media,
      pix_key,
      pix_type,
      commission_percentage
    } = req.body;

    // Validações básicas
    if (!name || !email || !password || !phone || !pix_key) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: name, email, password, phone, pix_key'
      });
    }

    if (commission_percentage !== undefined && (commission_percentage < 0 || commission_percentage > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Comissão deve estar entre 0 e 100%'
      });
    }

    console.log('📝 [INFLUENCERS] Criando novo influencer:', email);

    // Verificar se email já existe
    const { data: existingInfluencer } = await supabase
      .from('influencers')
      .select('id')
      .eq('email', email)
      .single();

    if (existingInfluencer) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    // Criar influencer
    const influencerData = {
      name,
      email,
      password_hash,
      phone,
      photo_url: photo_url || null,
      social_media: social_media || {},
      pix_key,
      commission_percentage: commission_percentage || 0,
      is_active: true
    };

    // Adicionar pix_type apenas se fornecido (para compatibilidade)
    if (pix_type) {
      influencerData.pix_type = pix_type;
    }

    const { data: influencer, error } = await supabase
      .from('influencers')
      .insert([influencerData])
      .select()
      .single();

    if (error) {
      console.error('❌ [INFLUENCERS] Erro ao criar:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar influencer',
        error: error.message
      });
    }

    // Remover password_hash do retorno
    delete influencer.password_hash;

    console.log('✅ [INFLUENCERS] Influencer criado:', influencer.id);

    res.status(201).json({
      success: true,
      message: 'Influencer criado com sucesso',
      data: influencer
    });
  } catch (error) {
    console.error('❌ [INFLUENCERS] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar influencer',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/influencers
 * Listar todos os influencers
 */
const listInfluencers = async (req, res) => {
  try {
    const { is_active, search, limit = 50, offset = 0 } = req.query;

    console.log('📋 [INFLUENCERS] Listando influencers...');

    let query = supabase
      .from('influencers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filtro por status
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    // Busca por nome ou email
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Paginação
    query = query.range(offset, parseInt(offset) + parseInt(limit) - 1);

    const { data: influencers, error, count } = await query;

    if (error) {
      console.error('❌ [INFLUENCERS] Erro ao listar:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar influencers',
        error: error.message
      });
    }

    // Remover password_hash
    const sanitizedInfluencers = influencers.map(inf => {
      const { password_hash, ...rest } = inf;
      return rest;
    });

    console.log(`✅ [INFLUENCERS] ${influencers.length} influencers encontrados`);

    res.json({
      success: true,
      data: sanitizedInfluencers,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < count
      }
    });
  } catch (error) {
    console.error('❌ [INFLUENCERS] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar influencers',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/influencers/:id
 * Buscar influencer específico
 */
const getInfluencer = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 [INFLUENCERS] Buscando influencer:', id);

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

    // Remover password_hash
    delete influencer.password_hash;

    // Buscar estatísticas
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, status')
      .eq('influencer_id', id);

    const { data: commissions, error: commissionsError } = await supabase
      .from('influencer_commissions')
      .select('commission_amount, status')
      .eq('influencer_id', id);

    influencer.stats = {
      total_matches: matches?.length || 0,
      active_matches: matches?.filter(m => m.status === 'em_andamento').length || 0,
      total_commissions: commissions?.reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0) || 0,
      paid_commissions: commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0) || 0
    };

    console.log('✅ [INFLUENCERS] Influencer encontrado:', influencer.id);

    res.json({
      success: true,
      data: influencer
    });
  } catch (error) {
    console.error('❌ [INFLUENCERS] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar influencer',
      error: error.message
    });
  }
};

/**
 * PATCH /api/admin/influencers/:id
 * Atualizar influencer
 */
const updateInfluencer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      phone,
      photo_url,
      social_media,
      pix_key,
      pix_type,
      commission_percentage,
      is_active
    } = req.body;

    console.log('✏️ [INFLUENCERS] Atualizando influencer:', id);

    // Buscar influencer atual
    const { data: existingInfluencer, error: fetchError } = await supabase
      .from('influencers')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingInfluencer) {
      return res.status(404).json({
        success: false,
        message: 'Influencer não encontrado'
      });
    }

    // Preparar dados para atualização
    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (photo_url !== undefined) updateData.photo_url = photo_url;
    if (social_media) updateData.social_media = social_media;
    if (pix_key) updateData.pix_key = pix_key;
    // pix_type é opcional (compatibilidade com schema cache)
    if (pix_type !== undefined) {
      try {
        updateData.pix_type = pix_type;
      } catch (e) {
        console.log('⚠️ [INFLUENCERS] pix_type não disponível no schema ainda');
      }
    }
    if (commission_percentage !== undefined) {
      if (commission_percentage < 0 || commission_percentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'Comissão deve estar entre 0 e 100%'
        });
      }
      updateData.commission_percentage = commission_percentage;
    }
    if (is_active !== undefined) updateData.is_active = is_active;

    // Se houver nova senha, fazer hash
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Verificar email único (se mudou)
    if (email) {
      const { data: emailCheck } = await supabase
        .from('influencers')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .single();

      if (emailCheck) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // Atualizar
    const { data: influencer, error } = await supabase
      .from('influencers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [INFLUENCERS] Erro ao atualizar:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar influencer',
        error: error.message
      });
    }

    // Remover password_hash
    delete influencer.password_hash;

    console.log('✅ [INFLUENCERS] Influencer atualizado:', influencer.id);

    res.json({
      success: true,
      message: 'Influencer atualizado com sucesso',
      data: influencer
    });
  } catch (error) {
    console.error('❌ [INFLUENCERS] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar influencer',
      error: error.message
    });
  }
};

/**
 * DELETE /api/admin/influencers/:id
 * Deletar/desativar influencer
 */
const deleteInfluencer = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    console.log('🗑️ [INFLUENCERS] Deletando influencer:', id, `(permanent: ${permanent})`);

    if (permanent === 'true') {
      // Deletar permanentemente
      const { error } = await supabase
        .from('influencers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ [INFLUENCERS] Erro ao deletar:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro ao deletar influencer',
          error: error.message
        });
      }

      console.log('✅ [INFLUENCERS] Influencer deletado permanentemente');

      res.json({
        success: true,
        message: 'Influencer deletado permanentemente'
      });
    } else {
      // Apenas desativar
      const { data, error } = await supabase
        .from('influencers')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [INFLUENCERS] Erro ao desativar:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro ao desativar influencer',
          error: error.message
        });
      }

      console.log('✅ [INFLUENCERS] Influencer desativado');

      res.json({
        success: true,
        message: 'Influencer desativado com sucesso',
        data: { id: data.id, is_active: data.is_active }
      });
    }
  } catch (error) {
    console.error('❌ [INFLUENCERS] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar influencer',
      error: error.message
    });
  }
};

module.exports = {
  health,
  createInfluencer,
  listInfluencers,
  getInfluencer,
  updateInfluencer,
  deleteInfluencer
};

