-- =====================================================
-- Migration: 1033_fix_transactions_update_policy
-- Description: Adiciona política de UPDATE para transactions
-- Created: 2025-11-10
-- Problema: Status do depósito não atualiza para 'completed'
-- =====================================================

-- =====================================================
-- 1. HABILITAR RLS SE NÃO ESTIVER
-- =====================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS DE ACESSO
-- =====================================================

-- Política: Admin pode fazer TUDO
DROP POLICY IF EXISTS "transactions_admin_all" ON transactions;
CREATE POLICY "transactions_admin_all"
  ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Política: Usuários podem VER apenas suas próprias transações
DROP POLICY IF EXISTS "transactions_user_select" ON transactions;
CREATE POLICY "transactions_user_select"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Política: Sistema pode INSERIR transações (para triggers e webhook)
DROP POLICY IF EXISTS "transactions_system_insert" ON transactions;
CREATE POLICY "transactions_system_insert"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ✅ NOVA POLÍTICA: Sistema pode ATUALIZAR transações (para webhook confirmar depósitos)
DROP POLICY IF EXISTS "transactions_system_update" ON transactions;
CREATE POLICY "transactions_system_update"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: Parceiros podem ver transações das suas partidas
DROP POLICY IF EXISTS "transactions_parceiro_matches" ON transactions;
CREATE POLICY "transactions_parceiro_matches"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN bets b ON b.user_id = transactions.user_id
      JOIN series s ON s.id = b.serie_id
      JOIN matches m ON m.id = s.match_id
      WHERE u.id = auth.uid()
      AND u.role = 'parceiro'
      AND m.created_by = auth.uid()
    )
  );

-- =====================================================
-- 3. COMENTÁRIOS
-- =====================================================

COMMENT ON POLICY "transactions_admin_all" ON transactions IS 'Admins têm acesso total às transações';
COMMENT ON POLICY "transactions_user_select" ON transactions IS 'Usuários veem apenas suas próprias transações';
COMMENT ON POLICY "transactions_system_insert" ON transactions IS 'Sistema pode inserir transações (triggers, webhook)';
COMMENT ON POLICY "transactions_system_update" ON transactions IS 'Sistema pode atualizar transações (webhook confirmação)';
COMMENT ON POLICY "transactions_parceiro_matches" ON transactions IS 'Parceiros veem transações das suas partidas';

-- =====================================================
-- 4. VERIFICAÇÃO
-- =====================================================

-- Listar todas as políticas da tabela transactions
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'transactions'
ORDER BY policyname;

-- Verificar se RLS está habilitado
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'transactions';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

