/**
 * ============================================================
 * Admin Withdrawals Service
 * ============================================================
 * Gerenciamento unificado de TODOS os saques (parceiros + apostadores)
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Listar TODOS os saques (parceiros + apostadores)
 */
async function getAllWithdrawals(filters = {}) {
  try {
    console.log('📋 [ADMIN] Buscando todos os saques - Filtros:', filters);

    // 1. Buscar saques de INFLUENCERS
    let influencerQuery = supabase
      .from('influencer_withdrawals')
      .select(`
        *,
        influencer:influencers!influencer_id (
          id,
          name,
          phone,
          email
        )
      `)
      .order('requested_at', { ascending: false });

    // Filtrar por status se especificado
    if (filters.status) {
      influencerQuery = influencerQuery.eq('status', filters.status);
    }

    const { data: influencerWithdrawals, error: influencerError } = await influencerQuery;

    if (influencerError) {
      console.error('❌ Erro ao buscar saques de influencers:', influencerError);
    }

    // 2. Buscar saques de APOSTADORES (transactions com type='saque')
    let userQuery = supabase
      .from('transactions')
      .select(`
        *,
        user:users!user_id (
          id,
          name,
          phone,
          email,
          cpf,
          pix_key,
          pix_type
        )
      `)
      .eq('type', 'saque')
      .order('created_at', { ascending: false });

    // Filtrar por status se especificado
    if (filters.status) {
      const statusMap = {
        pending: 'pending',
        approved: 'completed',
        rejected: 'failed',
        cancelled: 'cancelled'
      };
      userQuery = userQuery.eq('status', statusMap[filters.status] || filters.status);
    }

    const { data: userWithdrawals, error: userError } = await userQuery;

    if (userError) {
      console.error('❌ Erro ao buscar saques de usuários:', userError);
    }

    // 3. Combinar e formatar ambos os tipos
    const allWithdrawals = [];

    // Adicionar saques de influencers
    (influencerWithdrawals || []).forEach(w => {
      allWithdrawals.push({
        id: w.id,
        type: 'influencer',
        amount: parseFloat(w.amount),
        pix_key: w.pix_key,
        pix_type: w.pix_type,
        status: w.status,
        requested_at: w.requested_at,
        approved_at: w.approved_at,
        rejected_at: w.rejected_at,
        rejection_reason: w.rejection_reason,
        notes: w.notes,
        // Dados do solicitante
        requester: {
          id: w.influencer?.id,
          name: w.influencer?.name,
          phone: w.influencer?.phone,
          email: w.influencer?.email,
          type: 'Parceiro'
        }
      });
    });

    // Adicionar saques de apostadores
    (userWithdrawals || []).forEach(w => {
      // Mapear status de transaction para withdrawal
      const statusMap = {
        pending: 'pending',
        completed: 'approved',
        failed: 'rejected',
        cancelled: 'cancelled'
      };

      allWithdrawals.push({
        id: w.id,
        type: 'user',
        amount: parseFloat(w.amount) / 100, // Transactions em centavos
        pix_key: w.metadata?.pix_key || w.user?.pix_key,
        pix_type: w.metadata?.pix_type || w.user?.pix_type,
        status: statusMap[w.status] || w.status,
        requested_at: w.created_at,
        approved_at: w.metadata?.approved_at || (w.status === 'completed' ? w.processed_at : null),
        rejected_at: w.metadata?.rejected_at || (w.status === 'failed' ? w.processed_at : null),
        rejection_reason: w.metadata?.rejection_reason,
        notes: w.description,
        // Dados do solicitante
        requester: {
          id: w.user?.id,
          name: w.user?.name,
          phone: w.user?.phone,
          email: w.user?.email,
          cpf: w.user?.cpf,
          type: 'Apostador'
        }
      });
    });

    // 4. Ordenar por data (mais recentes primeiro)
    allWithdrawals.sort((a, b) => 
      new Date(b.requested_at) - new Date(a.requested_at)
    );

    // 5. Aplicar paginação
    const limit = parseInt(filters.limit) || 50;
    const offset = parseInt(filters.offset) || 0;
    const paginatedWithdrawals = allWithdrawals.slice(offset, offset + limit);

    console.log(`✅ [ADMIN] ${allWithdrawals.length} saques encontrados (${influencerWithdrawals?.length || 0} parceiros + ${userWithdrawals?.length || 0} apostadores)`);

    return {
      success: true,
      data: {
        withdrawals: paginatedWithdrawals,
        pagination: {
          total: allWithdrawals.length,
          limit,
          offset
        },
        stats: {
          total: allWithdrawals.length,
          influencers: influencerWithdrawals?.length || 0,
          users: userWithdrawals?.length || 0
        }
      }
    };
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao buscar saques:', error);
    throw error;
  }
}

/**
 * Aprovar saque (influencer ou user)
 */
async function approveWithdrawal(withdrawalId, withdrawalType, adminId) {
  try {
    console.log(`✅ [ADMIN] Aprovando saque ${withdrawalType}: ${withdrawalId}`);

    if (withdrawalType === 'influencer') {
      // Aprovar saque de influencer (usa service específico)
      const influencerWithdrawalService = require('./influencer-withdrawals.service');
      return await influencerWithdrawalService.approveWithdrawal(withdrawalId, adminId);
    } else {
      // Aprovar saque de usuário (atualizar transaction)
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*, user:users!user_id(name, email)')
        .eq('id', withdrawalId)
        .eq('type', 'saque')
        .single();

      if (fetchError || !transaction) {
        throw new Error('Saque não encontrado');
      }

      if (transaction.status !== 'pending') {
        throw new Error('Saque já foi processado');
      }

      // Atualizar para completed
      const { data: updated, error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          metadata: {
            ...transaction.metadata,
            approved_at: new Date().toISOString(),
            approved_by: adminId
          }
        })
        .eq('id', withdrawalId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      console.log('✅ [ADMIN] Saque de usuário aprovado');

      return {
        success: true,
        message: 'Saque aprovado e pago com sucesso',
        data: updated
      };
    }
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao aprovar saque:', error);
    throw error;
  }
}

/**
 * Rejeitar saque (influencer ou user)
 */
async function rejectWithdrawal(withdrawalId, withdrawalType, adminId, reason) {
  try {
    console.log(`❌ [ADMIN] Rejeitando saque ${withdrawalType}: ${withdrawalId}`);

    if (!reason) {
      throw new Error('Motivo da rejeição é obrigatório');
    }

    if (withdrawalType === 'influencer') {
      // Rejeitar saque de influencer (usa service específico)
      const influencerWithdrawalService = require('./influencer-withdrawals.service');
      return await influencerWithdrawalService.rejectWithdrawal(withdrawalId, adminId, reason);
    } else {
      // Rejeitar saque de usuário
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', withdrawalId)
        .eq('type', 'saque')
        .single();

      if (fetchError || !transaction) {
        throw new Error('Saque não encontrado');
      }

      if (transaction.status !== 'pending') {
        throw new Error('Saque já foi processado');
      }

      // Atualizar para failed
      const { data: updated, error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'failed',
          processed_at: new Date().toISOString(),
          metadata: {
            ...transaction.metadata,
            rejection_reason: reason,
            rejected_at: new Date().toISOString(),
            rejected_by: adminId
          }
        })
        .eq('id', withdrawalId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      console.log('✅ [ADMIN] Saque de usuário rejeitado');

      return {
        success: true,
        message: 'Saque rejeitado',
        data: updated
      };
    }
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao rejeitar saque:', error);
    throw error;
  }
}

module.exports = {
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
};

