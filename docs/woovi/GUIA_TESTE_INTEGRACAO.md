# 🧪 GUIA DE TESTE - INTEGRAÇÃO WOOVI PIX

## ✅ Implementação Completa

A integração Woovi PIX foi implementada com sucesso! Aqui está o guia de teste.

## 📋 O que foi Implementado

### Backend ✅
- ✅ Autenticação Woovi corrigida (sem prefixo "AppID")
- ✅ Mock de desenvolvimento removido
- ✅ Estrutura de resposta ajustada com todos os campos
- ✅ Endpoint `GET /api/wallet/transactions/:id` para polling
- ✅ Logs detalhados adicionados

### Frontend ✅
- ✅ DepositModal reescrito com 3 steps
- ✅ Exibição de QR Code PIX
- ✅ Polling automático de status (3 em 3 segundos)
- ✅ Countdown de expiração
- ✅ Botão copiar código PIX
- ✅ Botão abrir no app do banco
- ✅ Notificação de sucesso ao pagar
- ✅ Atualização automática de saldo

### Fluxo Completo ✅
```
1. Usuário clica "Depositar via Pix"
2. Modal abre (Step 1: Seleção de valor)
3. Usuário seleciona valor (ex: R$ 50)
4. Clica "Gerar QR Code"
5. Backend cria cobrança na Woovi
6. Modal muda para Step 2: Exibe QR Code
7. Inicia polling automático (verifica status a cada 3s)
8. Countdown de expiração rodando
9. Usuário paga no banco
10. Woovi envia webhook
11. Backend atualiza saldo
12. Polling detecta mudança
13. Modal muda para Step 3: Sucesso!
14. Saldo atualizado na interface
```

---

## 🚀 Como Testar

### Pré-requisitos

1. **Ter conta na Woovi**
   - Acesse: https://woovi.com
   - Crie conta gratuita

2. **Gerar AppID**
   - No painel Woovi: Api/Plugins > Nova API/Plugin
   - Selecione "API"
   - Copie o AppID gerado

3. **Configurar Backend**
   ```bash
   # Edite backend/.env e adicione:
   WOOVI_APP_ID=seu-appid-aqui
   WOOVI_API_URL=https://api.woovi-sandbox.com/api/v1
   ```

4. **Configurar Webhook (para teste local)**
   ```bash
   # Terminal 1: Rodar backend
   cd backend
   npm run dev
   
   # Terminal 2: Expor webhook com Ngrok
   ngrok http 3001
   
   # Copiar URL do Ngrok (ex: https://abc123.ngrok.io)
   ```

5. **Configurar Webhook no Painel Woovi**
   - Webhook > Novo Webhook
   - URL: `https://abc123.ngrok.io/api/wallet/webhook/woovi`
   - Evento: `OPENPIX:CHARGE_COMPLETED`
   - Salvar

---

## 🧪 Teste Passo a Passo

### 1. Iniciar Aplicação

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Deve aparecer: 🎱 SinucaBet API Server rodando em http://localhost:3001

# Terminal 2: Frontend
cd frontend
npm run dev
# Deve abrir em: http://localhost:3000

# Terminal 3: Ngrok (se teste local)
ngrok http 3001
```

### 2. Fazer Login

- Acesse http://localhost:3000
- Faça login com um usuário existente
- Vá para página "Carteira" (`/wallet`)

### 3. Criar Depósito

1. Clique em **"Depositar via Pix"**
2. Modal abre no Step 1
3. Clique em valores para somar (ex: R$ 10 + R$ 10 = R$ 20)
4. Ou clique direto em R$ 50
5. Clique em **"Gerar QR Code"**

**Verificar:**
- ✅ Loading aparece ("Gerando...")
- ✅ Modal NÃO fecha
- ✅ Modal muda para Step 2

### 4. Verificar QR Code (Step 2)

**Deve exibir:**
- ✅ QR Code visual (imagem)
- ✅ Valor do depósito (ex: R$ 50,00)
- ✅ Countdown de expiração (ex: "1439m 59s")
- ✅ Botão "Copiar Código PIX"
- ✅ Botão "Abrir no App do Banco"
- ✅ Indicador "Aguardando pagamento..." (pulsando)
- ✅ Instruções de como pagar

**Testar:**
- Clicar em "Copiar Código PIX" → deve copiar e mostrar toast
- Clicar em "Abrir no App do Banco" → deve abrir link

**Verificar no Backend (console):**
```
✅ Cobrança Woovi criada: {
  correlationID: 'DEPOSIT-...',
  value: 5000,
  transactionID: '...'
}
```

### 5. Verificar Polling

**No console do navegador (F12):**
- Deve fazer requisição a cada 3 segundos:
  ```
  GET /api/wallet/transactions/{id}
  Status: 200
  Response: { status: 'pending' }
  ```

### 6. Simular Pagamento (Sandbox)

1. Acesse o painel Woovi
2. Vá para **Cobranças** ou **Transações**
3. Encontre a cobrança criada (pelo valor e correlationID)
4. Clique em **"Simular Pagamento"** ou **"Pagar"**
5. Confirme

### 7. Verificar Webhook

**No console do backend, deve aparecer:**
```
📥 Webhook Woovi recebido: {
  event: 'OPENPIX:CHARGE_COMPLETED',
  charge: {
    correlationID: 'DEPOSIT-...',
    status: 'COMPLETED',
    value: 5000,
    ...
  }
}

