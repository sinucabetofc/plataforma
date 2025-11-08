# ⚙️ CONFIGURAÇÃO DE PRODUÇÃO - WOOVI PIX

## 🔑 Variáveis de Ambiente Necessárias

### Backend (.env)

Adicione as seguintes variáveis no arquivo `backend/.env`:

```bash
# =====================================
# WOOVI PIX API
# =====================================
# AppID gerado no painel Woovi (https://woovi.com)
WOOVI_APP_ID=Q2xpZW50X0lkX2ExZmEwZjg1LTAxY2QtNDkyNi1hZDc2LWI5MjdmODI4YzU5MzpDbGllbnRfU2VjcmV0XzdQRlY4Ump4cGgvWWdWbWRTZnhVemU3eFJIY05GK0h6bkExNzIxN1NqYXM9

# URL da API Woovi
# Produção: https://api.woovi.com/api/v1
# Sandbox (Testes): https://api.woovi-sandbox.com/api/v1
WOOVI_API_URL=https://api.woovi.com/api/v1
```

### Como Obter o AppID

1. Acesse https://woovi.com e faça login
2. Vá para **Api/Plugins** no menu lateral
3. Clique em **Nova API/Plugin**
4. Selecione **API** (para backend)
5. Dê um nome (ex: "SinucaBet Production")
6. Salve e copie o **AppID** gerado
7. Cole no arquivo `.env` do backend

### Configurar Webhook

**⚠️ ATENÇÃO:** O webhook deve apontar para o **BACKEND**, não para o frontend!

#### Backend no Render.com (Produção)

1. Acesse https://dashboard.render.com
2. Encontre o serviço `sinucabet-backend`
3. Copie a URL (ex: `https://sinucabet-backend.onrender.com`)
4. A URL do webhook será:
   ```
   https://sinucabet-backend.onrender.com/api/wallet/webhook/woovi
   ```

#### Configurar no Painel Woovi

1. No painel Woovi, vá para **Webhook**
2. Clique em **Novo Webhook** (ou edite o existente)
3. Insira a URL do **BACKEND**:
   ```
   https://sinucabet-backend.onrender.com/api/wallet/webhook/woovi
   ```
4. Selecione o evento: **OPENPIX:CHARGE_COMPLETED**
5. Salve
6. Clique em **"Testar Webhook"**
7. Deve retornar: ✅ **200 OK**

⚠️ **IMPORTANTE:** 
- Use a URL do **BACKEND** (Render), não do frontend (Vercel)
- O webhook deve ser uma URL pública HTTPS
- O backend deve estar rodando

## 🧪 Ambiente de Teste

### Para Testes Locais (com Ngrok)

```bash
# 1. Iniciar backend
cd backend
npm run dev

# 2. Em outro terminal, expor webhook
ngrok http 3001

# 3. Copiar URL do Ngrok (ex: https://abc123.ngrok.io)

# 4. No .env, usar sandbox:
WOOVI_API_URL=https://api.woovi-sandbox.com/api/v1

# 5. Configurar webhook no painel Woovi:
# https://abc123.ngrok.io/api/wallet/webhook/woovi
```

### Simular Pagamento

No ambiente sandbox, você pode simular um pagamento no painel Woovi sem precisar pagar de verdade.

## ✅ Checklist de Configuração

### Backend
- [ ] Variável `WOOVI_APP_ID` adicionada no `.env`
- [ ] Variável `WOOVI_API_URL` configurada
- [ ] AppID testado (fazer requisição de teste)
- [ ] Webhook configurado no painel Woovi
- [ ] Webhook testado (ver logs do backend)

### Teste Completo
- [ ] Criar depósito no frontend
- [ ] QR Code exibido corretamente
- [ ] Simular pagamento no painel Woovi
- [ ] Webhook recebido (ver logs)
- [ ] Saldo atualizado automaticamente
- [ ] Transação aparece no painel admin

## 🐛 Troubleshooting

### Erro: "WOOVI_APP_ID não configurado"
➡️ Adicione a variável no arquivo `backend/.env`

### Erro: "AppID inválido"
➡️ Verifique se o AppID está correto (sem espaços extras)

### Webhook não chega
➡️ Verifique:
- URL do webhook está pública (HTTPS)
- Evento selecionado é `OPENPIX:CHARGE_COMPLETED`
- Backend está rodando
- Firewall não está bloqueando

### QR Code não aparece
➡️ Verifique:
- Response da API nos logs do backend
- Credenciais Woovi corretas
- Internet disponível

---

**Documento criado em**: 08/11/2025  
**Status**: ✅ Pronto para uso

