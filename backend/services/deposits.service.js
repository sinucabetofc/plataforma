/**
 * ============================================================
 * Deposits Service - Gerenciamento de Depósitos (Admin)
 * ============================================================
 */

const { supabase } = require('../config/supabase.config');

class DepositsService {
  /**
   * Lista depósitos com filtros e paginação
   */
  async getDeposits({ page = 1, limit = 20, status = null, user_id = null }) {
    try {
      const offset = (page - 1) * limit;

      let query = supabase
        .from('transactions')
        .select(`
          *,
          user:users(id, name, email, cpf, phone)
        `, { count: 'exact' })
        .eq('type', 'deposit');

      // Filtro por status
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Filtro por usuário
      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      // Calcular valores para cada depósito
      const depositsWithDetails = data.map(deposit => {
        const amount = parseFloat(deposit.amount);

        return {
          ...deposit,
          amount_reais: amount / 100,
          created_at_formatted: new Date(deposit.created_at).toLocaleString('pt-BR')
        };
      });

      return {
        deposits: depositsWithDetails,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao listar depósitos:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao listar depósitos',
        details: error.message
      };
    }
  }

  /**
   * Busca detalhes de um depósito específico
   */
  async getDepositById(depositId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          user:users(id, name, email, cpf, phone, pix_key, pix_type)
        `)
        .eq('id', depositId)
        .eq('type', 'deposit')
        .single();

      if (error || !data) {
        throw {
          code: 'NOT_FOUND',
          message: 'Depósito não encontrado'
        };
      }

      const amount = parseFloat(data.amount);

      return {
        ...data,
        amount_reais: amount / 100,
        created_at_formatted: new Date(data.created_at).toLocaleString('pt-BR')
      };
    } catch (error) {
      if (error.code === 'NOT_FOUND') throw error;
      
      console.error('Erro ao buscar depósito:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar depósito',
        details: error.message
      };
    }
  }

  /**
   * Aprova um depósito pendente (marca como completed e credita saldo)
   */
  async approveDeposit(depositId, adminId) {
    try {
      // 1. Buscar depósito
      const { data: deposit, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', depositId)
        .eq('type', 'deposit')
        .single();

      if (fetchError || !deposit) {
        throw {
          code: 'NOT_FOUND',
          message: 'Depósito não encontrado'
        };
      }

      // 2. Verificar se já foi processado
      if (deposit.status === 'completed') {
        throw {
          code: 'ALREADY_PROCESSED',
          message: 'Depósito já foi aprovado anteriormente'
        };
      }

      if (deposit.status === 'failed') {
        throw {
          code: 'ALREADY_PROCESSED',
          message: 'Depósito já foi rejeitado anteriormente'
        };
      }

      // 3. Buscar carteira do usuário
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance, total_deposited')
        .eq('user_id', deposit.user_id)
        .single();

      if (walletError || !wallet) {
        throw {
          code: 'NOT_FOUND',
          message: 'Carteira do usuário não encontrada'
        };
      }

      // 4. Calcular novo saldo
      const newBalance = parseFloat(wallet.balance) + parseFloat(deposit.amount);
      const newTotalDeposited = parseFloat(wallet.total_deposited || 0) + parseFloat(deposit.amount);

      // 5. Atualizar carteira
      const { error: updateWalletError } = await supabase
        .from('wallet')
        .update({
          balance: newBalance,
          total_deposited: newTotalDeposited
        })
        .eq('user_id', deposit.user_id);

      if (updateWalletError) {
        throw updateWalletError;
      }

      // 6. Atualizar status do depósito
      const { data: updatedDeposit, error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          balance_after: newBalance,
          processed_at: new Date().toISOString(),
          metadata: {
            ...deposit.metadata,
            approved_by_admin: adminId,
            approved_at: new Date().toISOString(),
            approval_method: 'manual'
          }
        })
        .eq('id', depositId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return {
        deposit: updatedDeposit,
        message: 'Depósito aprovado e saldo creditado com sucesso'
      };
    } catch (error) {
      if (error.code === 'NOT_FOUND' || error.code === 'ALREADY_PROCESSED') {
        throw error;
      }
      
      console.error('Erro ao aprovar depósito:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao aprovar depósito',
        details: error.message
      };
    }
  }

  /**
   * Rejeita um depósito pendente (marca como failed)
   */
  async rejectDeposit(depositId, adminId, reason = 'Rejeitado pelo administrador') {
    try {
      // 1. Buscar depósito
      const { data: deposit, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', depositId)
        .eq('type', 'deposit')
        .single();

      if (fetchError || !deposit) {
        throw {
          code: 'NOT_FOUND',
          message: 'Depósito não encontrado'
        };
      }

      // 2. Verificar se já foi processado
      if (deposit.status === 'completed') {
        throw {
          code: 'ALREADY_PROCESSED',
          message: 'Depósito já foi aprovado anteriormente e não pode ser rejeitado'
        };
      }

      if (deposit.status === 'failed') {
        throw {
          code: 'ALREADY_PROCESSED',
          message: 'Depósito já foi rejeitado anteriormente'
        };
      }

      // 3. Atualizar status do depósito para failed
      const { data: updatedDeposit, error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'failed',
          description: `${deposit.description || 'Depósito via Pix'} - Rejeitado: ${reason}`,
          processed_at: new Date().toISOString(),
          metadata: {
            ...deposit.metadata,
            rejected_by_admin: adminId,
            rejected_at: new Date().toISOString(),
            rejection_reason: reason
          }
        })
        .eq('id', depositId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return {
        deposit: updatedDeposit,
        message: 'Depósito rejeitado com sucesso'
      };
    } catch (error) {
      if (error.code === 'NOT_FOUND' || error.code === 'ALREADY_PROCESSED') {
        throw error;
      }
      
      console.error('Erro ao rejeitar depósito:', error);
      throw {
        code: 'DATABASE_ERROR',
        message: 'Erro ao rejeitar depósito',
        details: error.message
      };
    }
  }
}

module.exports = new DepositsService();

