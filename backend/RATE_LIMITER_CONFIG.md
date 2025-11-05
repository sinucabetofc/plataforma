# 🛡️ Rate Limiter - Configuração

## ⚠️ Problema Atual

Durante os testes, você pode receber:
```
"Muitas tentativas de registro. Tente novamente mais tarde."
```

Isso acontece porque o rate limiter está configurado para **produção**:
- **Registro:** 3 tentativas por hora por IP
- **Login:** 5 tentativas por 15 minutos por IP

## 🔧 Solução 1: Variáveis de Ambiente (Recomendado)

Adicione ao arquivo `.env` do backend:

```env
# Rate Limiter - Desenvolvimento
NODE_ENV=development
RATE_LIMIT_ENABLED=false

# Ou ajuste os limites
REGISTER_LIMIT_MAX=100
REGISTER_LIMIT_WINDOW_MS=3600000
AUTH_LIMIT_MAX=50
AUTH_LIMIT_WINDOW_MS=900000
```

## 🔧 Solução 2: Ajustar Manualmente (Temporário)

Edite `/backend/routes/auth.routes.js`:

```javascript
// Rate limiter para registro (DESENVOLVIMENTO)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: process.env.NODE_ENV === 'development' ? 1000 : 3, // 1000 em dev, 3 em prod
  message: {
    success: false,
    message: 'Muitas tentativas de registro. Tente novamente mais tarde.'
  }
});
```

## 🔧 Solução 3: Reiniciar Backend

O rate limiter está em **memória**, então reiniciar o servidor reseta:

```bash
# Parar backend
pkill -f "node.*server.js"

# Iniciar novamente
cd backend
npm start
```

## 📊 Limites Atuais

| Endpoint | Limite | Janela | Ambiente |
|----------|--------|--------|----------|
| `/auth/register` | 3 | 1 hora | Produção |
| `/auth/register` | 1000 | 1 hora | Desenvolvimento (sugerido) |
| `/auth/login` | 5 | 15 min | Produção |
| `/auth/login` | 50 | 15 min | Desenvolvimento (sugerido) |
| Global | 100 | 15 min | Todos |

## ✅ Status

- ✅ Backend reiniciado
- ✅ Rate limiter resetado
- ✅ Pode testar cadastro novamente

## 🎯 Próximos Passos

1. **Recarregue a página de cadastro:** http://localhost:3000/register
2. **Use estes dados de teste:**

```
ETAPA 1:
Nome: João Silva
Email: joao@teste.com
Senha: SinucaBet123

ETAPA 2:
Telefone: (11) 99999-9999
CPF: Use um CPF válido (https://www.4devs.com.br/gerador_de_cpf)

ETAPA 3:
Tipo: Email
Chave Pix: joao@teste.com
```

3. **Clique em [Finalizar Cadastro]**

## 📝 Nota

O rate limiter é **importante para produção** para prevenir:
- Ataques de força bruta
- Spam de registros
- Abuso de recursos

Mas durante desenvolvimento/testes, pode ser relaxado ou desabilitado.

---

**Backend pronto para novos testes!** 🚀



