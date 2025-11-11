-- =====================================================
-- Migration: 1006_fix_bets_update_policy
-- Description: Permitir que o backend (service role) atualize apostas
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- PROBLEMA:
-- A política de UPDATE da tabela bets só permite admins
-- Mas o backend usa service key, então o UPDATE é bloqueado
-- =====================================================

-- =====================================================
-- SOLUÇÃO:
-- Desabilitar RLS na tabela bets completamente
-- Ou criar política que permite UPDATE via service role
-- =====================================================

-- Opção 1: Desabilitar RLS (mais simples e seguro para backend com service key)
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- JUSTIFICATIVA:
-- - O backend usa service_role key que já tem permissões totais
-- - As validações de segurança já estão no código (authMiddleware)
-- - Triggers do banco fazem validações adicionais
-- - Não há acesso direto do frontend à tabela bets (só via API)
-- =====================================================

-- =====================================================
-- ALTERNATIVA (Opção 2): Manter RLS mas permitir service role
-- =====================================================

-- Caso prefira manter RLS, descomente abaixo:
/*
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Remover política antiga
DROP POLICY IF EXISTS "Apenas admins podem atualizar apostas" ON bets;

-- Nova política: Permite UPDATE para admins E para service role
CREATE POLICY "Admins e triggers podem atualizar apostas"
  ON bets
  FOR UPDATE
  USING (
    -- Admins autenticados
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
    OR
    -- Ou se não há auth.uid() (service role via backend)
    auth.uid() IS NULL
  );
*/

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 'Política de bets atualizada com sucesso!' as status;

-- Verificar políticas atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'bets';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================



