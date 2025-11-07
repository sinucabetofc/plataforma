-- =====================================================
-- Migration: 1010_fix_transaction_status_logic
-- Description: Status da transação deve refletir status da aposta
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- LÓGICA CORRETA DE STATUS:
-- =====================================================
-- 
-- TRANSAÇÃO DE APOSTA:
--   - Se aposta está 'pendente' → transação 'pending' (aguardando emparelhamento)
--   - Se aposta está 'aceita' → transação 'completed' (aposta casada)
--   - Se aposta está 'ganha/perdida' → transação 'completed'
--   - Se aposta está 'cancelada' → transação 'cancelled'
--
-- TRANSAÇÃO DE GANHO/REEMBOLSO:
--   - Sempre 'completed' (já foi processado)
--
-- =====================================================

-- =====================================================
-- TRIGGER: Criar transação de aposta com status dinâmico
-- =====================================================

CREATE OR REPLACE FUNCTION create_bet_transaction()
RETURNS TRIGGER AS $$
DECLARE
  user_balance INTEGER;
  wallet_id_val UUID;
  transaction_status VARCHAR;
BEGIN
  -- Buscar saldo atual e ID da wallet
  SELECT w.id, w.balance 
  INTO wallet_id_val, user_balance
  FROM wallet w
  WHERE w.user_id = NEW.user_id;
  
  -- Determinar status da transação baseado no status da aposta
  -- Se aposta é 'pendente' → transação é 'pending' (aguardando emparelhamento)
  -- Se aposta é 'aceita' → transação é 'completed' (aposta casada)
  transaction_status := CASE 
    WHEN NEW.status = 'pendente' THEN 'pending'
    WHEN NEW.status = 'aceita' THEN 'completed'
    ELSE 'completed'
  END;
  
  -- Criar transação COM user_id e status dinâmico
  INSERT INTO transactions (
    wallet_id,
    user_id,
    bet_id,
    type,
    amount,
    balance_before,
    balance_after,
    description,
    status,
    metadata
  ) VALUES (
    wallet_id_val,
    NEW.user_id,
    NEW.id,
    'aposta',
    -NEW.amount,
    user_balance + NEW.amount,
    user_balance,
    'Aposta na série ' || (
      SELECT serie_number FROM series WHERE id = NEW.serie_id
    ),
    transaction_status,
    jsonb_build_object(
      'bet_id', NEW.id,
      'serie_id', NEW.serie_id,
      'bet_status', NEW.status,
      'chosen_player_id', NEW.chosen_player_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Atualizar status da transação quando aposta muda
-- =====================================================

CREATE OR REPLACE FUNCTION update_bet_transaction_status()
RETURNS TRIGGER AS $$
DECLARE
  transaction_status VARCHAR;
BEGIN
  -- Determinar novo status da transação
  transaction_status := CASE 
    WHEN NEW.status = 'pendente' THEN 'pending'
    WHEN NEW.status = 'aceita' THEN 'completed'
    WHEN NEW.status = 'ganha' THEN 'completed'
    WHEN NEW.status = 'perdida' THEN 'completed'
    WHEN NEW.status = 'cancelada' THEN 'cancelled'
    WHEN NEW.status = 'reembolsada' THEN 'completed'
    ELSE 'completed'
  END;
  
  -- Atualizar status da transação de aposta
  UPDATE transactions
  SET 
    status = transaction_status,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('bet_status', NEW.status)
  WHERE bet_id = NEW.id
    AND type = 'aposta';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger de atualização
DROP TRIGGER IF EXISTS trigger_update_bet_transaction_status ON bets;
CREATE TRIGGER trigger_update_bet_transaction_status
  AFTER UPDATE ON bets
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_bet_transaction_status();

-- =====================================================
-- ATUALIZAR transações existentes baseado em status da aposta
-- =====================================================

UPDATE transactions t
SET status = CASE 
  WHEN b.status = 'pendente' THEN 'pending'
  WHEN b.status = 'aceita' THEN 'completed'
  WHEN b.status = 'ganha' THEN 'completed'
  WHEN b.status = 'perdida' THEN 'completed'
  WHEN b.status = 'cancelada' THEN 'cancelled'
  WHEN b.status = 'reembolsada' THEN 'completed'
  ELSE 'completed'
END,
metadata = COALESCE(t.metadata, '{}'::jsonb) || jsonb_build_object('bet_status', b.status)
FROM bets b
WHERE t.bet_id = b.id
  AND t.type = 'aposta';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 
  '✅ Status das transações de aposta sincronizado!' as status,
  COUNT(*) as total_apostas,
  COUNT(*) FILTER (WHERE t.status = 'pending') as aguardando_emparelhamento,
  COUNT(*) FILTER (WHERE t.status = 'completed') as casadas_ou_resolvidas,
  COUNT(*) FILTER (WHERE t.status = 'cancelled') as canceladas
FROM transactions t
WHERE t.type = 'aposta';

-- Mostrar exemplos
SELECT 
  t.type as tipo_transacao,
  t.status as status_transacao,
  b.status as status_aposta,
  t.amount / 100.0 as valor_reais,
  u.name as usuario,
  t.created_at
FROM transactions t
LEFT JOIN bets b ON b.id = t.bet_id
LEFT JOIN users u ON u.id = t.user_id
WHERE t.type = 'aposta'
ORDER BY t.created_at DESC
LIMIT 10;

