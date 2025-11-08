-- ============================================================
-- Migration: Add pix_type Column to Influencers
-- Descrição: Adiciona coluna pix_type separadamente e recarrega cache
-- Data: 08/11/2025
-- ============================================================

-- Adicionar coluna pix_type se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'influencers' AND column_name = 'pix_type'
    ) THEN
        ALTER TABLE influencers ADD COLUMN pix_type pix_type_enum DEFAULT 'random';
        COMMENT ON COLUMN influencers.pix_type IS 'Tipo da chave PIX: cpf, email, phone ou random';
    END IF;
END $$;

-- Recarregar schema cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================

