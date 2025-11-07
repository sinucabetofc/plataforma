# 🔍 Diagnóstico - Erro no Cadastro

**Data:** 06/11/2025  
**Problema:** "Database error checking email" ao tentar cadastrar usuário

## 🚨 Erros Identificados

### 1. Erro de Imagem (Placeholder)
```
GET https://via.placeholder.com/150 net::ERR_NAME_NOT_RESOLVED
```
- **Causa:** Componente usando placeholder externo que não está acessível
- **Impacto:** Baixo (apenas visual)
- **Solução:** Usar imagem local ou fallback

### 2. Erro no Registro (CRÍTICO)
```
POST https://sinucabet-backend.onrender.com/api/auth/register 500 (Internal Server Error)
APIError: Database error checking email
```
- **Causa:** Erro ao verificar se email já existe na tabela `users`
- **Impacto:** Alto (impede novos cadastros)
- **Local:** `backend/services/auth.service.js` linha 22-26

## 🔍 Análise Técnica

### Código com Problema
```javascript
// auth.service.js - linha 22-26
const { data: existingUsers } = await supabase
  .from('users')
  .select('id')
  .eq('email', email)
  .limit(1);
```

### Possíveis Causas

1. **RLS (Row Level Security) bloqueando acesso**
   - O backend usa `service_role_key` que bypassa RLS
   - Mas pode ter alguma política interferindo

2. **Variáveis de ambiente incorretas no Render**
   - `SUPABASE_URL` pode estar errada
   - `SUPABASE_SERVICE_ROLE_KEY` pode estar expirada ou incorreta

3. **Tabela `users` não existe ou mudou**
   - Verificar se a estrutura está correta

4. **Problema de conexão com Supabase**
   - Timeout ou limite de rate limit

## ✅ Soluções Propostas

### Solução 1: Verificar Variáveis de Ambiente (PRIORIDADE)
No Render, verifique se estas variáveis estão corretas:
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (chave de serviço, não anon key)
```

### Solução 2: Melhorar Tratamento de Erro
Adicionar mais logs para identificar o erro exato:

```javascript
// Melhorar o código em auth.service.js
try {
  console.log('🔍 Verificando email:', email);
  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .limit(1);

  if (checkError) {
    console.error('❌ Erro ao verificar email:', checkError);
    throw {
      code: 'DATABASE_ERROR',
      message: 'Erro ao verificar email',
      details: checkError
    };
  }

  // resto do código...
}
```

### Solução 3: Usar try-catch no nível da query
Adicionar tratamento específico para o erro de verificação de email.

### Solução 4: Remover verificação dupla
O Supabase Auth já verifica se o email existe. Podemos remover essa verificação manual e deixar o Supabase Auth lidar com isso.

## 🚀 Ação Imediata

1. **Acessar Render Dashboard**
   - https://dashboard.render.com
   - Verificar variáveis de ambiente do backend

2. **Verificar Logs no Render**
   - Ver o erro completo no servidor

3. **Testar conexão Supabase**
   - Verificar se o projeto Supabase está ativo
   - Confirmar se as chaves não expiraram

## 📝 Próximos Passos

Após identificar a causa raiz:
1. Corrigir configuração no Render
2. Adicionar melhor tratamento de erro
3. Testar cadastro novamente
4. Documentar solução

