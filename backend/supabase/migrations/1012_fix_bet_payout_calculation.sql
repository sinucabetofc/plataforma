-- =====================================================
-- Migration: 1012_fix_bet_payout_calculation
-- Description: Corrigir cálculo de pagamento de apostas
--              1. Ganhos: Retorno total = aposta * 2 (correto, mantém)
--              2. Perdas: Não reembolsar (apenas marcar como perdida)
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO INICIAL: Ver apostas e transações atuais
-- =====================================================

-- Verificar apostas ganhas e seus retornos
SELECT 
  '🔍 Apostas GANHAS - Verificação Inicial' as info,
  b.id,
  b.amount / 100.0 as aposta_reais,
  b.actual_return / 100.0 as retorno_real_reais,
  (b.amount * 2) / 100.0 as retorno_esperado_reais,
  CASE 
    WHEN b.actual_return = b.amount * 2 THEN '✅ Correto'
    ELSE '❌ Incorreto'
  END as status_calculo
FROM bets b
WHERE b.status = 'ganha'
LIMIT 10;

-- Verificar transações de ganho
SELECT 
  '🔍 Transações de GANHO - Verificação' as info,
  t.id,
  b.amount / 100.0 as aposta_reais,
  t.amount / 100.0 as credito_reais,
  (b.amount * 2) / 100.0 as esperado_reais,
  CASE 
    WHEN t.amount = b.amount * 2 THEN '✅ Correto (2x)'
    WHEN t.amount = b.amount * 3 THEN '❌ Errado (3x)'
    ELSE '⚠️ Outro valor'
  END as status
FROM transactions t
JOIN bets b ON b.id = t.bet_id
WHERE t.type = 'ganho'
ORDER BY t.created_at DESC
LIMIT 10;

-- Verificar se há reembolsos em apostas perdidas (NÃO DEVERIA EXISTIR!)
SELECT 
  '⚠️ REEMBOLSOS em apostas PERDIDAS (NÃO DEVERIA EXISTIR!)' as alerta,
  COUNT(*) as quantidade,
  SUM(t.amount) / 100.0 as valor_total_reais
FROM transactions t
JOIN bets b ON b.id = t.bet_id
WHERE b.status = 'perdida'
  AND t.type IN ('reembolso', 'ganho');

-- =====================================================
-- CORREÇÃO 1: Garantir que ganhos sejam 2x (já está correto)
-- =====================================================

-- A função credit_winnings() já faz return_amount = NEW.amount * 2
-- Vamos apenas garantir que está correta

CREATE OR REPLACE FUNCTION credit_winnings()
RETURNS TRIGGER AS $$
DECLARE
  return_amount INTEGER;
  user_wallet_id UUID;
  current_balance INTEGER;
BEGIN
  -- Só executar quando aposta mudar para 'ganha'
  IF NEW.status = 'ganha' AND OLD.status != 'ganha' THEN
    
    -- REGRA: Retorno total = 2x o valor apostado
    -- Exemplo: Apostou R$60 (já debitado) → Recebe R$120
    -- Lucro líquido = R$60
    return_amount := NEW.amount * 2;
    
    -- Buscar wallet e saldo atual
    SELECT id, balance INTO user_wallet_id, current_balance
    FROM wallet
    WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Wallet não encontrada para user_id=%', NEW.user_id;
    END IF;
    
    -- Creditar saldo (adicionar o retorno)
    UPDATE wallet
    SET balance = balance + return_amount,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE user_id = NEW.user_id;
    
    -- Criar transação de crédito
    INSERT INTO transactions (
      wallet_id,
      user_id,
      bet_id,
      type,
      amount,
      balance_before,
      balance_after,
      description,
      status
    ) VALUES (
      user_wallet_id,
      NEW.user_id,
      NEW.id,
      'ganho',
      return_amount,
      current_balance,
      current_balance + return_amount,
      'Ganho na aposta da série ' || (
        SELECT serie_number FROM series WHERE id = NEW.serie_id
      ),
      'completed'
    );
    
    -- Atualizar actual_return na aposta
    UPDATE bets
    SET 
      actual_return = return_amount,
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = NEW.id;
    
    RAISE NOTICE '✅ [GANHO] user_id=% | aposta=R$% | retorno=R$% (2x)', 
      NEW.user_id, 
      NEW.amount / 100.0, 
      return_amount / 100.0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORREÇÃO 2: Apostas PERDIDAS não devem ter reembolso
-- =====================================================

