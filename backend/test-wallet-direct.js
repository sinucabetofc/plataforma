// Test direto do wallet service
const { supabase } = require('./config/supabase.config');

async function testWallet() {
  try {
    console.log('🧪 Testando busca de wallet...\n');
    
    // 1. Buscar usuário admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('email', 'vini@admin.com')
      .single();
    
    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
      return;
    }
    
    console.log('✅ Usuário encontrado:', user);
    
    // 2. Buscar wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (walletError) {
      console.error('❌ Erro ao buscar wallet:', walletError);
      return;
    }
    
    console.log('✅ Wallet encontrada:', wallet);
    console.log(`💰 Saldo: R$ ${(wallet.balance / 100).toFixed(2)}`);
    
    // 3. Buscar transações
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('id, type, amount, balance_before, balance_after, description, created_at')
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (transError) {
      console.error('❌ Erro ao buscar transações:', transError);
      return;
    }
    
    console.log('\n📝 Transações:', transactions);
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    
  } catch (error) {
    console.error('💥 Erro:', error);
  }
  
  process.exit(0);
}

testWallet();


