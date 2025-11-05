# SinucaBet - Documentação do Banco de Dados

## Visão Geral

Este documento descreve o esquema de banco de dados da plataforma **SinucaBet**, um intermediador de apostas de sinuca. O sistema foi projetado para PostgreSQL 14+ com foco em integridade de dados, performance e auditoria.

## 📊 Estrutura das Tabelas

### 1. **users** - Usuários da Plataforma
Armazena informações dos usuários cadastrados.

**Campos Principais:**
- `id` (UUID): Identificador único
- `email` (string): Email único com validação de formato
- `cpf` (string): CPF formatado (XXX.XXX.XXX-XX)
- `pix_key` e `pix_type`: Chave PIX para saques (email, CPF, telefone ou aleatória)
- `is_active`: Flag de usuário ativo
- `email_verified`: Confirmação de email

**Constraints:**
- Email deve ter formato válido
- CPF deve seguir formato brasileiro
- Telefone no formato internacional
- Chave PIX só pode existir se o tipo também for definido

**Índices:**
- Email, CPF (únicos e indexados)
- Data de criação (DESC)

---

### 2. **wallet** - Carteira Digital
Cada usuário possui UMA carteira associada.

**Campos Principais:**
- `balance` (decimal): Saldo disponível
- `blocked_balance` (decimal): Saldo bloqueado em apostas pendentes
- `total_deposited`: Acumulado de depósitos
- `total_withdrawn`: Acumulado de saques

**Constraints:**
- Todos os saldos devem ser não-negativos
- Relação 1:1 com usuário (UNIQUE em user_id)

**Trigger:**
- Carteira é criada automaticamente ao criar novo usuário

---

### 3. **games** - Jogos/Partidas
Registra partidas de sinuca disponíveis para apostas.

**Campos Principais:**
- `player_a`, `player_b`: Nomes dos jogadores
- `modality`: Tipo de jogo (Bolas lisas, numeradas, etc.)
- `advantages`: Vantagens aplicadas (opcional)
- `series`: Número de partidas (melhor de N)
- `status`: open | in_progress | finished | cancelled
- `result`: player_a | player_b | draw (apenas quando finished)
- `bet_limit`: Limite máximo de aposta (opcional)
- `total_bet_player_a/b`: Total apostado em cada lado

**Constraints:**
- Jogadores devem ser diferentes
- Resultado só pode existir se status = finished
- Séries deve ser > 0

**Índices:**
- Status, datas, nomes dos jogadores, modalidade

---

### 4. **bets** - Apostas
Apostas realizadas pelos usuários.

**Campos Principais:**
- `game_id`: FK para games
- `user_id`: FK para users
- `side`: player_a | player_b
- `amount`: Valor apostado (DEVE ser múltiplo de 10)
- `potential_return`: Retorno potencial (calculado)
- `status`: pending | matched | won | lost | cancelled

**Constraints Importantes:**
- ✅ **Valor DEVE ser múltiplo de 10 e >= 10**
- DELETE RESTRICT em games e users (não pode deletar se houver apostas)

**Índices:**
- Composto para matching: (game_id, status, side)
- User_id, game_id, status, created_at

---

### 5. **transactions** - Transações Financeiras
Histórico completo de movimentações financeiras.

**Campos Principais:**
- `type`: deposit | bet | win | withdraw | fee | refund
- `amount`: Valor bruto
- `fee`: Taxa cobrada
- `net_amount`: Valor líquido (amount ± fee)
- `status`: pending | completed | failed | cancelled
- `metadata`: JSONB para dados extras

**Constraints:**
- Cálculo automático de net_amount baseado no tipo
- Amount deve ser positivo
- Fee não-negativa

**Índices:**
- Índice GIN no campo metadata (para buscas JSON)
- Composto: (user_id, created_at DESC)

---

### 6. **bet_matches** - Pareamento de Apostas
Registra o matching entre apostas de lados opostos.

**Campos Principais:**
- `game_id`: Jogo relacionado
- `bet_player_a_id`: Aposta no jogador A
- `bet_player_b_id`: Aposta no jogador B
- `matched_amount`: Valor pareado

**Constraints:**
- As duas apostas devem ser diferentes
- Matched amount > 0

---

## 🔗 Relacionamentos

```
users (1) ─────────── (1) wallet
  │
  ├─── (1:N) ─────── bets
  │
  └─── (1:N) ─────── transactions

games (1) ─────────── (N) bets
  │
  └─── (1:N) ─────── bet_matches

bets (1) ──────────── (N) bet_matches
  │
  └─── (1:N) ─────── transactions (opcional)
```

## 🎯 Tipos Enums