-- Função para garantir que perdas não sejam reembolsadas
CREATE OR REPLACE FUNCTION handle_lost_bets()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando aposta muda para 'perdida', APENAS atualizar status
  -- NÃO creditar nenhum valor (já foi debitado ao criar aposta)
  IF NEW.status = 'perdida' AND OLD.status != 'perdida' THEN
    
    -- Log de confirmação
    RAISE NOTICE '❌ [PERDA] user_id=% | aposta=R$% | SEM REEMBOLSO', 
      NEW.user_id, 
      NEW.amount / 100.0;
    
    -- Nada a fazer aqui, apenas log
    -- O saldo já foi debitado ao criar a aposta
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para perdas (apenas para log/validação)
DROP TRIGGER IF EXISTS trigger_handle_lost_bets ON bets;
CREATE TRIGGER trigger_handle_lost_bets
  AFTER UPDATE ON bets
  FOR EACH ROW
  WHEN (NEW.status = 'perdida' AND OLD.status != 'perdida')
  EXECUTE FUNCTION handle_lost_bets();

-- =====================================================
-- CORREÇÃO 3: Remover qualquer reembolso incorreto em perdas
-- =====================================================

-- Verificar se há transações de reembolso em apostas perdidas
DO $$
DECLARE
  wrong_refund_record RECORD;
  affected_count INTEGER := 0;
BEGIN
  -- Buscar reembolsos incorretos em apostas perdidas
  FOR wrong_refund_record IN
    SELECT t.id as transaction_id, t.amount, t.wallet_id, b.user_id
    FROM transactions t
    JOIN bets b ON b.id = t.bet_id
    WHERE b.status = 'perdida'
      AND t.type = 'reembolso'
  LOOP
    affected_count := affected_count + 1;
    
    RAISE NOTICE '⚠️ Encontrado reembolso incorreto: transaction_id=%, valor=R$%', 
      wrong_refund_record.transaction_id, 
      wrong_refund_record.amount / 100.0;
    
    -- Reverter o reembolso incorreto
    UPDATE wallet
    SET balance = balance - wrong_refund_record.amount
    WHERE user_id = wrong_refund_record.user_id;
    
    -- Marcar transação como cancelada
    UPDATE transactions
    SET 
      status = 'cancelled',
      description = description || ' [REVERTIDO - reembolso incorreto]',
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = wrong_refund_record.transaction_id;
  END LOOP;
  
  IF affected_count > 0 THEN
    RAISE NOTICE '🔧 [CORREÇÃO] % reembolsos incorretos revertidos', affected_count;
  ELSE
    RAISE NOTICE '✅ [VERIFICAÇÃO] Nenhum reembolso incorreto encontrado';
  END IF;
END $$;

-- =====================================================
-- RECRIAR TRIGGERS
-- =====================================================

-- Recriar trigger de ganhos (com nova função corrigida)
DROP TRIGGER IF EXISTS trigger_credit_winnings ON bets;
CREATE TRIGGER trigger_credit_winnings
  AFTER UPDATE ON bets
  FOR EACH ROW
  WHEN (NEW.status = 'ganha' AND OLD.status != 'ganha')
  EXECUTE FUNCTION credit_winnings();

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Testar cálculos
SELECT 
  '📊 RESUMO - Status das Apostas' as info,
  status,
  COUNT(*) as quantidade,
  SUM(amount) / 100.0 as valor_total_reais,
  SUM(actual_return) / 100.0 as retorno_total_reais
FROM bets
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'pendente' THEN 1
    WHEN 'aceita' THEN 2
    WHEN 'ganha' THEN 3
    WHEN 'perdida' THEN 4
    WHEN 'cancelada' THEN 5
    WHEN 'reembolsada' THEN 6
  END;

-- Verificar se há ganhos corretos
SELECT 
  '✅ Apostas GANHAS - Verificação de Cálculo' as info,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE actual_return = amount * 2) as corretos,
  COUNT(*) FILTER (WHERE actual_return != amount * 2 OR actual_return IS NULL) as incorretos
FROM bets
WHERE status = 'ganha';

-- Verificar transações por tipo
SELECT 
  '📊 Transações por Tipo' as info,
  type,
  COUNT(*) as quantidade,
  SUM(amount) / 100.0 as valor_total_reais,
  COUNT(*) FILTER (WHERE status = 'completed') as completadas,
  COUNT(*) FILTER (WHERE status = 'pending') as pendentes,
  COUNT(*) FILTER (WHERE status = 'cancelled') as canceladas
FROM transactions
GROUP BY type
ORDER BY type;

-- =====================================================
-- LOG FINAL
-- =====================================================

SELECT '✅ [MIGRATION 1012] Correção de pagamentos de apostas concluída!' as status;
SELECT '📌 Regras implementadas:' as info;
SELECT '  1. Ganhos = 2x aposta (exemplo: aposta R$60, recebe R$120)' as regra1;
SELECT '  2. Perdas = SEM reembolso (saldo já foi debitado ao apostar)' as regra2;
SELECT '  3. Reembolsos incorretos em apostas perdidas foram revertidos' as regra3;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


