/**
 * ============================================================
 * Influencer Withdrawals Service
 * ============================================================
 * Gerenciamento de saques dos parceiros/influencers
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Solicitar novo saque (Influencer)
 */
async function requestWithdrawal(influencerId, data) {
  try {
    console.log(`💰 Solicitando saque para influencer ${influencerId}:`, data);

    // Validar dados obrigatórios
    if (!data.amount || data.amount <= 0) {
      throw new Error('Valor inválido');
    }

    // Buscar dados do influencer (pix_key, pix_type, phone)
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .select('pix_key, pix_type, phone, name, is_active')
      .eq('id', influencerId)
      .single();

    if (influencerError || !influencer) {
      console.error('❌ Erro ao buscar influencer:', influencerError);
      throw new Error('Parceiro não encontrado');
    }

    if (!influencer.is_active) {
      throw new Error('Parceiro inativo');
    }

    // Buscar saldo disponível
    const { data: commissions, error: commissionsError } = await supabase
      .from('influencer_commissions')
      .select('balance')
      .eq('influencer_id', influencerId)
      .single();

    if (commissionsError) {
      console.error('❌ Erro ao buscar saldo:', commissionsError);
      throw new Error('Erro ao verificar saldo');
    }

    const availableBalance = commissions?.balance || 0;

    // Buscar saques pendentes
    const { data: pendingWithdrawals, error: pendingError } = await supabase
      .from('influencer_withdrawals')
      .select('amount')
      .eq('influencer_id', influencerId)
      .eq('status', 'pending');

    if (pendingError) {
      console.error('❌ Erro ao buscar saques pendentes:', pendingError);
      throw new Error('Erro ao verificar saques pendentes');
    }

    const pendingAmount = pendingWithdrawals?.reduce((sum, w) => sum + parseFloat(w.amount), 0) || 0;
    const realBalance = availableBalance - pendingAmount;

    console.log(`💵 Saldo disponível: R$ ${availableBalance}`);
    console.log(`⏳ Saques pendentes: R$ ${pendingAmount}`);
    console.log(`✅ Saldo real disponível: R$ ${realBalance}`);

    if (realBalance < data.amount) {
      throw new Error(`Saldo insuficiente. Disponível: R$ ${realBalance.toFixed(2)}`);
    }

    // Criar solicitação de saque
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('influencer_withdrawals')
      .insert({
        influencer_id: influencerId,
        amount: data.amount,
        pix_key: influencer.pix_key,
        pix_type: influencer.pix_type,
        status: 'pending',
        notes: data.notes || null,
        metadata: {
          influencer_name: influencer.name,
          influencer_phone: influencer.phone,
          requested_from: 'web'
        }
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error('❌ Erro ao criar saque:', withdrawalError);
      throw new Error(withdrawalError.message || 'Erro ao solicitar saque');
    }

    console.log('✅ Saque solicitado com sucesso:', withdrawal.id);

    return {
      success: true,
      message: 'Saque solicitado com sucesso',
      data: withdrawal
    };
  } catch (error) {
    console.error('❌ Erro ao solicitar saque:', error);
    throw error;
  }
}

/**
 * Listar saques (Influencer ou Admin)
 */
async function listWithdrawals(userId, role, filters = {}) {
  try {
    console.log(`📋 Listando saques - Role: ${role}, Filters:`, filters);

    let query = supabase
      .from('influencer_withdrawals')
      .select(`
        *,
        influencer:influencers!influencer_id (
          id,
          name,
          phone,
          email
        ),
        approved_by_user:users!approved_by (
          id,
          name,
          email
        ),
        rejected_by_user:users!rejected_by (
          id,
          name,
          email
        )
      `)
      .order('requested_at', { ascending: false });

    // Filtrar por influencer se não for admin
    if (role !== 'admin') {
      query = query.eq('influencer_id', userId);
    }

    // Filtros opcionais
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.influencer_id && role === 'admin') {
      query = query.eq('influencer_id', filters.influencer_id);
    }

    // Paginação
    const limit = parseInt(filters.limit) || 50;
    const offset = parseInt(filters.offset) || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Erro ao listar saques:', error);
      throw new Error(error.message);
    }

    console.log(`✅ ${data?.length || 0} saques encontrados`);

    return {
      success: true,
      data: {
        withdrawals: data || [],
        pagination: {
          total: count,
          limit,
          offset
        }
      }
    };
  } catch (error) {
    console.error('❌ Erro ao listar saques:', error);
    throw error;
  }
}

/**
 * Buscar saque específico
 */
async function getWithdrawalById(withdrawalId, userId, role) {
  try {
    console.log(`🔍 Buscando saque ${withdrawalId}`);

    let query = supabase
      .from('influencer_withdrawals')
      .select(`
        *,
        influencer:influencers!influencer_id (
          id,
          name,
          phone,
          email,
          pix_key,
          pix_type
        ),
        approved_by_user:users!approved_by (
          id,
          name,
          email
        ),
        rejected_by_user:users!rejected_by (
          id,
          name,
          email
        )
      `)
      .eq('id', withdrawalId)
      .single();

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar saque:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Saque não encontrado');
    }

    // Verificar permissão (influencer só pode ver seus próprios saques)
    if (role !== 'admin' && data.influencer_id !== userId) {
      throw new Error('Sem permissão para acessar este saque');
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('❌ Erro ao buscar saque:', error);
    throw error;
  }
}

