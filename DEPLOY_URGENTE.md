# 🚀 DEPLOY URGENTE - Atualizar Backend no Render

## ⚠️ PROBLEMA ATUAL

O código foi atualizado localmente, mas o **Render ainda está com a versão antiga**!

Por isso o webhook de teste retorna **400** - a versão no Render não aceita webhooks de teste.

---

## ✅ SOLUÇÃO: Fazer Deploy no Render

### Opção 1: Commit e Push (Auto-Deploy) ⭐ RECOMENDADO

```bash
# 1. Verificar alterações
git status

# 2. Adicionar arquivos modificados
git add backend/services/wallet.service.js
git add backend/controllers/wallet.controller.js
git add backend/routes/wallet.routes.js
git add frontend/components/DepositModal.js
git add frontend/pages/wallet.js
git add docs/woovi/
git add WOOVI_PROXIMOS_PASSOS.md
git add SOLUCAO_ERRO_405.md

# 3. Commit
git commit -m "feat: Integração completa Woovi PIX

- Autenticação Woovi corrigida
- Modal com 3 steps (valor, QR Code, sucesso)
- Polling automático de status
- Webhook aceita testes
- Countdown de expiração
- Logs melhorados"

# 4. Push
git push origin main
```

O Render vai detectar o push e fazer **deploy automático** em ~2-3 minutos.

### Opção 2: Manual Deploy no Dashboard

1. Acesse https://dashboard.render.com
2. Entre no serviço `sinucabet-backend`
3. Clique em **"Manual Deploy"** > **"Deploy latest commit"**
4. Aguarde 2-3 minutos

---

## 🔍 Verificar Deploy

### No Dashboard do Render

1. Vá para **Events**
2. Aguarde aparecer:
   ```
   ✅ Deploy live for [commit]: feat: Integração completa Woovi PIX
   ```

### Verificar Logs

1. Vá para **Logs**
2. Deve aparecer:
   ```
   ╔════════════════════════════════════════════════════════════╗
   ║           🎱 SinucaBet API Server                          ║
   ║   Servidor rodando em: http://localhost:3001               ║
   ╚════════════════════════════════════════════════════════════╝
   ```

---

## ✅ Após o Deploy

### 1. Testar Webhook Novamente

No painel Woovi:
1. Clique em **"Testar Webhook"**
2. Deve retornar: ✅ **200 OK**
3. Mensagem: "Webhook configurado corretamente!"

### 2. Verificar Logs do Render

Nos logs do backend no Render, você verá:
```
📥 Webhook Woovi recebido: { "evento": "teste_webhook", ... }
✅ Webhook de teste recebido com sucesso!
```

### 3. Testar Depósito Real

1. Acesse: https://sinuca-bet.vercel.app/wallet
2. Clique: "Depositar via Pix"
3. Selecione: R$ 50
4. Clique: "Gerar QR Code"
5. Modal muda para Step 2 com QR Code ✅
6. Simule pagamento no painel Woovi
7. Aguarde 3-10 segundos
8. Modal muda para Step 3: Sucesso! ✅
9. Saldo atualizado! ✅

---

## 🎯 Checklist

- [ ] Fazer commit das alterações
- [ ] Push para repositório
- [ ] Aguardar deploy no Render (2-3 min)
- [ ] Verificar logs do deploy
- [ ] Testar webhook no painel Woovi
- [ ] Criar depósito teste
- [ ] Simular pagamento
- [ ] Confirmar saldo atualizado

---

## 📊 Arquivos que Precisam de Deploy

**Backend (3 arquivos):**
- `services/wallet.service.js` ✅ Modificado
- `controllers/wallet.controller.js` ✅ Modificado
- `routes/wallet.routes.js` ✅ Modificado

**Frontend (2 arquivos):**
- `components/DepositModal.js` ✅ Reescrito
- `pages/wallet.js` ✅ Modificado

---

## ⚡ Deploy Rápido

```bash
# Copie e cole no terminal:
cd "/Users/viniciusambrozio/Downloads/MARKETING DIGITAL/PROGRAMAS/SinucaBet"

git add -A

git commit -m "feat: Integração Woovi PIX completa

Backend:
- Autenticação Woovi corrigida
- Webhook aceita testes
- Endpoint de consulta para polling
- Logs melhorados

Frontend:
- Modal 3 steps (valor, QR, sucesso)
- Polling automático (3s)
- Countdown de expiração
- Copy PIX code
- Abrir no app

Docs:
- 12 documentos técnicos completos"

git push origin main

echo "✅ Deploy iniciado! Aguarde 2-3 minutos e teste o webhook."
```

---

## 🎉 Resultado Final

Após o deploy:

✅ Webhook retorna 200 OK  
✅ Depósitos funcionam perfeitamente  
✅ QR Code exibido  
✅ Pagamento detectado automaticamente  
✅ Saldo atualizado em tempo real  

---

**Criado em**: 08/11/2025  
**Urgência**: 🔴 Alta (necessário para webhook funcionar)  
**Ação**: Fazer commit e push para deploy automático



