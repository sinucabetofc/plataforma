/**
 * ============================================================
 * Influencer Commission Service
 * ============================================================
 * Serviço para cálculo e registro de comissões de influencers
 * Data: 08/11/2025
 */

const { supabase } = require('../config/supabase.config');

/**
 * Calcular comissão de um influencer para uma partida finalizada
 * 
 * Fórmula:
 * 1. Buscar todas apostas confirmadas (matched, won, lost)
 * 2. Calcular total apostado
 * 3. Calcular lucro da casa = Total apostado perdedores - Total pago aos ganhadores
 * 4. Comissão = (% do influencer) x (lucro da casa)
 */
const calculateCommissionForMatch = async (matchId) => {
  try {
    console.log('💰 [COMMISSION] Calculando comissão para partida:', matchId);

    // 1. Buscar a partida
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, status, influencer_id, influencer_commission')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      console.error('❌ [COMMISSION] Erro ao buscar partida:', matchError);
      return { success: false, error: 'Partida não encontrada' };
    }

    // Verificar se tem influencer associado
    if (!match.influencer_id) {
      console.log('ℹ️ [COMMISSION] Partida sem influencer, pulando cálculo');
      return { success: true, message: 'Partida sem influencer' };
    }

    // Verificar se a partida está finalizada
    if (match.status !== 'finalizada') {
      console.log('ℹ️ [COMMISSION] Partida não finalizada, pulando cálculo');
      return { success: false, error: 'Partida ainda não finalizada' };
    }

    // 2. Verificar se já existe comissão calculada
    const { data: existingCommission } = await supabase
      .from('influencer_commissions')
      .select('id')
      .eq('match_id', matchId)
      .eq('influencer_id', match.influencer_id)
      .single();

    if (existingCommission) {
      console.log('ℹ️ [COMMISSION] Comissão já calculada para esta partida');
      return { success: true, message: 'Comissão já calculada' };
    }

    // 3. Buscar todas apostas da partida (matched, won, lost)
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .eq('match_id', matchId)
      .in('status', ['matched', 'won', 'lost']);

    if (betsError) {
      console.error('❌ [COMMISSION] Erro ao buscar apostas:', betsError);
      return { success: false, error: 'Erro ao buscar apostas' };
    }

    if (!bets || bets.length === 0) {
      console.log('ℹ️ [COMMISSION] Nenhuma aposta confirmada, comissão = 0');
      
      // Criar registro de comissão zerada
      await createCommissionRecord(match.influencer_id, matchId, 0, 0, 0, match.influencer_commission);
      
      return { success: true, commission_amount: 0 };
    }

    // 4. Calcular totais
    const totalBets = bets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
    const totalLost = bets.filter(b => b.status === 'lost').reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
    const totalWon = bets.filter(b => b.status === 'won').reduce((sum, bet) => sum + parseFloat(bet.potential_return || 0), 0);

    // Lucro da casa = Total perdido pelos apostadores - Total pago aos ganhadores
    const houseProfit = totalLost - totalWon;

    // 5. Buscar % de comissão do influencer
    let commissionPercentage = match.influencer_commission;

    // Se não tiver comissão específica do jogo, usar a padrão do influencer
    if (!commissionPercentage) {
      const { data: influencer, error: influencerError } = await supabase
        .from('influencers')
        .select('commission_percentage')
        .eq('id', match.influencer_id)
        .single();

      if (influencerError || !influencer) {
        console.error('❌ [COMMISSION] Erro ao buscar influencer:', influencerError);
        return { success: false, error: 'Influencer não encontrado' };
      }

      commissionPercentage = influencer.commission_percentage;
    }

    // 6. Calcular comissão
    // Comissão só é calculada se houver lucro para a casa
    let commissionAmount = 0;
    if (houseProfit > 0) {
      commissionAmount = (commissionPercentage / 100) * houseProfit;
    }

    console.log('📊 [COMMISSION] Cálculo:', {
      totalBets,
      totalLost,
      totalWon,
      houseProfit,
      commissionPercentage,
      commissionAmount
    });

    // 7. Criar registro de comissão
    const result = await createCommissionRecord(
      match.influencer_id,
      matchId,
      totalBets,
      houseProfit,
      commissionAmount,
      commissionPercentage
    );

    if (!result.success) {
      return result;
    }

    console.log('✅ [COMMISSION] Comissão calculada e registrada com sucesso');

    return {
      success: true,
      commission_amount: commissionAmount,
      house_profit: houseProfit,
      total_bets: totalBets
    };
  } catch (error) {
    console.error('❌ [COMMISSION] Erro inesperado:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Criar registro de comissão no banco
 */
const createCommissionRecord = async (
  influencerId,
  matchId,
  totalBets,
  houseProfit,
  commissionAmount,
  commissionPercentage
) => {
  try {
    const { data, error } = await supabase
      .from('influencer_commissions')
      .insert([{
        influencer_id: influencerId,
        match_id: matchId,
        total_bets: totalBets,
        house_profit: houseProfit,
        commission_amount: commissionAmount,
        commission_percentage: commissionPercentage,
        status: 'pending',
        calculated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ [COMMISSION] Erro ao criar registro:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [COMMISSION] Registro criado:', data.id);

    return { success: true, data };
  } catch (error) {
    console.error('❌ [COMMISSION] Erro ao criar registro:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Marcar comissão como paga
 */
const markCommissionAsPaid = async (commissionId) => {
  try {
    console.log('💳 [COMMISSION] Marcando comissão como paga:', commissionId);

    const { data, error } = await supabase
      .from('influencer_commissions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', commissionId)
      .select()
      .single();

    if (error) {
      console.error('❌ [COMMISSION] Erro ao marcar como paga:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [COMMISSION] Comissão marcada como paga');

    return { success: true, data };
  } catch (error) {
    console.error('❌ [COMMISSION] Erro inesperado:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Buscar comissões de um influencer
 */
const getInfluencerCommissions = async (influencerId, filters = {}) => {
  try {
    let query = supabase
      .from('influencer_commissions')
      .select(`
        *,
        match:matches(
          id,
          scheduled_at,
          player1:players!matches_player1_id_fkey(name, nickname),
          player2:players!matches_player2_id_fkey(name, nickname)
        )
      `)
      .eq('influencer_id', influencerId)
      .order('calculated_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [COMMISSION] Erro ao buscar comissões:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ [COMMISSION] Erro inesperado:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  calculateCommissionForMatch,
  markCommissionAsPaid,
  getInfluencerCommissions
};