/**
 * Aprovar saque (Admin)
 */
async function approveWithdrawal(withdrawalId, adminId, notes = null) {
  try {
    console.log(`✅ Admin ${adminId} aprovando saque ${withdrawalId}`);

    // Buscar saque
    const { data: withdrawal, error: fetchError } = await supabase
      .from('influencer_withdrawals')
      .select('*, influencer:influencers!influencer_id(name, email)')
      .eq('id', withdrawalId)
      .single();

    if (fetchError || !withdrawal) {
      console.error('❌ Erro ao buscar saque:', fetchError);
      throw new Error('Saque não encontrado');
    }

    if (withdrawal.status !== 'pending') {
      throw new Error(`Saque já foi ${withdrawal.status === 'approved' ? 'aprovado' : 'processado'}`);
    }

    // Atualizar status para aprovado
    const { data: updated, error: updateError } = await supabase
      .from('influencer_withdrawals')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId,
        notes: notes || withdrawal.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao aprovar saque:', updateError);
      throw new Error(updateError.message);
    }

    console.log('✅ Saque aprovado com sucesso');

    return {
      success: true,
      message: 'Saque aprovado e pago com sucesso',
      data: updated
    };
  } catch (error) {
    console.error('❌ Erro ao aprovar saque:', error);
    throw error;
  }
}

/**
 * Rejeitar saque (Admin)
 */
async function rejectWithdrawal(withdrawalId, adminId, reason) {
  try {
    console.log(`❌ Admin ${adminId} rejeitando saque ${withdrawalId}`);

    if (!reason) {
      throw new Error('Motivo da rejeição é obrigatório');
    }

    // Buscar saque
    const { data: withdrawal, error: fetchError } = await supabase
      .from('influencer_withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (fetchError || !withdrawal) {
      throw new Error('Saque não encontrado');
    }

    if (withdrawal.status !== 'pending') {
      throw new Error(`Saque já foi ${withdrawal.status === 'approved' ? 'aprovado' : 'processado'}`);
    }

    // Atualizar status para rejeitado
    const { data: updated, error: updateError } = await supabase
      .from('influencer_withdrawals')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: adminId,
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao rejeitar saque:', updateError);
      throw new Error(updateError.message);
    }

    console.log('✅ Saque rejeitado');

    return {
      success: true,
      message: 'Saque rejeitado',
      data: updated
    };
  } catch (error) {
    console.error('❌ Erro ao rejeitar saque:', error);
    throw error;
  }
}

/**
 * Cancelar saque (Influencer - apenas pendentes)
 */
async function cancelWithdrawal(withdrawalId, influencerId) {
  try {
    console.log(`🚫 Influencer ${influencerId} cancelando saque ${withdrawalId}`);

    // Buscar saque
    const { data: withdrawal, error: fetchError } = await supabase
      .from('influencer_withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .eq('influencer_id', influencerId)
      .single();

    if (fetchError || !withdrawal) {
      throw new Error('Saque não encontrado');
    }

    if (withdrawal.status !== 'pending') {
      throw new Error('Apenas saques pendentes podem ser cancelados');
    }

    // Atualizar status para cancelado
    const { data: updated, error: updateError } = await supabase
      .from('influencer_withdrawals')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao cancelar saque:', updateError);
      throw new Error(updateError.message);
    }

    console.log('✅ Saque cancelado');

    return {
      success: true,
      message: 'Saque cancelado com sucesso',
      data: updated
    };
  } catch (error) {
    console.error('❌ Erro ao cancelar saque:', error);
    throw error;
  }
}

/**
 * Estatísticas de saques (Admin)
 */
async function getWithdrawalsStats() {
  try {
    console.log('📊 Buscando estatísticas de saques');

    // Total por status
    const { data: stats, error } = await supabase
      .from('influencer_withdrawals')
      .select('status, amount');

    if (error) {
      throw new Error(error.message);
    }

    const statistics = {
      total: stats.length,
      pending: {
        count: stats.filter(s => s.status === 'pending').length,
        amount: stats.filter(s => s.status === 'pending').reduce((sum, s) => sum + parseFloat(s.amount), 0)
      },
      approved: {
        count: stats.filter(s => s.status === 'approved').length,
        amount: stats.filter(s => s.status === 'approved').reduce((sum, s) => sum + parseFloat(s.amount), 0)
      },
      rejected: {
        count: stats.filter(s => s.status === 'rejected').length,
        amount: stats.filter(s => s.status === 'rejected').reduce((sum, s) => sum + parseFloat(s.amount), 0)
      },
      cancelled: {
        count: stats.filter(s => s.status === 'cancelled').length,
        amount: stats.filter(s => s.status === 'cancelled').reduce((sum, s) => sum + parseFloat(s.amount), 0)
      }
    };

    return {
      success: true,
      data: statistics
    };
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    throw error;
  }
}

module.exports = {
  requestWithdrawal,
  listWithdrawals,
  getWithdrawalById,
  approveWithdrawal,
  rejectWithdrawal,
  cancelWithdrawal,
  getWithdrawalsStats
};

