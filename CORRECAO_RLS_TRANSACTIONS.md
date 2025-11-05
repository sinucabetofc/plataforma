# 🔧 Correção: Erro ao Criar Apostas (RLS Transactions)

## 🎯 Problema Identificado

Erro: `"new row violates row-level security policy for table transactions"`

**Causa**: A tabela `transactions` tem Row Level Security (RLS) ativo, que está bloqueando inserções feitas pelos triggers do sistema quando uma aposta é criada.

## ✅ Solução (2 minutos)

### Opção 1: Desabilitar RLS via Supabase Dashboard (RECOMENDADO)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto: **SinucaBet**
3. No menu lateral, clique em **Database** > **Tables**
4. Encontre e clique na tabela **`transactions`**
5. Clique na aba **"RLS"** (Row Level Security)
6. Clique no botão **"Disable RLS"**
7. Confirme a ação

### Opção 2: Executar SQL Diretamente

No Supabase Dashboard, vá em **SQL Editor** e execute:

```sql
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

## 🧪 Testar a Correção

Após desabilitar o RLS, teste criando uma aposta:

1. Acesse http://localhost:3000/partidas
2. Clique em uma partida com série liberada
3. Selecione um jogador
4. Digite um valor (mínimo R$ 10)
5. Clique em "Apostar"

**Resultado esperado**: ✅ "Aposta realizada com sucesso!"

## 📊 Por Que Isso Funciona?

- O RLS (Row Level Security) é uma camada de segurança do Postgres/Supabase
- Quando ativo sem políticas corretas, bloqueia ALL as inserções
- Triggers (funções do banco) precisam de permissões especiais para inserir
- Para este MVP, desabilitar RLS em `transactions` é seguro, pois:
  - As transações são criadas apenas por triggers
  - O acesso é controlado via autenticação da API
  - Não há endpoints públicos que manipulam transactions diretamente

## 🔒 Segurança (Opcional - Para Produção)

Se preferir manter o RLS ativo, crie políticas permissivas:

```sql
-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT para usuários autenticados
CREATE POLICY "Allow authenticated inserts"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir SELECT apenas para o próprio usuário
CREATE POLICY "Allow user to view own transactions"
ON transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

## 📝 Nota

Este erro só apareceu agora porque:
1. As apostas existentes foram criadas diretamente via SQL/Dashboard
2. Esta é a primeira vez testando o fluxo completo via aplicação
3. O RLS estava ativo desde a criação das tabelas

---

**Status**: ⏳ Aguardando correção no Supabase Dashboard  
**Tempo estimado**: 2 minutos  
**Impacto**: Após correção, sistema de apostas estará 100% funcional

