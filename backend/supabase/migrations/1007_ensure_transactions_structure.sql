-- =====================================================
-- Migration: 1007_ensure_transactions_structure
-- Description: Garantir estrutura correta da tabela transactions
-- Created: 2025-11-07
-- =====================================================

-- =====================================================
-- 1. POPULAR user_id onde está NULL
-- =====================================================

-- Popular user_id baseado em wallet_id existente (se houver registros sem user_id)
UPDATE transactions t
SET user_id = w.user_id
FROM wallet w
WHERE t.wallet_id = w.id AND t.user_id IS NULL;

-- =====================================================
-- 2. GARANTIR ÍNDICES IMPORTANTES
-- =====================================================

-- Índice para user_id (JOIN direto com users)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Índice para type (filtro comum)
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Índice composto user_id + created_at (buscar transações de um usuário)
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- Índice para status (se for usado para filtros)
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status) WHERE status IS NOT NULL;

-- Índice GIN para metadata (busca em JSON)
CREATE INDEX IF NOT EXISTS idx_transactions_metadata ON transactions USING GIN (metadata);

-- =====================================================
-- 3. HABILITAR RLS PARA SEGURANÇA
-- =====================================================

-- Habilitar RLS na tabela
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Política: Admin pode ver TODAS as transações
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

-- Política: Usuários podem ver apenas SUAS transações
DROP POLICY IF EXISTS "transactions_user_own" ON transactions;
CREATE POLICY "transactions_user_own"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Política: Sistema pode inserir transações (para triggers)
DROP POLICY IF EXISTS "transactions_system_insert" ON transactions;
CREATE POLICY "transactions_system_insert"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 4. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE transactions IS 'Histórico completo de transações financeiras do sistema';
COMMENT ON COLUMN transactions.user_id IS 'ID do usuário (JOIN direto) - popular via wallet_id';
COMMENT ON COLUMN transactions.wallet_id IS 'ID da carteira do usuário';
COMMENT ON COLUMN transactions.bet_id IS 'ID da aposta relacionada (opcional)';
COMMENT ON COLUMN transactions.type IS 'Tipo: aposta, ganho, deposit, withdraw, admin_credit, admin_debit, refund';
COMMENT ON COLUMN transactions.amount IS 'Valor da transação em centavos (pode ser negativo para débitos)';
COMMENT ON COLUMN transactions.balance_before IS 'Saldo antes da transação (centavos)';
COMMENT ON COLUMN transactions.balance_after IS 'Saldo após a transação (centavos)';
COMMENT ON COLUMN transactions.fee IS 'Taxa cobrada em centavos (ex: 8% no saque)';
COMMENT ON COLUMN transactions.net_amount IS 'Valor líquido em centavos (amount - fee)';
COMMENT ON COLUMN transactions.status IS 'Status: pending, completed, failed, cancelled';
COMMENT ON COLUMN transactions.description IS 'Descrição legível da transação';
COMMENT ON COLUMN transactions.metadata IS 'Dados extras em JSON (correlationID, admin_id, pix_key, etc)';
COMMENT ON COLUMN transactions.processed_at IS 'Timestamp de quando foi processada';

-- =====================================================
-- 5. VERIFICAÇÃO E ESTATÍSTICAS
-- =====================================================

-- Mostrar estatísticas
SELECT 
  'Transações processadas com sucesso!' as status,
  COUNT(*) as total_transactions,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(*) FILTER (WHERE user_id IS NULL) as missing_user_id
FROM transactions;

-- Mostrar tipos de transação existentes
SELECT 
  type,
  COUNT(*) as count,
  SUM(amount) / 100.0 as total_value_reais
FROM transactions
GROUP BY type
ORDER BY count DESC;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

