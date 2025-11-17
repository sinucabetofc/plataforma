# ✅ TESTE FINAL - Após Deploy Completo

## 🎯 Após Push e Deploy

Quando o deploy terminar no Render (~2-3 minutos), siga este guia.

---

## 1️⃣ Verificar Deploy no Render

### Dashboard Render
1. Acesse: https://dashboard.render.com
2. Entre em: `sinucabet-backend`
3. Vá para: **Events**
4. Aguarde aparecer:
   ```
   ✅ Deploy live for cfa3d6c7: feat: Backend Woovi PIX - Correções críticas
   ```

### Verificar Logs
1. Vá para: **Logs**
2. Deve mostrar:
   ```
   ╔════════════════════════════════════════════════════════════╗
   ║           🎱 SinucaBet API Server                          ║
   ║   Servidor rodando em: http://localhost:3001               ║
   ║   Ambiente: production                                     ║
   ╚════════════════════════════════════════════════════════════╝
   ```

---

## 2️⃣ Testar Webhook (DEVE FUNCIONAR AGORA)

### No Painel Woovi
1. Vá para: **Webhook**
2. Encontre o webhook "SINUCABET"
3. Clique em: **"Testar Webhook"**
4. Deve retornar: ✅ **200 OK**

### Nos Logs do Render
Você verá:
```
📥 Webhook Woovi recebido: {
  "data_criacao": "2025-11-08T04:XX:XX.XXXZ",
  "evento": "teste_webhook",
  "event": "OPENPIX:CHARGE_COMPLETED"
}
✅ Webhook de teste recebido com sucesso!
```

✅ **Se aparecer isso, o webhook está FUNCIONANDO!**

---

## 3️⃣ Testar Depósito Completo

### No Frontend
1. Acesse: https://sinuca-bet.vercel.app/wallet
2. Faça login se necessário
3. Clique em: **"Depositar via Pix"**

### Step 1: Seleção de Valor
- Modal abre
- Clique em valores (ex: R$ 10 + R$ 10 + R$ 30 = R$ 50)
- Clique: **"Gerar QR Code"**

### Step 2: QR Code
**Deve aparecer:**
- ✅ QR Code visual
- ✅ Valor: R$ 50,00
- ✅ Countdown: "1439m 59s" (ou similar)
- ✅ Botão "Copiar Código PIX"
- ✅ Botão "Abrir no App do Banco"
- ✅ Indicador pulsante "Aguardando pagamento..."

**Teste:**
- Clique "Copiar Código" → deve mostrar toast ✅
- Countdown deve diminuir em tempo real ✅

### Nos Logs do Render
Você verá:
```
✅ Cobrança Woovi criada: {
  correlationID: 'DEPOSIT-xxx-xxx-xxx',
  value: 5000,
  transactionID: 'xxx...'
}
```

---

## 4️⃣ Simular Pagamento

### No Painel Woovi
1. Vá para: **Cobranças** ou **Transações**
2. Encontre a cobrança que acabou de criar
   - Valor: R$ 50,00
   - Status: ACTIVE (aguardando)
3. Clique em: **"Simular Pagamento"** ou **"Pagar"**
4. Confirme

---

## 5️⃣ Verificar Confirmação Automática

### No Frontend (3-10 segundos após simular)

**Deve acontecer automaticamente:**
1. ✅ Modal muda para **Step 3: Sucesso!**
2. ✅ Mostra: "Pagamento Confirmado!"
3. ✅ Mostra: "+ R$ 50,00" em verde
4. ✅ Toast aparece: "Pagamento confirmado!"
5. ✅ Modal fecha automaticamente após 2s
6. ✅ **Saldo na carteira atualiza** (ex: R$ 100 → R$ 150)
7. ✅ Nova transação aparece no histórico

### Nos Logs do Render

**Webhook recebido:**
```
📥 Webhook Woovi recebido: {
  "event": "OPENPIX:CHARGE_COMPLETED",
  "charge": {
    "correlationID": "DEPOSIT-xxx-xxx-xxx",
    "status": "COMPLETED",
    "value": 5000,
    ...
  }
}

✅ Depósito confirmado: {
  transaction_id: 'xxx',
  user_id: 'xxx',
  amount: 50,
  new_balance: 15000,
  status: 'completed'
}
```

---

## 6️⃣ Verificar Painel Admin

1. Acesse: `/admin/transactions`
2. Deve aparecer:
   - **Tipo:** Depósito
   - **Status:** Concluído ✅
   - **Valor:** R$ 50,00
   - **Data:** Hoje às XX:XX

---

## ✅ Checklist de Validação

### Webhook
- [ ] Teste do webhook retorna 200 OK
- [ ] Logs mostram "Webhook de teste recebido"

### Depósito
- [ ] QR Code exibido corretamente
- [ ] Countdown rodando
- [ ] Polling funcionando (console F12)
- [ ] Botão copiar funciona

### Pagamento
- [ ] Simular pagamento no painel Woovi
- [ ] Webhook recebido (logs)
- [ ] Saldo atualizado (3-10s)
- [ ] Modal muda para sucesso
- [ ] Toast de confirmação

### Admin
- [ ] Transação aparece no painel
- [ ] Status: Concluído
- [ ] Valor correto

---

## 🎉 Sucesso Total!

Se tudo passou, parabéns! 🎊

Você agora tem:
- ✅ Integração PIX Woovi 100% funcional
- ✅ QR Code com UX moderna
- ✅ Confirmação automática
- ✅ Saldo em tempo real
- ✅ Documentação completa

---

## 🐛 Se Algo Falhar

### Webhook ainda retorna 400?
➡️ Aguarde 2-3 min do deploy no Render
➡️ Verifique logs do Render para confirmar novo deploy

### QR Code não aparece?
➡️ Verifique console do navegador (F12)
➡️ Veja se tem erro na requisição
➡️ Confirme que `WOOVI_APP_ID` está no `.env` do Render

### Saldo não atualiza?
➡️ Verifique logs do webhook no Render
➡️ Confirme que correlationID foi encontrado
➡️ Veja se transaction mudou para 'completed'

---

**Criado em**: 08/11/2025  
**Última atualização**: Aguardando deploy  
**Status**: ⏳ Aguardando push concluir



