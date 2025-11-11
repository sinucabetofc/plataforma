# 🚨 SOLUÇÃO RÁPIDA: Erro 405 no Webhook

## ❌ Problema

Você configurou o webhook com a URL do **FRONTEND** (Vercel):
```
❌ https://sinuca-bet.vercel.app/api/wallet/webhook/woovi
```

Essa URL não existe no frontend, por isso o **erro 405**!

---

## ✅ Solução em 3 Passos

### 1️⃣ Descobrir URL do Backend

O backend está no **Render.com**, não no Vercel!

```bash
# Acesse: https://dashboard.render.com
# Encontre: sinucabet-backend
# Copie a URL (algo como):
# https://sinucabet-backend.onrender.com
```

### 2️⃣ Corrigir URL no Painel Woovi

No painel Woovi:

1. Vá para **Webhook**
2. Edite o webhook "SINUCABET"
3. Altere a URL para:
   ```
   https://sinucabet-backend.onrender.com/api/wallet/webhook/woovi
   ```
   ⚠️ **Importante:** Substitua `sinucabet-backend` pelo nome real do seu serviço no Render
4. Salve
5. Clique em **"Testar Webhook"**
6. Deve retornar: ✅ **200 OK**

### 3️⃣ Verificar Logs

No Render.com, vá para os logs do backend e verifique:

```
📥 Webhook Woovi recebido: { "evento": "teste_webhook", ... }
✅ Webhook de teste recebido com sucesso!
```

---

## 📊 Diferença Entre URLs

| Serviço | URL | Função |
|---------|-----|--------|
| **Frontend (Vercel)** | `sinuca-bet.vercel.app` | Interface React ❌ |
| **Backend (Render)** | `sinucabet-backend.onrender.com` | API REST ✅ |

**O webhook SEMPRE usa o BACKEND!**

---

## ✅ Após Corrigir

1. Webhook testado com sucesso (200 OK)
2. Criar depósito no frontend
3. QR Code exibido
4. Simular pagamento no painel Woovi
5. Aguardar 3-10 segundos
6. Saldo atualizado automaticamente! 🎉

---

## 📚 Mais Detalhes

- `docs/woovi/ERRO_405_SOLUCAO.md` - Explicação completa
- `docs/woovi/CONFIGURACAO_PRODUCAO.md` - Configuração detalhada

---

**Criado em**: 08/11/2025  
**Solução**: Use URL do backend (Render), não do frontend (Vercel)


