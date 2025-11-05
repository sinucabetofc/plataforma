# Diagrama Entidade-Relacionamento - SinucaBet

## Visualização do Diagrama

Você pode visualizar este diagrama em:
- GitHub (renderiza automaticamente)
- VSCode com extensão Markdown Preview Mermaid Support
- [Mermaid Live Editor](https://mermaid.live)

## Diagrama ER

```mermaid
erDiagram
    users ||--|| wallet : "possui"
    users ||--o{ bets : "faz"
    users ||--o{ transactions : "realiza"
    games ||--o{ bets : "recebe"
    games ||--o{ bet_matches : "contém"
    bets ||--o{ transactions : "gera"
    bets ||--o{ bet_matches : "participa"
    
    users {
        uuid id PK
        string name
        string email UK
        string password_hash
        string phone
        string cpf UK
        string pix_key
        enum pix_type
        boolean is_active
        boolean email_verified
        timestamp created_at
        timestamp updated_at
    }
    
    wallet {
        uuid id PK
        uuid user_id FK_UK
        decimal balance
        decimal blocked_balance
        decimal total_deposited
        decimal total_withdrawn
        timestamp created_at
        timestamp updated_at
    }
    
    games {
        uuid id PK
        string player_a
        string player_b
        string modality
        text advantages
        integer series
        enum status
        enum result
        decimal bet_limit
        decimal total_bet_player_a
        decimal total_bet_player_b
        timestamp started_at
        timestamp finished_at
        timestamp created_at
        timestamp updated_at
    }
    
    bets {
        uuid id PK
        uuid game_id FK
        uuid user_id FK
        enum side
        decimal amount
        decimal potential_return
        enum status
        timestamp matched_at
        timestamp settled_at
        timestamp created_at
        timestamp updated_at
    }
    
    transactions {
        uuid id PK
        uuid user_id FK
        uuid bet_id FK
        enum type
        decimal amount
        decimal fee
        decimal net_amount
        enum status
        text description
        jsonb metadata
        timestamp processed_at
        timestamp created_at
        timestamp updated_at
    }
    
    bet_matches {
        uuid id PK
        uuid game_id FK
        uuid bet_player_a_id FK
        uuid bet_player_b_id FK
        decimal matched_amount
        timestamp created_at
    }
```

## Relacionamentos Detalhados

### 1:1 (Um para Um)
- **users → wallet**: Cada usuário possui exatamente UMA carteira

### 1:N (Um para Muitos)
- **users → bets**: Um usuário pode fazer VÁRIAS apostas
- **users → transactions**: Um usuário pode ter VÁRIAS transações
- **games → bets**: Um jogo pode receber VÁRIAS apostas
- **games → bet_matches**: Um jogo pode ter VÁRIOS pareamentos
- **bets → transactions**: Uma aposta pode gerar VÁRIAS transações (registro, ganho, etc.)
- **bets → bet_matches**: Uma aposta pode participar de VÁRIOS pareamentos (parcial matching)

## Integridade Referencial

### CASCADE (Exclusão em cascata)
```
users → wallet (ON DELETE CASCADE)
```
Se um usuário for deletado, sua carteira também será removida.

### RESTRICT (Impede exclusão)
```
users → bets (ON DELETE RESTRICT)
users → transactions (ON DELETE RESTRICT)
games → bets (ON DELETE RESTRICT)
games → bet_matches (ON DELETE RESTRICT)
bets → bet_matches (ON DELETE RESTRICT)
```
Não é possível deletar um registro se houver dependências ativas.

### SET NULL (Define como nulo)
```
transactions → bets (ON DELETE SET NULL)
```
Se uma aposta for deletada, o campo `bet_id` na transação fica NULL (mantém o histórico).

## Legendas

- **PK**: Primary Key (Chave Primária)
- **FK**: Foreign Key (Chave Estrangeira)
- **UK**: Unique Key (Valor único)
- **FK_UK**: Foreign Key que também é Unique (relação 1:1)

## Índices Importantes

### Por Performance
- `idx_users_email`, `idx_users_cpf` - Busca rápida de usuários
- `idx_bets_game_status_side` - Matching de apostas
- `idx_transactions_user_created` - Histórico financeiro

### Por Integridade
- Todas as Foreign Keys são automaticamente indexadas
- Campos UNIQUE (email, cpf, user_id na wallet)

## Observações de Design

1. **UUIDs**: Todas as tabelas usam UUID como PK para segurança e distribuição
2. **Soft Delete**: Não implementado no schema atual, mas pode ser adicionado com campo `deleted_at`
3. **Auditoria**: Todas as tabelas têm `created_at` e `updated_at`
4. **JSONB**: Campo `metadata` em transactions permite flexibilidade
5. **Enums**: Tipos customizados garantem consistência de dados
6. **Triggers**: Atualização automática de `updated_at` e criação de wallet

## Fluxo de Dados Típico

1. **Registro**: `users` → trigger cria `wallet`
2. **Depósito**: `transactions` (type=deposit) → atualiza `wallet.balance`
3. **Criar Jogo**: Insere em `games`
4. **Apostar**: `bets` + `transactions` (type=bet) → bloqueia saldo em `wallet.blocked_balance`
5. **Matching**: `bet_matches` pareia apostas opostas
6. **Resultado**: Atualiza `games.result` → processa `bets` → cria `transactions` (type=win)
7. **Saque**: `transactions` (type=withdraw) → atualiza `wallet.balance`

