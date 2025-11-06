# 📘 Como Aplicar Migrations no Supabase

## Método 1: Supabase Dashboard (Recomendado) ✅

### **Passo a Passo:**

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Login com sua conta

2. **Selecione o Projeto SinucaBet**
   - Clique no projeto correto

3. **Abra o SQL Editor**
   - Menu lateral → **SQL Editor**
   - Ou acesse diretamente: https://supabase.com/dashboard/project/SEU_PROJECT_ID/sql

4. **Nova Query**
   - Clique em **"New query"** ou **"+ New"**

5. **Copiar o SQL da Migration**
   - Abra o arquivo: `backend/supabase/migrations/004_create_players_table.sql`
   - Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)

6. **Colar no SQL Editor**
   - Cole no editor (Ctrl+V)

7. **Executar**
   - Clique em **"Run"** ou pressione `Ctrl+Enter`
   - Aguarde a execução (deve levar 1-2 segundos)

8. **Verificar Resultado**
   - Se aparecer "Success!" → ✅ Migration aplicada!
   - Se erro → Ver seção "Troubleshooting" abaixo

9. **Validar Tabela Criada**
   - Menu lateral → **Table Editor**
   - Verificar se tabela `players` aparece na lista

---

## Método 2: Supabase CLI (Avançado)

Se você tem o Supabase CLI instalado:

```bash
# 1. Navegar para pasta do projeto
cd /Users/viniciusambrozio/Downloads/MARKETING\ DIGITAL/PROGRAMAS/SinucaBet

# 2. Aplicar migration
supabase db push

# Ou aplicar migration específica:
supabase db execute --file backend/supabase/migrations/004_create_players_table.sql
```

---

## Troubleshooting

### **Erro: "role IN ('admin', 'parceiro')" - column "role" does not exist**

Precisamos adicionar o campo `role` na tabela `users` primeiro.

**Solução:** Executar este SQL antes:

```sql
-- Adicionar campo role na tabela users
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'apostador' NOT NULL;
    
    -- Criar tipo ENUM para roles
    CREATE TYPE user_role AS ENUM ('apostador', 'admin', 'parceiro', 'influencer');
    
    -- Alterar coluna para usar ENUM
    ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
    
    -- Criar índice
    CREATE INDEX idx_users_role ON users(role);
    
    COMMENT ON COLUMN users.role IS 'Tipo de usuário: apostador, admin, parceiro ou influencer';
  END IF;
END $$;
```

Depois execute a migration 004 novamente.

---

### **Erro: "policy already exists"**

Significa que a migration já foi aplicada. Pode ignorar ou executar:

```sql
DROP TABLE IF EXISTS players CASCADE;
```

E aplicar novamente.

---

## ✅ Checklist de Validação

Após aplicar a migration, verifique:

- [ ] Tabela `players` aparece no Table Editor
- [ ] Colunas corretas: id, name, nickname, photo_url, bio, active, estatísticas
- [ ] RLS habilitado (ícone de cadeado na tabela)
- [ ] Triggers criados (update_players_updated_at, calculate_players_win_rate)
- [ ] Índices criados (veja em SQL Editor → Indexes)

---

## 📊 Testar a Tabela

Execute no SQL Editor:

```sql
-- 1. Inserir jogador de teste (você precisa estar autenticado como admin)
INSERT INTO players (name, nickname, photo_url, bio)
VALUES (
  'Baianinho de Mauá',
  'Baianinho',
  'https://via.placeholder.com/150',
  'Lenda viva da sinuca brasileira'
);

-- 2. Listar todos os jogadores
SELECT * FROM players;

-- 3. Atualizar estatísticas
UPDATE players 
SET total_matches = 10, total_wins = 7, total_losses = 3
WHERE nickname = 'Baianinho';

-- 4. Verificar win_rate (deve ser 70.00)
SELECT name, total_matches, total_wins, win_rate FROM players;
```

---

## 🔄 Próximas Migrations

Após confirmar que esta funcionou, aplicar em ordem:

1. ✅ `004_create_players_table.sql` ← VOCÊ ESTÁ AQUI
2. `005_create_matches_table.sql`
3. `006_create_series_table.sql`
4. `007_create_bets_table.sql`
5. `008_create_transactions_table.sql`
6. `009_create_influencer_earnings_table.sql`
7. `010_add_role_to_users.sql` (se ainda não tiver)

---

## 💡 Dica

Salve suas queries no Supabase Dashboard com nomes como:
- `Migration 004 - Players`
- `Migration 005 - Matches`

Assim você pode re-executar facilmente se precisar!

---

**Me avise quando aplicar a migration para continuarmos!** 🚀





