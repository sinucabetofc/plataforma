-- ============================================================
-- Migration 1041: Recriar índice com filtro completo
-- ============================================================
-- Esta migration RECRIA o índice de matching para incluir
-- o filtro com 'parcialmente_aceita' (agora que o enum existe)
-- ============================================================

-- Dropar índice existente
DROP INDEX IF EXISTS idx_bets_matching_fifo;

-- Recriar com filtro completo
CREATE INDEX idx_bets_matching_fifo 
ON bets(serie_id, chosen_player_id, placed_at) 
WHERE remaining_amount > 0 AND status IN ('pendente', 'parcialmente_aceita');

-- Verificação
DO $$
BEGIN
    RAISE NOTICE '✅ Índice idx_bets_matching_fifo recriado com filtro completo';
    RAISE NOTICE '   Filtro: remaining_amount > 0 AND status IN (pendente, parcialmente_aceita)';
END$$;

