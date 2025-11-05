# Guia de Setup do Banco de Dados - SinucaBet

## 📋 Pré-requisitos

- PostgreSQL 14 ou superior
- Cliente PostgreSQL (psql, pgAdmin, DBeaver, etc.)
- Acesso com privilégios de superusuário (para criar database e extensões)

## 🚀 Instalação

### 1. Instalar PostgreSQL

#### macOS (Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql-14 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows
Baixe o instalador em: https://www.postgresql.org/download/windows/

### 2. Verificar Instalação
```bash
psql --version
# Deve retornar: psql (PostgreSQL) 14.x
```

## 🗄️ Configuração do Banco de Dados

### Passo 1: Criar o Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do psql, criar o database
CREATE DATABASE sinucabet;

# Conectar ao novo database
\c sinucabet

# Sair
\q
```

**Ou via comando único:**
```bash
createdb -U postgres sinucabet
```

### Passo 2: Executar o Schema

```bash
# Executar o arquivo de schema
psql -U postgres -d sinucabet -f database-schema.sql
```

**Ou copiar e colar o conteúdo do arquivo `database-schema.sql` no pgAdmin ou DBeaver.**

### Passo 3: (Opcional) Popular com Dados de Teste

⚠️ **APENAS para desenvolvimento/testes! NÃO executar em produção!**

```bash
psql -U postgres -d sinucabet -f database-seed.sql
```

## 🔐 Configuração de Usuário da Aplicação

Por segurança, crie um usuário específico para a aplicação (não use o superusuário `postgres`):

```sql
-- Conectar ao database
psql -U postgres -d sinucabet

-- Criar usuário
CREATE ROLE sinucabet_app WITH LOGIN PASSWORD 'sua_senha_segura_aqui';

-- Conceder permissões
GRANT CONNECT ON DATABASE sinucabet TO sinucabet_app;
GRANT USAGE ON SCHEMA public TO sinucabet_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sinucabet_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sinucabet_app;

-- Garantir que novas tabelas também terão as permissões
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sinucabet_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO sinucabet_app;
```

## 🔧 Configuração de Conexão

### String de Conexão (DATABASE_URL)

```
postgresql://sinucabet_app:sua_senha@localhost:5432/sinucabet
```

### Variáveis de Ambiente (.env)

```env
# Database
DATABASE_URL=postgresql://sinucabet_app:sua_senha@localhost:5432/sinucabet
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sinucabet
DB_USER=sinucabet_app
DB_PASSWORD=sua_senha
DB_SSL=false

# Pool de Conexões (opcional)
DB_POOL_MIN=2
DB_POOL_MAX=10
```

## 📊 Verificação da Instalação

Execute as queries de verificação:

```sql
-- Verificar se todas as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Resultado esperado:
-- bet_matches
-- bets
-- games
-- transactions
-- users
-- wallet

-- Verificar enums
SELECT typname 
FROM pg_type 
WHERE typtype = 'e'
ORDER BY typname;

-- Verificar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Verificar views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';
```

## 🧪 Teste Rápido

Execute este teste para verificar se tudo está funcionando:

```sql
-- 1. Criar um usuário de teste
INSERT INTO users (name, email, password_hash, phone, cpf, pix_key, pix_type)
VALUES (
    'Teste Silva',
    'teste@sinucabet.com',
    '$2b$10$abcdefghijklmnopqrstuvwxyz',
    '+5511999999999',
    '000.000.000-00',
    'teste@sinucabet.com',
    'email'
)
RETURNING id, name, email;

-- 2. Verificar se a carteira foi criada automaticamente
SELECT u.name, w.balance, w.blocked_balance
FROM users u
JOIN wallet w ON u.id = w.user_id
WHERE u.email = 'teste@sinucabet.com';

-- 3. Limpar teste
DELETE FROM users WHERE email = 'teste@sinucabet.com';
```

## 🐛 Troubleshooting

### Erro: "extension uuid-ossp does not exist"

```sql
-- Conectar como superusuário
psql -U postgres -d sinucabet

