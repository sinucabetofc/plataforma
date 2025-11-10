/**
 * ============================================================
 * Fake Stats Service
 * ============================================================
 * Estatísticas de saldo fake (apenas para testes/debug)
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Buscar estatísticas de saldo fake
 */
async function getFakeStats() {
  try {
    console.log('📊 [FAKE STATS] Calculando estatísticas de saldo fake...');

    // 1. Buscar todos os wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('wallet')
      .select('balance, total_deposited, total_withdrawn, created_at');

    if (walletsError) {
      throw new Error(walletsError.message);
    }

    // 2. Calcular saldo fake total
    const totalBalanceInCents = wallets.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);
    const totalDepositsInCents = wallets.reduce((sum, w) => sum + parseFloat(w.total_deposited || 0), 0);
    const totalBalance = totalBalanceInCents / 100;
    const totalRealDeposits = totalDepositsInCents / 100;
    const totalFakeBalance = totalBalance - totalRealDeposits;

    // 3. Buscar transações de saque tipo 'saque'
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('transactions')
      .select('amount, fee, status, created_at, metadata')
      .eq('type', 'saque');

    if (withdrawalsError) {
      throw new Error(withdrawalsError.message);
    }

    // 4. Calcular total sacado fake
    // Saque fake = saques que foram pagos de saldo fake (não de depósitos reais)
    const totalWithdrawnInCents = wallets.reduce((sum, w) => sum + parseFloat(w.total_withdrawn || 0), 0);
    const totalWithdrawn = totalWithdrawnInCents / 100;
    
    // Total sacado fake = total sacado - saques de saldo real
    // (Simplificação: assumir que se totalFakeBalance > 0, alguns saques foram de fake)
    const totalFakeWithdrawn = Math.min(totalWithdrawn, totalFakeBalance);

    // 5. Saques de HOJE
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayWithdrawals = withdrawals.filter(w => {
      const wDate = new Date(w.created_at);
      return wDate >= startOfToday;
    });
    
    const todayWithdrawnInCents = todayWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
    const todayWithdrawn = todayWithdrawnInCents / 100;

    // 6. Saques dos ÚLTIMOS 7 DIAS
    const last7DaysDate = new Date();
    last7DaysDate.setDate(last7DaysDate.getDate() - 7);
    
    const last7DaysWithdrawals = withdrawals.filter(w => {
      const wDate = new Date(w.created_at);
      return wDate >= last7DaysDate;
    });
    
    const last7DaysWithdrawnInCents = last7DaysWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
    const last7DaysWithdrawn = last7DaysWithdrawnInCents / 100;

    // 7. Saques do MÊS
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthWithdrawals = withdrawals.filter(w => {
      const wDate = new Date(w.created_at);
      return wDate >= firstDayOfMonth;
    });
    
    const monthWithdrawnInCents = monthWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
    const monthWithdrawn = monthWithdrawnInCents / 100;

    // 8. Gráfico - Saques por dia (últimos 7 dias)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayWithdrawals = withdrawals.filter(w => {
        const wDate = new Date(w.created_at);
        return wDate.getFullYear() === date.getFullYear() &&
               wDate.getMonth() === date.getMonth() &&
               wDate.getDate() === date.getDate();
      });
      
      const totalInCents = dayWithdrawals.reduce((sum, w) => sum + parseFloat(w.amount || 0), 0);
      const total = totalInCents / 100;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      last7Days.push({
        date: `${year}-${month}-${day}`,
        total,
        count: dayWithdrawals.length
      });
    }

    // 9. Buscar transações de crédito manual (admin_credit = fake)
    const { data: adminCreditsData, error: creditsError } = await supabase
      .from('transactions')
      .select('amount, status')
      .eq('type', 'admin_credit');

    if (creditsError) {
      console.error('Erro ao buscar créditos admin:', creditsError);
    }

    const adminCredits = adminCreditsData?.filter(t => t.status === 'completed') || [];
    const totalAdminCreditsInCents = adminCredits.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalAdminCredits = totalAdminCreditsInCents / 100;

    console.log('✅ [FAKE STATS] Estatísticas calculadas');

    return {
      success: true,
      data: {
        balance: {
          total: totalBalance,
          real: totalRealDeposits,
          fake: totalFakeBalance,
          admin_credits: totalAdminCredits
        },
        withdrawals: {
          total: totalWithdrawn,
          fake: totalFakeWithdrawn,
          today: todayWithdrawn,
          last_7_days: last7DaysWithdrawn,
          month: monthWithdrawn,
          count: {
            total: withdrawals.length,
            today: todayWithdrawals.length,
            last_7_days: last7DaysWithdrawals.length,
            month: monthWithdrawals.length
          }
        },
        charts: {
          withdrawals_last_7_days: last7Days
        }
      }
    };
  } catch (error) {
    console.error('❌ [FAKE STATS] Erro:', error);
    throw error;
  }
}

module.exports = {
  getFakeStats
};

