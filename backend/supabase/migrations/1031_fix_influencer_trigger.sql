-- ============================================================
-- Migration: Fix Influencer Validation Trigger
-- Descrição: Corrige trigger para validar influencer_id na tabela influencers
-- Data: 08/11/2025
-- ============================================================

-- Remover trigger antigo que validava na tabela users
DROP TRIGGER IF EXISTS trigger_validate_matches_influencer ON matches;
DROP FUNCTION IF EXISTS validate_matches_influencer();

-- Criar nova função de validação que verifica na tabela influencers
CREATE OR REPLACE FUNCTION validate_matches_influencer()
RETURNS TRIGGER AS $$
BEGIN
  -- Se influencer_id for fornecido, validar
  IF NEW.influencer_id IS NOT NULL THEN
    -- Verificar se existe na tabela influencers e está ativo
    IF NOT EXISTS (
      SELECT 1 FROM influencers 
      WHERE id = NEW.influencer_id 
      AND is_active = TRUE
    ) THEN
      RAISE EXCEPTION 'Influencer não encontrado ou inativo';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger atualizado
CREATE TRIGGER trigger_validate_matches_influencer
  BEFORE INSERT OR UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION validate_matches_influencer();

COMMENT ON FUNCTION validate_matches_influencer() IS 'Valida se influencer_id existe na tabela influencers e está ativo';

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================