| Enum | Valores |
|------|---------|
| `pix_type_enum` | email, cpf, phone, random |
| `game_status_enum` | open, in_progress, finished, cancelled |
| `game_result_enum` | player_a, player_b, draw |
| `bet_side_enum` | player_a, player_b |
| `bet_status_enum` | pending, matched, won, lost, cancelled |
| `transaction_type_enum` | deposit, bet, win, withdraw, fee, refund |
| `transaction_status_enum` | pending, completed, failed, cancelled |

## 📈 Views Criadas

### 1. `user_stats`
Estatísticas agregadas por usuário:
- Saldo atual e bloqueado
- Total de apostas
- Total ganho e perdido

### 2. `game_betting_stats`
Estatísticas de apostas por jogo:
- Total apostado em cada lado
- Número de apostas e apostadores únicos

### 3. `user_transaction_summary`
Resumo financeiro por usuário:
- Total de depósitos e saques
- Total apostado e ganho
- Taxas pagas

## ⚡ Triggers Automáticos

1. **update_updated_at_column**: Atualiza `updated_at` automaticamente em todas as tabelas
2. **create_wallet_for_new_user**: Cria carteira automaticamente ao inserir novo usuário

## 🔒 Regras de Integridade

### Cascatas de DELETE:
- `wallet` → CASCADE (ao deletar usuário, deleta carteira)
- `bets` → RESTRICT (não pode deletar usuário/jogo com apostas)
- `transactions` → RESTRICT (não pode deletar usuário com transações)
- `bet_matches` → RESTRICT (protege integridade do matching)

### Validações Automáticas:
✅ Email com formato válido  
✅ CPF formatado (XXX.XXX.XXX-XX)  
✅ Telefone no formato internacional  
✅ Apostas múltiplas de 10  
✅ Saldos não-negativos  
✅ Resultado apenas em jogos finalizados  
✅ Net amount calculado corretamente  

## 🚀 Performance

### Índices Estratégicos:
- Campos únicos: email, cpf, user_id (wallet)
- Foreign keys: todas indexadas
- Índices compostos para queries complexas
- GIN para buscas em JSONB

### Estimativa de Performance:
- Busca de usuário por email/CPF: O(log n)
- Listagem de jogos abertos: O(log n) com índice em status
- Matching de apostas: O(log n) com índice composto
- Histórico de transações: O(log n) com índice em (user_id, created_at)

## 📝 Uso Básico

### Criar Usuário e Carteira:
```sql
-- Inserir usuário (carteira criada automaticamente via trigger)
INSERT INTO users (name, email, password_hash, phone, cpf, pix_key, pix_type)
VALUES (
    'João Silva',
    'joao@email.com',
    '$2b$10$...', -- hash bcrypt
    '+5511999999999',
    '123.456.789-00',
    'joao@email.com',
    'email'
);
```

### Criar Jogo:
```sql
INSERT INTO games (player_a, player_b, modality, series)
VALUES ('João Silva', 'Maria Santos', 'Bolas Numeradas', 3);
```

### Fazer Aposta:
```sql
INSERT INTO bets (game_id, user_id, side, amount)
VALUES (
    'game-uuid',
    'user-uuid',
    'player_a',
    50.00 -- Múltiplo de 10
);
```

### Registrar Transação:
```sql
INSERT INTO transactions (user_id, type, amount, fee, net_amount)
VALUES (
    'user-uuid',
    'deposit',
    100.00,
    2.00,
    98.00 -- amount - fee
);
```

## 🔧 Manutenção

### Backup Recomendado:
```bash
# Backup completo
pg_dump -U postgres -d sinucabet -F c -f sinucabet_backup.dump

# Restore
pg_restore -U postgres -d sinucabet sinucabet_backup.dump
```

### Monitoramento:
```sql
-- Tabelas maiores
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices não utilizados
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname NOT IN (
    SELECT indexrelname FROM pg_stat_user_indexes WHERE idx_scan > 0
);
```

## 📦 Próximos Passos

1. **Implementar Sistema de Roles**: Admin, Moderador, Usuário
2. **Adicionar Tabela de Notificações**: Push, email, SMS
3. **Sistema de Ranking**: Leaderboard de apostadores
4. **Histórico de Odds**: Rastreamento de mudanças nas odds
5. **Sistema de Disputas**: Resolução de conflitos

## 🛡️ Segurança

- ✅ UUIDs para prevenir enumeração
- ✅ Password hash (nunca senhas em texto puro)
- ✅ Validação de formato em todos os campos críticos
- ✅ Foreign keys com restrições apropriadas
- ✅ Constraints para garantir integridade de negócio
- ✅ Timestamps para auditoria completa

---

**Versão:** 1.0  
**Última Atualização:** Novembro 2025  
**Autor:** SinucaBet Development Team