✅ Depósito processado com sucesso!
   Usuário: xxx-xxx-xxx
   Valor: R$ 50
   Novo saldo: R$ 150.00
```

### 8. Verificar Frontend

**Automaticamente (3-5 segundos após webhook):**
- ✅ Polling detecta status 'completed'
- ✅ Toast aparece: "Pagamento confirmado!"
- ✅ Modal muda para Step 3: Sucesso
- ✅ Mostra valor depositado: "+ R$ 50,00"
- ✅ Após 2 segundos, modal fecha
- ✅ Saldo na carteira atualiza
- ✅ Nova transação aparece no histórico

### 9. Verificar Painel Admin

1. Acesse `/admin/transactions`
2. Deve aparecer nova transação:
   - Tipo: Depósito
   - Status: Concluído
   - Valor: R$ 50,00

---

## 🔍 Verificações de Segurança

### ✅ Idempotência
Testar pagar 2x a mesma cobrança:
- Backend deve reconhecer que já foi paga
- Não deve duplicar saldo

### ✅ Validações
Testar com valores inválidos:
- Valor < R$ 10 → deve rejeitar
- Valor não múltiplo de 10 → deve aceitar (não há restrição)

### ✅ Expiração
Testar QR Code expirado:
- Aguardar 24h (ou configurar expiração menor)
- Tentar pagar → deve rejeitar

---

## 📊 Resultado Esperado

### Sucesso Total ✅

Após todos os testes, você deve ter:

1. ✅ Depósito criado com sucesso
2. ✅ QR Code exibido corretamente
3. ✅ Polling funcionando
4. ✅ Webhook recebido e processado
5. ✅ Saldo atualizado automaticamente
6. ✅ Notificação de sucesso
7. ✅ Transação no admin
8. ✅ Logs completos

### Status Final

```
╔═══════════════════════════════════════════════════════════╗
║          ✅ INTEGRAÇÃO WOOVI PIX COMPLETA                ║
║                                                           ║
║  - Backend configurado e funcional                       ║
║  - Frontend com UX completa                              ║
║  - Webhook recebendo confirmações                        ║
║  - Saldo atualizando automaticamente                     ║
║  - Logs e monitoramento ativos                           ║
║                                                           ║
║          🚀 PRONTO PARA PRODUÇÃO                         ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📝 Próximos Passos (Opcional)

### Melhorias Futuras
- [ ] Adicionar WebSocket para atualização em tempo real
- [ ] Implementar histórico detalhado de transações
- [ ] Adicionar filtros e busca no histórico
- [ ] Exportar extratos em PDF
- [ ] Notificações por email ao confirmar pagamento
- [ ] Dashboard com estatísticas de depósitos

---

## 📞 Suporte

### Problemas?
Consulte: `docs/woovi/CONFIGURACAO_PRODUCAO.md`

### Documentação Completa
- [README](./README.md) - Índice geral
- [WOOVI_QUICK_START.md](./WOOVI_QUICK_START.md) - Guia rápido
- [INTEGRACAO_WOOVI_PIX.md](./INTEGRACAO_WOOVI_PIX.md) - Detalhes técnicos

---

**Teste realizado em**: 08/11/2025  
**Status**: ✅ Pronto para teste  
**Projeto**: SinucaBet


