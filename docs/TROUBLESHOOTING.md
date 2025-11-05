# 🔧 Guia de Troubleshooting - SinucaBet

## Problemas Comuns e Soluções

### 🗄️ Erros de Banco de Dados

#### ❌ Erro: `relation "users" does not exist`

**Causa:** O schema do banco não foi criado.

**Solução:**
```bash
psql -U postgres -d sinucabet -f database-schema.sql
```

---

#### ❌ Erro: `column "tablename" does not exist`

**Causa:** Tentativa de executar múltiplas queries de uma vez ou erro de sintaxe.

**Soluções:**

1. **Execute queries individualmente:**
   - Copie apenas UMA query por vez
   - Certifique-se de incluir todo o bloco SELECT até o ponto e vírgula

2. **Verifique o contexto:**
```sql
-- Correto: execute APENAS esta query
SELECT * FROM users LIMIT 5;

-- Errado: não execute múltiplas queries juntas sem separador adequado
SELECT * FROM users;
SELECT * FROM games;
```

3. **Use um cliente SQL adequado:**
   - pgAdmin: Execute queries selecionando o texto e pressionando F5
   - DBeaver: Execute com Ctrl+Enter para query atual
   - psql: Execute linha por linha ou use arquivos separados

---

#### ❌ Erro: `foreign key constraint "fk_transactions_user" violated`

**Causa:** Tentando inserir dados com UUIDs que não existem.

**Solução:**

1. **Popule o banco com dados de teste:**
```bash
psql -U postgres -d sinucabet -f database-seed.sql
```

2. **Use queries dinâmicas ao invés de UUIDs hardcoded:**
```sql
-- ❌ Errado - UUID inexistente
INSERT INTO transactions (user_id, ...) 
VALUES ('00000000-0000-0000-0000-000000000000', ...);

-- ✅ Correto - Busca usuário real
INSERT INTO transactions (user_id, type, amount, fee, net_amount, status)
SELECT 
    id, 
    'deposit', 
    100.00, 
    2.00, 
    98.00, 
    'completed'
FROM users 
WHERE email = 'joao.silva@sinucabet.com';
```

---

#### ❌ Erro: `extension "uuid-ossp" does not exist`

**Causa:** Extensão UUID não está instalada.

**Solução:**
```sql
-- Conectar como superusuário
psql -U postgres -d sinucabet

-- Criar extensão
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

#### ❌ Erro: `permission denied for schema public`

**Causa:** Usuário sem permissões adequadas.

**Solução:**
```sql
-- Como superusuário (postgres)
GRANT ALL ON SCHEMA public TO sinucabet_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sinucabet_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sinucabet_app;
```

---

#### ❌ Erro: `duplicate key value violates unique constraint`

**Causa:** Tentando inserir email ou CPF duplicado.

**Solução:**

1. **Verifique se o usuário já existe:**
```sql
SELECT * FROM users WHERE email = 'email@exemplo.com';
```

2. **Use INSERT com verificação:**
```sql
INSERT INTO users (name, email, password_hash, phone, cpf, pix_key, pix_type)
SELECT 'Nome', 'email@exemplo.com', '$2b$...', '+55...', '123.456.789-00', 'pix', 'email'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'email@exemplo.com'
);
```

---

### 🔑 Erros de Conexão

#### ❌ Erro: `could not connect to server`

**Causa:** PostgreSQL não está rodando ou configuração incorreta.

**Soluções:**

1. **Verificar se PostgreSQL está rodando:**
```bash
# Linux
sudo systemctl status postgresql

# macOS (Homebrew)
brew services list

# Iniciar se necessário
sudo systemctl start postgresql  # Linux
brew services start postgresql@14  # macOS
```

2. **Verificar configurações de conexão:**
```bash
# Testar conexão
psql -U postgres -h localhost -d sinucabet

# Se falhar, verificar pg_hba.conf
# Localização comum:
# Linux: /etc/postgresql/14/main/pg_hba.conf
# macOS: /usr/local/var/postgres/pg_hba.conf
```

3. **Adicionar regra de acesso local:**
```
# Adicionar ao pg_hba.conf
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

---

#### ❌ Erro: `password authentication failed`

**Causa:** Senha incorreta ou método de autenticação.

**Soluções:**

1. **Resetar senha do usuário:**
```sql
-- Como superusuário
ALTER USER sinucabet_app WITH PASSWORD 'nova_senha_segura';
```

2. **Verificar método de autenticação no pg_hba.conf:**
```
# Trocar de md5 para trust temporariamente (apenas dev)
local   all             all                                     trust
```

3. **Atualizar .env com a senha correta:**
```env
DATABASE_URL=postgresql://sinucabet_app:senha_correta@localhost:5432/sinucabet
```

---

### 📊 Problemas com Queries

#### ❌ Query muito lenta

**Causas e Soluções:**

1. **Falta de índices:**
```sql
-- Verificar se os índices existem
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Se faltarem, reexecutar o schema
\i database-schema.sql
```

2. **Estatísticas desatualizadas:**
```sql
-- Atualizar estatísticas
ANALYZE users;
ANALYZE bets;
ANALYZE games;
ANALYZE transactions;
ANALYZE wallet;
```

3. **Falta de dados para otimização:**
```sql
-- Popular com dados de teste
\i database-seed.sql
```

---

#### ❌ Resultado vazio quando esperava dados

**Causas e Soluções:**

1. **Banco vazio:**
```sql
-- Verificar se há dados
SELECT 
    'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'games', COUNT(*) FROM games
UNION ALL
SELECT 'bets', COUNT(*) FROM bets;

-- Se retornar 0, popular o banco
\i database-seed.sql
```

