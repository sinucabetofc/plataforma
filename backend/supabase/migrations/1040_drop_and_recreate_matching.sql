-- ============================================================
-- Migration 1040: DROP e RECRIA Sistema de Matching
-- ============================================================
-- Esta migration DROPA tudo relacionado a matching fracionado
-- e recria do zero com a estrutura correta
-- NOTA: SEM BEGIN/COMMIT para permitir usar novo enum
-- ============================================================

-- ============================================================
-- 1. DROPAR TUDO RELACIONADO (se existir)
-- ============================================================

-- Dropar índices condicionais
DROP INDEX IF EXISTS idx_bets_matching_fifo;
DROP INDEX IF EXISTS idx_bets_remaining_amount;

-- Dropar triggers
DROP TRIGGER IF EXISTS trigger_calculate_remaining_amount ON bets;
DROP TRIGGER IF EXISTS trigger_update_bet_status ON bets;

-- Dropar funções
DROP FUNCTION IF EXISTS calculate_remaining_amount();
DROP FUNCTION IF EXISTS update_bet_status_on_match();
DROP FUNCTION IF EXISTS debug_serie_matching(UUID);

-- Dropar tabela bet_matches (CASCADE para remover FKs)
DROP TABLE IF EXISTS bet_matches CASCADE;

-- Dropar colunas de bets (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bets' AND column_name = 'matched_amount') THEN
        ALTER TABLE bets DROP COLUMN matched_amount;
        RAISE NOTICE '🗑️  Coluna matched_amount removida';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bets' AND column_name = 'remaining_amount') THEN
        ALTER TABLE bets DROP COLUMN remaining_amount;
        RAISE NOTICE '🗑️  Coluna remaining_amount removida';
    END IF;
END$$;

-- ============================================================
-- 2. CRIAR TABELA BET_MATCHES (estrutura correta)
-- ============================================================

CREATE TABLE bet_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serie_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    bet_a_id UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
    bet_b_id UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
    matched_amount INTEGER NOT NULL CHECK (matched_amount > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    CONSTRAINT different_bets CHECK (bet_a_id != bet_b_id)
);

-- Índices
CREATE INDEX idx_bet_matches_serie_id ON bet_matches(serie_id);
CREATE INDEX idx_bet_matches_bet_a_id ON bet_matches(bet_a_id);
CREATE INDEX idx_bet_matches_bet_b_id ON bet_matches(bet_b_id);
CREATE INDEX idx_bet_matches_created_at ON bet_matches(created_at DESC);

COMMENT ON TABLE bet_matches IS 'Pareamentos entre apostas (matching fracionado)';

-- ============================================================
-- 3. ADICIONAR COLUNAS EM BETS
-- ============================================================

ALTER TABLE bets 
ADD COLUMN matched_amount INTEGER DEFAULT 0 CHECK (matched_amount >= 0),
ADD COLUMN remaining_amount INTEGER;

COMMENT ON COLUMN bets.matched_amount IS 'Valor já casado (centavos)';
COMMENT ON COLUMN bets.remaining_amount IS 'Valor pendente (centavos)';

-- ============================================================
-- 4. INICIALIZAR VALORES
-- ============================================================

UPDATE bets 
SET 
    matched_amount = 0,
    remaining_amount = amount
WHERE matched_amount IS NULL OR remaining_amount IS NULL;

-- Apostas já aceitas = totalmente casadas
UPDATE bets 
SET 
    matched_amount = amount,
    remaining_amount = 0
WHERE status = 'aceita' AND matched_amount = 0;

-- ============================================================
-- 5. ADICIONAR STATUS (se não existir)
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'parcialmente_aceita' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'bet_status')
    ) THEN
        ALTER TYPE bet_status ADD VALUE 'parcialmente_aceita';
        RAISE NOTICE '✅ Status parcialmente_aceita adicionado';
    ELSE
        RAISE NOTICE '⚠️  Status parcialmente_aceita já existe';
    END IF;
END$$;

-- ============================================================
-- 6. CRIAR TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_remaining_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.remaining_amount = NEW.amount - COALESCE(NEW.matched_amount, 0);
    IF NEW.remaining_amount < 0 THEN
        NEW.remaining_amount = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_remaining_amount
    BEFORE INSERT OR UPDATE OF amount, matched_amount ON bets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_remaining_amount();

-- Trigger de status
CREATE OR REPLACE FUNCTION update_bet_status_on_match()
RETURNS TRIGGER AS $$
DECLARE
    match_percentage DECIMAL;
BEGIN
    IF NEW.amount > 0 THEN
        match_percentage = (NEW.matched_amount::DECIMAL / NEW.amount::DECIMAL) * 100;
        
        IF NEW.status NOT IN ('ganha', 'perdida', 'cancelada', 'reembolsada') THEN
            IF match_percentage = 0 THEN
                NEW.status = 'pendente';
            ELSIF match_percentage >= 100 THEN
                NEW.status = 'aceita';
            ELSE
                NEW.status = 'parcialmente_aceita';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bet_status
    BEFORE UPDATE OF matched_amount ON bets
    FOR EACH ROW
    EXECUTE FUNCTION update_bet_status_on_match();

-- ============================================================
-- 7. CRIAR ÍNDICES
-- ============================================================

-- Índice para matching FIFO (sem mencionar parcialmente_aceita ainda)
CREATE INDEX idx_bets_matching_fifo 
ON bets(serie_id, chosen_player_id, placed_at) 
WHERE remaining_amount > 0;

-- Índice por remaining_amount
CREATE INDEX idx_bets_remaining_amount 
ON bets(serie_id, remaining_amount, placed_at) 
WHERE remaining_amount > 0;

-- ============================================================
-- 8. FUNÇÃO DE DEBUG
-- ============================================================

CREATE OR REPLACE FUNCTION debug_serie_matching(p_serie_id UUID)
RETURNS TABLE (
    bet_id UUID,
    user_name TEXT,
    chosen_player TEXT,
    amount INTEGER,
    matched_amount INTEGER,
    remaining_amount INTEGER,
    status TEXT,
    match_percentage DECIMAL,
    placed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        u.name,
        p.name,
        b.amount,
        b.matched_amount,
        b.remaining_amount,
        b.status::TEXT,
        ROUND((b.matched_amount::DECIMAL / NULLIF(b.amount, 0)::DECIMAL) * 100, 2),
        b.placed_at
    FROM bets b
    JOIN users u ON b.user_id = u.id
    JOIN players p ON b.chosen_player_id = p.id
    WHERE b.serie_id = p_serie_id
    ORDER BY b.placed_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 9. GRANTS
-- ============================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        GRANT ALL ON bet_matches TO authenticated;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT ALL ON bet_matches TO service_role;
    END IF;
END$$;

-- ============================================================
-- 10. VERIFICAÇÃO FINAL
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 MIGRATION 1040 CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tabela bet_matches criada';
    RAISE NOTICE '✅ Colunas matched_amount e remaining_amount adicionadas';
    RAISE NOTICE '✅ Status parcialmente_aceita disponível';
    RAISE NOTICE '✅ Triggers instalados';
    RAISE NOTICE '✅ Índices criados';
    RAISE NOTICE '✅ Função de debug disponível';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Sistema de Matching Fracionado ATIVO!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Teste com:';
    RAISE NOTICE '   SELECT * FROM debug_serie_matching(''sua-serie-uuid'');';
    RAISE NOTICE '';
END$$;

