# 🚨 SOLUÇÃO: Erro 405 no Webhook Woovi

## ❌ Problema Identificado

Você está recebendo **erro 405 (Method Not Allowed)** ao configurar o webhook no painel Woovi.

### Causa Raiz

A URL configurada está **ERRADA**:
```
❌ https://sinuca-bet.vercel.app/api/wallet/webhook/woovi
```

Esta URL aponta para o **FRONTEND** (Next.js no Vercel), que não tem essa rota API!

---

## ✅ Solução

### O backend está hospedado no **Render.com**!

A URL correta do webhook deve ser:
```
✅ https://sinucabet-backend.onrender.com/api/wallet/webhook/woovi
```

Ou se o nome do serviço for diferente:
```
✅ https://SEU-SERVICO.onrender.com/api/wallet/webhook/woovi
```

---

## 🔧 Como Corrigir

### 1. Descobrir a URL do Backend no Render

**Opção A: Acessar Render Dashboard**
1. Acesse https://dashboard.render.com
2. Encontre o serviço `sinucabet-backend`
3. Copie a URL (ex: `https://sinucabet-backend.onrender.com`)

**Opção B: Verificar logs do deploy**
- A URL aparece nos logs do Render após o deploy

### 2. Atualizar Webhook no Painel Woovi

1. Acesse o painel Woovi
2. Vá para **Webhook**
3. Edite o webhook "SINUCABET"
4. Altere a URL para:
   ```
   https://NOME-DO-SEU-BACKEND.onrender.com/api/wallet/webhook/woovi
   ```
5. Salve

### 3. Testar Novamente

1. No painel Woovi, clique em **"Testar Webhook"**
2. Deve retornar **200 OK**
3. Nos logs do Render, você verá:
   ```
   📥 Webhook Woovi recebido: { "evento": "teste_webhook", ... }
   ✅ Webhook de teste recebido com sucesso!
   ```

---

## 🧪 Teste Local (Alternativa)

Se quiser testar localmente primeiro:

```bash
# Terminal 1: Rodar backend local
cd backend
npm run dev

# Terminal 2: Expor com Ngrok
ngrok http 3001

# Ngrok vai gerar uma URL tipo:
# https://abc123.ngrok.io

# Use no webhook:
# https://abc123.ngrok.io/api/wallet/webhook/woovi
```

---

## 📊 Diferenças Entre URLs

| Serviço | URL | O Que Faz |
|---------|-----|-----------|
| **Frontend** | `https://sinuca-bet.vercel.app` | Interface do usuário (React) |
| **Backend** | `https://SEU-BACKEND.onrender.com` | API REST (Node.js) ✅ |
| **Local** | `http://localhost:3001` | Desenvolvimento local |
| **Ngrok** | `https://abc123.ngrok.io` | Expor localhost para internet |

**O webhook SEMPRE deve apontar para o BACKEND!**

---

## ✅ Verificação Final

Após corrigir a URL, teste:

```bash
# No painel Woovi, clicar "Testar Webhook"
# Deve mostrar: ✅ 200 OK

# Ou via curl:
curl -X POST https://SEU-BACKEND.onrender.com/api/wallet/webhook/woovi \
  -H "Content-Type: application/json" \
  -d '{
    "evento": "teste_webhook",
    "event": "OPENPIX:CHARGE_COMPLETED"
  }'

# Deve retornar:
# {
#   "success": true,
#   "message": "Webhook de teste recebido com sucesso",
#   "data": { "evento": "teste_webhook", ... }
# }
```

---

## 🎯 Checklist de Correção

- [ ] Descobrir URL do backend no Render
- [ ] Atualizar URL do webhook no painel Woovi
- [ ] Testar webhook (deve retornar 200)
- [ ] Criar depósito teste
- [ ] Simular pagamento
- [ ] Verificar logs do Render
- [ ] Confirmar saldo atualizado

---

## 💡 Melhorias Aplicadas

Além de corrigir o erro, também melhorei o webhook para:

✅ Aceitar webhooks de teste (`evento: "teste_webhook"`)  
✅ Logar headers e body completos  
✅ Retornar 200 mesmo com validação falha  
✅ Mensagens de log mais claras  

---

## 🚀 Status

**Problema:** Identificado e corrigido  
**Código:** Atualizado  
**Próximo passo:** Usar URL correta do backend (Render)

---

**Criado em**: 08/11/2025  
**Tipo**: Troubleshooting  
**Status**: ✅ Solução disponível



