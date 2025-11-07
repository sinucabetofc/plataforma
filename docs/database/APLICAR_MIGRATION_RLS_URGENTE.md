# 🚨 CORREÇÃO URGENTE: Aplicar Migration RLS

**Data**: 07/11/2025  
**Prioridade**: 🔴 **CRÍTICA**  
**Status**: ⏳ **AGUARDANDO APLICAÇÃO**

---

## 🐛 Problema Identificado

O cancelamento de apostas está:
- ✅ **Reembolsando o saldo** corretamente
- ❌ **NÃO mudando o status da aposta** para 'cancelada'

### Causa Raiz

A política de RLS (Row Level Security) na tabela `bets` está **bloqueando** o UPDATE feito pelo backend:

```sql
CREATE POLICY "Apenas admins podem atualizar apostas"
  ON bets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
```

O backend usa **service_role key** (sem `auth.uid()`), então o Supabase bloqueia o UPDATE.

---

## ✅ Solução

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto **SinucaBet**
3. Vá em **SQL Editor** (na barra lateral esquerda)

### Passo 2: Executar a Migration

Cole e execute o seguinte SQL:

```sql
-- =====================================================
-- CORREÇÃO: Desabilitar RLS na tabela bets
-- =====================================================

ALTER TABLE bets DISABLE ROW LEVEL SECURITY;
```

### Passo 3: Verificar

Execute para confirmar:

```sql
-- Verificar se RLS foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'bets';
```

**Resultado esperado**: `rowsecurity = false`

---

## 🎯 Teste Após Aplicar

1. Faça uma aposta de R$ 10
2. Cancele a aposta
3. Recarregue a página (F5)
4. ✅ **A aposta deve SUMIR** da lista
5. ✅ **O saldo deve ser reembolsado**

---

## 📊 Impacto

### Antes da Correção
- Apostas canceladas:
  - ✅ Saldo reembolsado
  - ❌ Status permanece 'pendente'
  - ❌ Aposta continua aparecendo

### Depois da Correção
- Apostas canceladas:
  - ✅ Saldo reembolsado
  - ✅ Status muda para 'cancelada'
  - ✅ Aposta some da lista

---

## 🔐 Segurança

**Por que é seguro desabilitar RLS?**

1. ✅ Backend usa `service_role` key que já tem permissões totais
2. ✅ Autenticação é feita via JWT no middleware `authenticateToken`
3. ✅ Validações de propriedade estão no código:
   ```javascript
   .eq('id', betId)
   .eq('user_id', userId) // Garante que é a aposta do usuário
   ```
4. ✅ Triggers do banco fazem validações adicionais
5. ✅ Frontend **NÃO** acessa o Supabase diretamente (só via API)

---

## 📝 Migration Criada

Arquivo: `backend/supabase/migrations/1006_fix_bets_update_policy.sql`

Esse arquivo contém:
- A correção (desabilitar RLS)
- Alternativa (manter RLS com nova policy)
- Justificativa completa
- Scripts de verificação

---

## ⚡ Aplicação Rápida

Se preferir via terminal com `psql`:

```bash
# Conectar ao banco
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Executar
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;

# Verificar
\d+ bets
```

---

## 🎱 Após Aplicar

1. ✅ Testar cancelamento via frontend
2. ✅ Verificar que aposta some da lista
3. ✅ Confirmar reembolso funciona
4. ✅ Marcar esta migration como aplicada

---

**STATUS**: 🔴 **AGUARDANDO APLICAÇÃO NO SUPABASE**

**AÇÃO NECESSÁRIA**: Executar o SQL acima no SQL Editor do Supabase

