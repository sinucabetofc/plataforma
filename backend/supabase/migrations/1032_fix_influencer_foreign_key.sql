-- ============================================================
-- Migration: Fix Influencer Foreign Key
-- Descrição: Corrige FK do influencer_id para apontar para tabela influencers
-- Data: 08/11/2025
-- ============================================================

-- Remover FK antiga que aponta para users
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_influencer_id_fkey;

-- Adicionar nova FK apontando para influencers
ALTER TABLE matches
ADD CONSTRAINT matches_influencer_id_fkey 
    FOREIGN KEY (influencer_id)
    REFERENCES influencers(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

COMMENT ON CONSTRAINT matches_influencer_id_fkey ON matches IS 'FK para tabela influencers (não users)';

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================