2. **Filtro muito restritivo:**
```sql
-- Verificar dados disponíveis primeiro
SELECT status, COUNT(*) 
FROM games 
GROUP BY status;

-- Então ajustar o WHERE
SELECT * FROM games WHERE status = 'open';
```

---

### 🔐 Problemas de Segurança

#### ❌ Erro: `insufficient privilege`

**Causa:** Usuário sem permissões necessárias.

**Solução:**
```sql
-- Como superusuário
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sinucabet_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sinucabet_app;

-- Para novas tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sinucabet_app;
```

---

### 💾 Problemas de Dados

#### ❌ Saldos inconsistentes

**Verificar consistência:**
```sql
-- Verificar se saldo bloqueado bate com apostas ativas
SELECT 
    u.name,
    w.blocked_balance as saldo_bloqueado,
    COALESCE(SUM(b.amount), 0) as soma_apostas_ativas,
    w.blocked_balance - COALESCE(SUM(b.amount), 0) as diferenca
FROM users u
JOIN wallet w ON u.id = w.user_id
LEFT JOIN bets b ON u.id = b.user_id 
    AND b.status IN ('pending', 'matched')
GROUP BY u.id, u.name, w.blocked_balance
HAVING w.blocked_balance != COALESCE(SUM(b.amount), 0);
```

**Corrigir manualmente (se necessário):**
```sql
-- Recalcular saldo bloqueado
UPDATE wallet w
SET blocked_balance = (
    SELECT COALESCE(SUM(amount), 0)
    FROM bets
    WHERE user_id = w.user_id
        AND status IN ('pending', 'matched')
)
WHERE w.user_id = 'uuid-do-usuario-com-problema';
```

---

### 🧪 Ambiente de Desenvolvimento

#### ❌ Erro: Dados de teste poluindo o ambiente

**Solução - Limpar e recriar:**
```bash
# Dropar e recriar database
dropdb sinucabet
createdb sinucabet

# Recriar schema
psql -d sinucabet -f database-schema.sql

# (Opcional) Popular novamente
psql -d sinucabet -f database-seed.sql
```

---

#### ❌ Querendo testar sem modificar dados

**Solução - Usar transações:**
```sql
-- Iniciar transação
BEGIN;

-- Executar seus testes
INSERT INTO users (...) VALUES (...);
UPDATE wallet SET balance = balance + 100 WHERE user_id = ...;

-- Ver resultado
SELECT * FROM wallet WHERE user_id = ...;

-- Desfazer tudo
ROLLBACK;

-- Ou confirmar se estiver correto
-- COMMIT;
```

---

### 📱 Ferramentas Recomendadas

#### Clientes SQL

1. **pgAdmin** (GUI completo)
   - Download: https://www.pgadmin.org/

2. **DBeaver** (Multi-database)
   - Download: https://dbeaver.io/

3. **psql** (CLI oficial)
   - Vem com PostgreSQL

4. **TablePlus** (macOS/Windows - Pago)
   - Download: https://tableplus.com/

---

### 🆘 Comandos Úteis psql

```bash
# Conectar ao database
psql -U postgres -d sinucabet

# Listar databases
\l

# Listar tabelas
\dt

# Descrever tabela
\d users

# Ver schema de uma tabela
\d+ users

# Listar funções
\df

# Listar views
\dv

# Executar arquivo SQL
\i database-schema.sql

# Sair
\q

# Ativar timing de queries
\timing on

# Modo expandido (melhor para muitas colunas)
\x auto
```

---

### 📋 Checklist de Verificação Rápida

Quando algo não funcionar, verifique na ordem:

- [ ] PostgreSQL está rodando?
- [ ] Database `sinucabet` existe?
- [ ] Schema foi criado (database-schema.sql)?
- [ ] Extensão uuid-ossp está instalada?
- [ ] Usuário tem permissões adequadas?
- [ ] Dados de seed foram inseridos (se necessário)?
- [ ] Está executando apenas UMA query por vez?
- [ ] Query está completa (com ponto e vírgula)?
- [ ] Não há erros de sintaxe visíveis?

---

### 📞 Logs e Debug

#### Ver logs do PostgreSQL

```bash
# Linux (Ubuntu/Debian)
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# macOS (Homebrew)
tail -f /usr/local/var/log/postgresql@14.log

# Ou dentro do psql
SHOW log_directory;
SHOW log_filename;
```

#### Habilitar log de queries lentas

```bash
# Editar postgresql.conf
log_min_duration_statement = 1000  # Log queries > 1 segundo
log_statement = 'all'               # Log todas as queries (cuidado em prod!)

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

---

### 🚀 Performance Tips

1. **SEMPRE execute ANALYZE após INSERT em massa:**
```sql
ANALYZE users;
ANALYZE bets;
```

2. **Use EXPLAIN para entender queries lentas:**
```sql
EXPLAIN ANALYZE
SELECT * FROM bets WHERE game_id = '...';
```

3. **Monitore tamanho das tabelas:**
```sql
SELECT 
    schemaname || '.' || tablename as tabela,
    pg_size_pretty(pg_total_relation_size((schemaname || '.' || tablename)::regclass)) as tamanho
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size((schemaname || '.' || tablename)::regclass) DESC;
```

---

## 📚 Recursos Adicionais

- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [PostgreSQL Common Errors](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- [PostgreSQL Wiki](https://wiki.postgresql.org/)

---

**Não encontrou sua solução?** Verifique os logs detalhados do PostgreSQL e a documentação em `README-DATABASE.md`.

