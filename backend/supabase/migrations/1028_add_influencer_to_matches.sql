-- ============================================================
-- Migration: Add Influencer Fields to Matches Table
-- Descrição: Adiciona campos para associar influencers às partidas
-- Data: 08/11/2025
-- ============================================================

-- Adicionar colunas à tabela matches
ALTER TABLE matches
ADD COLUMN IF NOT EXISTS influencer_id UUID,
ADD COLUMN IF NOT EXISTS influencer_commission DECIMAL(5, 2);

-- Adicionar Foreign Key
ALTER TABLE matches
ADD CONSTRAINT fk_matches_influencer 
    FOREIGN KEY (influencer_id)
    REFERENCES influencers(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Adicionar constraint para comissão
ALTER TABLE matches
ADD CONSTRAINT influencer_commission_range 
    CHECK (influencer_commission IS NULL OR (influencer_commission >= 0 AND influencer_commission <= 100));

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_matches_influencer_id ON matches(influencer_id);

-- Comentários
COMMENT ON COLUMN matches.influencer_id IS 'ID do influencer que está transmitindo o jogo';
COMMENT ON COLUMN matches.influencer_commission IS 'Percentual de comissão específico deste jogo (override do padrão do influencer)';

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================

