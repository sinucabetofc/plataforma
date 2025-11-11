-- =====================================================
-- Migration: 1044_fix_duplicate_credit_triggers
-- Description: Remove triggers duplicados de crédito de ganhos
--              Apenas credit_winnings() deve existir
-- Created: 2025-11-11
-- =====================================================

-- =====================================================
-- REMOVER TODOS OS TRIGGERS DE CRÉDITO DUPLICADOS
-- =====================================================

-- 1. Remover credit_winnings_v2 (antigo)
DROP TRIGGER IF EXISTS trigger_credit_winnings_v2 ON bets;
DROP FUNCTION IF EXISTS credit_winnings_v2();

-- 2. Garantir que apenas credit_winnings() existe
DROP TRIGGER IF EXISTS trigger_credit_winnings ON bets;

-- =====================================================
-- RECRIAR APENAS O TRIGGER CORRETO
-- =====================================================

-- Recriar trigger usando a função credit_winnings() da migration 1042
CREATE TRIGGER trigger_credit_winnings
  AFTER UPDATE OF status ON bets
  FOR EACH ROW
  WHEN (NEW.status IN ('ganha', 'perdida') AND OLD.status NOT IN ('ganha', 'perdida'))
  EXECUTE FUNCTION credit_winnings();

-- Mensagens de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ Trigger credit_winnings_v2 removido';
  RAISE NOTICE '✅ Trigger credit_winnings recriado corretamente';
END $$;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

DO $$
DECLARE
  trigger_count INTEGER;
BEGIN
  -- Contar quantos triggers de ganho existem
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgname LIKE '%credit%';
  
  RAISE NOTICE '📊 Total de triggers de crédito: %', trigger_count;
  
  IF trigger_count > 1 THEN
    RAISE WARNING '⚠️ Ainda existem múltiplos triggers de crédito!';
  ELSE
    RAISE NOTICE '✅ Apenas um trigger de crédito ativo';
  END IF;
END $$;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