-- Criar a extensão
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Erro: "permission denied for schema public"

```sql
GRANT ALL ON SCHEMA public TO sinucabet_app;
```

### Erro: "relation does not exist"

Verifique se o schema foi executado corretamente:
```bash
psql -U postgres -d sinucabet -f database-schema.sql
```

### Performance lenta

Execute ANALYZE para atualizar estatísticas:
```sql
ANALYZE users;
ANALYZE wallet;
ANALYZE games;
ANALYZE bets;
ANALYZE transactions;
ANALYZE bet_matches;
```

## 📈 Monitoramento

### Ver conexões ativas
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'sinucabet';
```

### Ver tamanho do database
```sql
SELECT pg_size_pretty(pg_database_size('sinucabet'));
```

### Ver queries lentas (se habilitado)
```sql
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 10;
```

## 🔄 Migrações

Para futuras alterações no schema, crie arquivos de migração numerados:

```
migrations/
  001_initial_schema.sql          (já aplicado)
  002_add_user_roles.sql         (próxima)
  003_add_notifications.sql      (futura)
```

### Template de Migração

```sql
-- Migration: 002_add_user_roles.sql
-- Description: Adiciona sistema de roles para usuários
-- Date: YYYY-MM-DD

BEGIN;

-- Suas alterações aqui
CREATE TYPE user_role_enum AS ENUM ('user', 'admin', 'moderator');
ALTER TABLE users ADD COLUMN role user_role_enum DEFAULT 'user';

-- Registrar migração (criar tabela se não existir)
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_migrations (version, description) 
VALUES (2, 'Add user roles system');

COMMIT;
```

## 💾 Backup e Restore

### Backup Completo
```bash
# Backup em formato custom (comprimido)
pg_dump -U postgres -d sinucabet -F c -f backup_sinucabet_$(date +%Y%m%d_%H%M%S).dump

# Backup em SQL puro
pg_dump -U postgres -d sinucabet -F p -f backup_sinucabet_$(date +%Y%m%d_%H%M%S).sql
```

### Restore
```bash
# Restaurar de backup custom
pg_restore -U postgres -d sinucabet -c backup_sinucabet_20250104_120000.dump

# Restaurar de SQL
psql -U postgres -d sinucabet -f backup_sinucabet_20250104_120000.sql
```

### Backup Automático (Cron)
```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 3h da manhã)
0 3 * * * /usr/bin/pg_dump -U postgres -d sinucabet -F c -f /backups/sinucabet_$(date +\%Y\%m\%d).dump
```

## 🔒 Segurança

### Checklist de Segurança

- [ ] Usar usuário dedicado (não `postgres`)
- [ ] Senha forte para o usuário da aplicação
- [ ] Habilitar SSL/TLS em produção
- [ ] Configurar `pg_hba.conf` adequadamente
- [ ] Restringir acesso por IP
- [ ] Implementar rate limiting na aplicação
- [ ] Fazer backups regulares
- [ ] Monitorar logs de acesso
- [ ] Usar prepared statements (proteção contra SQL injection)

### Configurar SSL (Produção)

```bash
# Gerar certificados SSL
openssl req -new -x509 -days 365 -nodes -text -out server.crt \
  -keyout server.key -subj "/CN=sinucabet.com"

chmod og-rwx server.key

# Editar postgresql.conf
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

## 📚 Recursos Adicionais

- **Documentação PostgreSQL**: https://www.postgresql.org/docs/14/
- **Tutorial de Performance**: https://wiki.postgresql.org/wiki/Performance_Optimization
- **Best Practices**: https://wiki.postgresql.org/wiki/Don%27t_Do_This

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs do PostgreSQL:
   ```bash
   # Linux
   sudo tail -f /var/log/postgresql/postgresql-14-main.log
   
   # macOS (Homebrew)
   tail -f /usr/local/var/log/postgresql@14.log
   ```

2. Consulte a documentação em `README-DATABASE.md`

3. Execute queries de diagnóstico em `database-queries.sql` (Seção 5)

---

**Versão:** 1.0  
**Última Atualização:** Novembro 2025

