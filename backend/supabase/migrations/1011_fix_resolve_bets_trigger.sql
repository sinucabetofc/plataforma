-- =====================================================
-- Migration: 1011_fix_resolve_bets_trigger
-- Description: Garantir que apostas sejam resolvidas quando série finalizar
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- REMOVER TRIGGER PROBLEMÁTICO (causa erro de enum)
-- =====================================================

-- Este trigger tenta criar transação com tipo 'aposta_perdida' que NÃO EXISTE
-- Apostas perdidas NÃO devem debitar novamente (já foi debitado ao criar aposta)
DROP TRIGGER IF EXISTS trigger_debit_balance_on_bet_lost ON bets;
DROP FUNCTION IF EXISTS debit_balance_on_bet_lost();

SELECT '✅ Trigger problemático removido!' as status;

-- =====================================================
-- TRIGGER: Resolver apostas quando série for encerrada
-- =====================================================

CREATE OR REPLACE FUNCTION resolve_bets_on_serie_end()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se a série mudou para 'encerrada' e tem um vencedor
  IF NEW.status = 'encerrada' AND OLD.status != 'encerrada' AND NEW.winner_player_id IS NOT NULL THEN
    
    -- Atualizar apostas GANHADORAS (quem apostou no vencedor)
    UPDATE bets
    SET 
      status = 'ganha',
      resolved_at = TIMEZONE('utc'::text, NOW()),
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE serie_id = NEW.id
      AND chosen_player_id = NEW.winner_player_id
      AND status IN ('pendente', 'aceita'); -- Resolver pendentes E aceitas
    
    -- Atualizar apostas PERDEDORAS (quem apostou no perdedor)
    UPDATE bets
    SET 
      status = 'perdida',
      resolved_at = TIMEZONE('utc'::text, NOW()),
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE serie_id = NEW.id
      AND chosen_player_id != NEW.winner_player_id
      AND status IN ('pendente', 'aceita'); -- Resolver pendentes E aceitas
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
DROP TRIGGER IF EXISTS trigger_resolve_bets_on_serie_end ON series;
CREATE TRIGGER trigger_resolve_bets_on_serie_end
  AFTER UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION resolve_bets_on_serie_end();

-- Log de confirmação (usando SELECT ao invés de RAISE NOTICE)
SELECT '✅ Trigger de resolução de apostas criado/atualizado!' as status;

-- =====================================================
-- RESOLVER apostas de séries já finalizadas (migração de dados)
-- =====================================================

-- Resolver apostas de séries que já foram encerradas mas as apostas não foram resolvidas
DO $$
DECLARE
  serie_record RECORD;
  apostas_ganhas INTEGER;
  apostas_perdidas INTEGER;
BEGIN
  FOR serie_record IN 
    SELECT id, winner_player_id, serie_number 
    FROM series 
    WHERE status = 'encerrada' 
      AND winner_player_id IS NOT NULL
  LOOP
    RAISE NOTICE '🔄 [MIGRAÇÃO] Resolvendo apostas da série %...', serie_record.id;
    
    -- Atualizar apostas ganhadoras
    UPDATE bets
    SET 
      status = 'ganha',
      resolved_at = COALESCE(resolved_at, TIMEZONE('utc'::text, NOW())),
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE serie_id = serie_record.id
      AND chosen_player_id = serie_record.winner_player_id
      AND status IN ('pendente', 'aceita');
    
    GET DIAGNOSTICS apostas_ganhas = ROW_COUNT;
    
    -- Atualizar apostas perdedoras
    UPDATE bets
    SET 
      status = 'perdida',
      resolved_at = COALESCE(resolved_at, TIMEZONE('utc'::text, NOW())),
      updated_at = TIMEZONE('utc'::text, NOW())
    WHERE serie_id = serie_record.id
      AND chosen_player_id != serie_record.winner_player_id
      AND status IN ('pendente', 'aceita');
    
    GET DIAGNOSTICS apostas_perdidas = ROW_COUNT;
    
    IF apostas_ganhas > 0 OR apostas_perdidas > 0 THEN
      RAISE NOTICE '   ✅ Série %: % ganhas, % perdidas', 
        serie_record.serie_number, apostas_ganhas, apostas_perdidas;
    END IF;
  END LOOP;
  
  RAISE NOTICE '🎉 [MIGRAÇÃO] Apostas antigas resolvidas com sucesso!';
END $$;

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Mostrar apostas por status
SELECT 
  '📊 Status das Apostas' as info,
  status,
  COUNT(*) as quantidade,
  SUM(amount) / 100.0 as valor_total_reais
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

-- Mostrar séries encerradas com vencedor
SELECT 
  s.serie_number,
  s.status,
  s.winner_player_id,
  p.name as vencedor,
  COUNT(b.id) as total_apostas,
  COUNT(*) FILTER (WHERE b.status = 'ganha') as apostas_ganhas,
  COUNT(*) FILTER (WHERE b.status = 'perdida') as apostas_perdidas,
  COUNT(*) FILTER (WHERE b.status = 'aceita') as ainda_aceitas
FROM series s
LEFT JOIN players p ON p.id = s.winner_player_id
LEFT JOIN bets b ON b.serie_id = s.id
WHERE s.status = 'encerrada'
GROUP BY s.id, s.serie_number, s.status, s.winner_player_id, p.name
ORDER BY s.serie_number;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

