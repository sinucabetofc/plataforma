/**
 * ============================================================
 * Wallet Service - Lógica de Negócio de Carteira
 * ============================================================
 */

const { supabase } = require('../config/supabase.config');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class WalletService {
  /**
   * Busca dados da carteira do usuário
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} Dados da carteira
   */
  async getWallet(userId) {
    try {
      // 1. Buscar dados da carteira
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('id, balance, blocked_balance, total_deposited, total_withdrawn, created_at, updated_at')
        .eq('user_id', userId)
        .single();

      if (walletError || !wallet) {
        throw {
          code: 'NOT_FOUND',
          message: 'Carteira não encontrada'
        };
      }

      // 2. Calcular saldo bloqueado (apostas pendentes e aceitas)
      // ⚠️ NOTA: Desde migration 1021, apostas são DEBITADAS ao criar
      // Portanto, blocked_balance é apenas informativo, NÃO deve subtrair do balance
      const { data: pendingBets, error: betsError } = await supabase
        .from('bets')
        .select('amount')
        .eq('user_id', userId)
        .in('status', ['pendente', 'aceita']);

      if (betsError) {
        console.error('Erro ao buscar apostas pendentes:', betsError);
      }

      // Somar valor de todas as apostas pendentes/aceitas (apenas para exibição)
      const blockedBalance = pendingBets?.reduce((sum, bet) => sum + bet.amount, 0) || 0;

      // 3. Buscar últimas 10 transações
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('id, type, amount, balance_before, balance_after, description, created_at, metadata')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) {
        console.error('Erro ao buscar transações:', transactionsError);
      }

      // Converter centavos para reais
      const balanceInReais = parseFloat(wallet.balance) / 100;
      const blockedInReais = blockedBalance / 100; // Apenas informativo
      
      // ✅ CORREÇÃO: Não subtrair blocked do balance porque já foi debitado!
      const availableInReais = balanceInReais; // Saldo já reflete apostas feitas
      
      return {
        // Formato esperado pelo frontend
        total_balance: balanceInReais,
        available_balance: availableInReais,
        blocked_balance: blockedInReais, // Saldo bloqueado calculado
        
        // Dados adicionais
        wallet: {
          id: wallet.id,
          balance: parseFloat(wallet.balance), // em centavos
          blocked_balance: blockedBalance, // Saldo bloqueado calculado (apenas informativo)
          total_deposited: parseFloat(wallet.total_deposited),
          total_withdrawn: parseFloat(wallet.total_withdrawn),
          available_balance: parseFloat(wallet.balance), // ✅ Não subtrai blocked (já debitado)
          created_at: wallet.created_at,
          updated_at: wallet.updated_at
        },
        recent_transactions: transactions || []
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar carteira:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar dados da carteira',
        details: error.message
      };
    }
  }

  /**
   * Cria um depósito via Pix (gera QR Code)
   * @param {string} userId - ID do usuário
   * @param {number} amount - Valor do depósito
   * @param {string} description - Descrição opcional
   * @returns {Promise<Object>} Dados do QR Code e transação
   */
  async createDeposit(userId, amount, description = '') {
    try {
      // 1. Verificar se usuário existe
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw {
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado'
        };
      }

      // 2. Verificar se carteira existe
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (walletError || !wallet) {
        throw {
          code: 'NOT_FOUND',
          message: 'Carteira não encontrada'
        };
      }

      // 3. Gerar correlationID único para rastreamento
      const correlationID = `DEPOSIT-${userId}-${Date.now()}-${uuidv4().substring(0, 8)}`;

      // 4. Gerar QR Code Pix via API Woovi
      const pixData = await this.generatePixQRCode({
        name: `Depósito - ${user.name}`,
        correlationID,
        value: Math.round(amount * 100), // Converter para centavos
        comment: description || `Depósito na carteira SinucaBet`
      });

      // 5. Criar transação pendente no banco
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          amount: amount,
          fee: 0,
          net_amount: amount,
          status: 'pending',
          description: description || 'Depósito via Pix',
          metadata: {
            correlationID,
            woovi_charge_id: pixData.charge_id,
            woovi_correlation_id: pixData.correlation_id,
            qr_code_url: pixData.qrcode_url,
            br_code: pixData.brcode,
            payment_link: pixData.payment_link,
            expires_at: pixData.expires_at,
            expires_in: pixData.expires_in,
            woovi_status: pixData.status
          }
        })
        .select('id, type, amount, status, created_at, metadata')
        .single();

      if (transactionError) {
        console.error('Erro ao criar transação:', transactionError);
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar transação de depósito',
          details: transactionError.message
        };
      }

      // 6. Retornar dados do QR Code e transação
      return {
        transaction_id: transaction.id,
        amount: parseFloat(amount),
        status: 'pending',
        pix: {
          qrCode: pixData.brcode,
          qrCodeImage: pixData.qrcode_url,
          paymentLink: pixData.payment_link,
          expiresAt: pixData.expires_at,
          expiresIn: pixData.expires_in
        },
        created_at: transaction.created_at,
        message: 'QR Code gerado com sucesso. Aguardando confirmação do pagamento.'
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao criar depósito:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao processar depósito',
        details: error.message
      };
    }
  }

  /**
   * Gera QR Code Pix via API Woovi
   * @param {Object} data - Dados do pagamento
   * @returns {Promise<Object>} Dados do QR Code
   */
  async generatePixQRCode(data) {
    try {
      const WOOVI_API_URL = process.env.WOOVI_API_URL || 'https://api.woovi.com/api/v1';
      const WOOVI_APP_ID = process.env.WOOVI_APP_ID;

      if (!WOOVI_APP_ID) {
        throw new Error('WOOVI_APP_ID não configurado nas variáveis de ambiente');
      }

      const response = await axios.post(
        `${WOOVI_API_URL}/charge`,
        {
          correlationID: data.correlationID,
          value: data.value,
          comment: data.comment,
          additionalInfo: [
            {
              key: 'Plataforma',
              value: 'SinucaBet'
            },
            {
              key: 'Tipo',
              value: 'Depósito'
            }
          ]
        },
        {
          headers: {
            'Authorization': WOOVI_APP_ID,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log('✅ Cobrança Woovi criada:', {
        correlationID: data.correlationID,
        value: data.value,
        transactionID: response.data.charge?.transactionID
      });

      if (!response.data || !response.data.brCode) {
        throw new Error('Resposta inválida da API Woovi');
      }

      const charge = response.data.charge || response.data;

      return {
        charge_id: charge.transactionID || charge.identifier,
        correlation_id: charge.correlationID || data.correlationID,
        qrcode_url: charge.qrCodeImage,
        brcode: response.data.brCode || charge.brCode,
        payment_link: charge.paymentLinkUrl,
        expires_at: charge.expiresDate,
        expires_in: charge.expiresIn || 86400,
        status: charge.status
      };
    } catch (error) {
      console.error('❌ Erro ao gerar QR Code Woovi:', error.response?.data || error.message);
      
      throw {
        code: 'EXTERNAL_API_ERROR',
        message: 'Erro ao gerar QR Code Pix. Verifique as credenciais da Woovi.',
        details: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Confirma um depósito (chamado pelo webhook da Woovi)
   * @param {string} correlationID - ID de correlação
   * @param {Object} paymentData - Dados do pagamento
   * @returns {Promise<Object>} Dados da transação confirmada
   */
  async confirmDeposit(correlationID, paymentData) {
    try {
      // 1. Buscar transação pelo correlationID
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .select('id, user_id, amount, status, metadata')
        .eq('metadata->>correlationID', correlationID)
        .eq('type', 'deposit')
        .single();

      if (transactionError || !transaction) {
        throw {
          code: 'NOT_FOUND',
          message: 'Transação não encontrada',
          correlationID
        };
      }

      // 2. Verificar se a transação já foi processada
      if (transaction.status === 'completed') {
        console.warn('Transação já foi processada:', correlationID);
        return {
          message: 'Transação já processada',
          transaction_id: transaction.id
        };
      }

      // 3. Atualizar saldo da carteira
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance, total_deposited')
        .eq('user_id', transaction.user_id)
        .single();

      if (walletError || !wallet) {
        throw {
          code: 'NOT_FOUND',
          message: 'Carteira não encontrada'
        };
      }

      const newBalance = parseFloat(wallet.balance) + parseFloat(transaction.amount);
      const newTotalDeposited = parseFloat(wallet.total_deposited) + parseFloat(transaction.amount);

      const { error: updateWalletError } = await supabase
        .from('wallet')
        .update({
          balance: newBalance,
          total_deposited: newTotalDeposited
        })
        .eq('user_id', transaction.user_id);

      if (updateWalletError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar saldo da carteira',
          details: updateWalletError.message
        };
      }

      // 4. Atualizar status da transação
      const { error: updateTransactionError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          metadata: {
            ...transaction.metadata,
            payment_data: paymentData,
            confirmed_at: new Date().toISOString()
          }
        })
        .eq('id', transaction.id);

      if (updateTransactionError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar transação',
          details: updateTransactionError.message
        };
      }

      return {
        transaction_id: transaction.id,
        user_id: transaction.user_id,
        amount: parseFloat(transaction.amount),
        new_balance: newBalance,
        status: 'completed',
        message: 'Depósito confirmado com sucesso'
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao confirmar depósito:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao confirmar depósito',
        details: error.message
      };
    }
  }

  /**
   * Cria uma solicitação de saque
   * @param {string} userId - ID do usuário
   * @param {number} amount - Valor do saque
   * @param {string} pixKey - Chave PIX para recebimento
   * @param {string} description - Descrição opcional
   * @returns {Promise<Object>} Dados do saque
   */
  async createWithdraw(userId, amount, pixKey, description = '') {
    try {
      // 1. Verificar se usuário existe
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        throw {
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado'
        };
      }

      // 2. Buscar carteira e verificar saldo
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('id, balance, blocked_balance, total_withdrawn')
        .eq('user_id', userId)
        .single();

      if (walletError || !wallet) {
        throw {
          code: 'NOT_FOUND',
          message: 'Carteira não encontrada'
        };
      }

      // 3. Calcular taxa de 8%
      const fee = parseFloat((amount * 0.08).toFixed(2));
      const totalAmount = parseFloat((amount + fee).toFixed(2));
      const netAmount = parseFloat(amount.toFixed(2));

      // 4. Verificar saldo disponível
      // ✅ Saldo já reflete apostas debitadas, não precisa subtrair blocked_balance
      const availableBalance = parseFloat(wallet.balance);
      
      if (availableBalance < totalAmount) {
        throw {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Saldo insuficiente para realizar o saque',
          details: {
            available: availableBalance,
            required: totalAmount,
            amount: amount,
            fee: fee
          }
        };
      }

      // 5. Atualizar saldo da carteira (descontar total)
      const newBalance = parseFloat((parseFloat(wallet.balance) - totalAmount).toFixed(2));
      const newTotalWithdrawn = parseFloat((parseFloat(wallet.total_withdrawn) + amount).toFixed(2));

      const { error: updateWalletError } = await supabase
        .from('wallet')
        .update({
          balance: newBalance,
          total_withdrawn: newTotalWithdrawn
        })
        .eq('user_id', userId);

      if (updateWalletError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao atualizar saldo da carteira',
          details: updateWalletError.message
        };
      }

      // 6. Criar transação de saque (principal)
      const { data: withdrawTransaction, error: withdrawError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'withdraw',
          amount: netAmount,
          fee: fee,
          net_amount: netAmount,
          status: 'pending',
          description: description || 'Solicitação de saque via Pix',
          metadata: {
            pix_key: pixKey,
            total_debited: totalAmount,
            awaiting_admin_confirmation: true,
            requested_at: new Date().toISOString()
          }
        })
        .select('id, type, amount, fee, net_amount, status, created_at, metadata')
        .single();

      if (withdrawError) {
        // Reverter atualização da carteira em caso de erro
        await supabase
          .from('wallet')
          .update({
            balance: wallet.balance,
            total_withdrawn: wallet.total_withdrawn
          })
          .eq('user_id', userId);

        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar transação de saque',
          details: withdrawError.message
        };
      }

      // 7. Criar transação de taxa (relacionada ao saque)
      const { error: feeError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'fee',
          amount: fee,
          fee: 0,
          net_amount: -fee,
          status: 'completed',
          description: `Taxa de saque (8%)`,
          metadata: {
            related_transaction_id: withdrawTransaction.id,
            fee_percentage: 8,
            base_amount: amount
          }
        });

      if (feeError) {
        console.error('Erro ao criar transação de taxa:', feeError);
        // Não falhar a operação por causa da taxa, mas logar o erro
      }

      // 8. Retornar dados do saque
      return {
        transaction_id: withdrawTransaction.id,
        status: 'pending',
        amount_requested: netAmount,
        fee: fee,
        total_debited: totalAmount,
        net_to_receive: netAmount,
        new_balance: newBalance,
        pix_key: pixKey,
        created_at: withdrawTransaction.created_at,
        message: 'Solicitação de saque criada com sucesso. Aguardando confirmação do administrador.',
        note: 'O valor líquido será transferido para sua chave PIX após aprovação do admin.'
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao criar saque:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao processar saque',
        details: error.message
      };
    }
  }

  /**
   * Busca uma transação específica
   * @param {string} transactionId - ID da transação
   * @param {string} userId - ID do usuário (para segurança)
   * @returns {Promise<Object>} Dados da transação
   */
  async getTransaction(transactionId, userId) {
    try {
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select('id, user_id, type, amount, fee, net_amount, status, description, metadata, created_at, processed_at')
        .eq('id', transactionId)
        .eq('user_id', userId)
        .single();

      if (error || !transaction) {
        throw {
          code: 'NOT_FOUND',
          message: 'Transação não encontrada'
        };
      }

      return {
        id: transaction.id,
        type: transaction.type,
        amount: parseFloat(transaction.amount),
        fee: parseFloat(transaction.fee || 0),
        net_amount: parseFloat(transaction.net_amount || transaction.amount),
        status: transaction.status,
        description: transaction.description,
        metadata: transaction.metadata,
        created_at: transaction.created_at,
        processed_at: transaction.processed_at
      };
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao buscar transação:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar transação',
        details: error.message
      };
    }
  }

  /**
   * Bloqueia saldo para uma aposta
   * @param {string} userId - ID do usuário
   * @param {number} amount - Valor a bloquear
   * @returns {Promise<boolean>}
   */
  async blockBalance(userId, amount) {
    try {
      const { data: wallet, error: walletError } = await supabase
        .from('wallet')
        .select('balance, blocked_balance')
        .eq('user_id', userId)
        .single();

      if (walletError || !wallet) {
        throw {
          code: 'NOT_FOUND',
          message: 'Carteira não encontrada'
        };
      }

      // ✅ Saldo já reflete apostas debitadas, não precisa subtrair blocked_balance
      const availableBalance = parseFloat(wallet.balance);

      if (availableBalance < amount) {
        throw {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Saldo insuficiente',
          available: availableBalance,
          required: amount
        };
      }

      const newBlockedBalance = parseFloat(wallet.blocked_balance) + amount;

      const { error: updateError } = await supabase
        .from('wallet')
        .update({ blocked_balance: newBlockedBalance })
        .eq('user_id', userId);

      if (updateError) {
        throw {
          code: 'DATABASE_ERROR',
          message: 'Erro ao bloquear saldo',
          details: updateError.message
        };
      }

      return true;
    } catch (error) {
      if (error.code) {
        throw error;
      }

      console.error('Erro ao bloquear saldo:', error);
      throw {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao bloquear saldo',
        details: error.message
      };
    }
  }
}

module.exports = new WalletService();




