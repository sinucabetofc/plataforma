/**
 * ============================================================
 * Migration 012: Fix Transactions RLS
 * ============================================================
 * Corrige as políticas de RLS para permitir inserção de transações
 * pelos triggers do sistema
 */

-- Desabilitar RLS temporariamente para transactions
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Ou, alternativa: Criar política que permite qualquer INSERT autenticado
-- (descomente se preferir manter RLS ativo)
/*
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política: Permitir INSERT para usuários autenticados
DROP POLICY IF EXISTS "transactions_insert_policy" ON transactions;
CREATE POLICY "transactions_insert_policy"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Permitir SELECT apenas para o próprio usuário
DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;
CREATE POLICY "transactions_select_policy"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
*/



