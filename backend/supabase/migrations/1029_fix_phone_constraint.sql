-- ============================================================
-- Migration: Fix Phone Constraint
-- Descrição: Atualiza validação do telefone para aceitar formatos mais flexíveis
-- Data: 08/11/2025
-- ============================================================

-- Remover constraint antiga
ALTER TABLE influencers DROP CONSTRAINT IF EXISTS phone_format_influencer;

-- Adicionar nova constraint mais flexível
ALTER TABLE influencers
ADD CONSTRAINT phone_format_influencer CHECK (phone ~ '^\+?[0-9]{10,15}$');

COMMENT ON CONSTRAINT phone_format_influencer ON influencers IS 'Aceita telefones com + opcional e 10-15 dígitos';

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================

