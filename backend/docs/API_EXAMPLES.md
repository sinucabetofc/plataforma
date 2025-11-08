# 📚 Exemplos de Uso da API - SinucaBet

Este documento contém exemplos práticos de como usar os endpoints de autenticação da API SinucaBet.

---

## 🔧 Ferramentas Recomendadas

- **Postman**: Interface gráfica para testar APIs
- **Insomnia**: Alternativa ao Postman
- **cURL**: Linha de comando
- **HTTPie**: Alternativa moderna ao cURL
- **JavaScript/Fetch**: Para integração frontend

---

## 1. Registro de Usuário

### 📤 cURL

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@example.com",
    "password": "MinhaSenh@123",
    "phone": "+5521987654321",
    "cpf": "987.654.321-00",
    "pix_key": "maria@example.com",
    "pix_type": "email"
  }'
```

### 📤 JavaScript (Fetch API)

```javascript
const registerUser = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Maria Santos',
        email: 'maria@example.com',
        password: 'MinhaSenh@123',
        phone: '+5521987654321',
        cpf: '987.654.321-00',
        pix_key: 'maria@example.com',
        pix_type: 'email'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Usuário registrado com sucesso!');
      console.log('Token:', data.data.token);
      console.log('User ID:', data.data.user_id);
      
      // Salvar token no localStorage
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('userId', data.data.user_id);
    } else {
      console.error('Erro:', data.message);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
};

registerUser();
```

### 📤 Axios (React/Node.js)

```javascript
import axios from 'axios';

const registerUser = async (userData) => {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/register', {
      name: 'Maria Santos',
      email: 'maria@example.com',
      password: 'MinhaSenh@123',
      phone: '+5521987654321',
      cpf: '987.654.321-00',
      pix_key: 'maria@example.com',
      pix_type: 'email'
    });

    const { data } = response;
    console.log('Sucesso:', data.data);
    
    // Retornar dados para uso
    return {
      token: data.data.token,
      user: data.data.user,
      wallet: data.data.wallet
    };
  } catch (error) {
    if (error.response) {
      // Erro de resposta do servidor
      console.error('Erro:', error.response.data.message);
      throw new Error(error.response.data.message);
    } else {
      // Erro de rede ou outro
      console.error('Erro na requisição:', error.message);
      throw error;
    }
  }
};
```

### 📥 Resposta de Sucesso

```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "phone": "+5521987654321",
      "cpf": "987.654.321-00",
      "pix_key": "maria@example.com",
      "pix_type": "email",
      "email_verified": false,
      "created_at": "2024-11-04T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiZW1haWwiOiJtYXJpYUBleGFtcGxlLmNvbSIsImlhdCI6MTY5OTA5NjYwMCwiZXhwIjoxNjk5MTgzMDAwLCJpc3MiOiJzaW51Y2FiZXQtYXBpIiwiYXVkIjoic2ludWNhYmV0LXVzZXJzIn0.abc123def456",
    "wallet": {
      "balance": 0,
      "blocked_balance": 0
    }
  }
}
```

### 📥 Resposta de Erro (Email Já Cadastrado)

```json
{
  "success": false,
  "message": "Email já cadastrado"
}
```

### 📥 Resposta de Erro (Validação)

```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": [
    {
      "field": "password",
      "message": "Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número"
    }
  ]
}
```

---

## 2. Login de Usuário

### 📤 cURL

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "MinhaSenh@123"
  }'
```

### 📤 JavaScript (Fetch API)

```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Login realizado com sucesso!');
      console.log('Token:', data.data.token);
      
      // Salvar token e dados do usuário
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('wallet', JSON.stringify(data.data.wallet));
      
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

// Uso
loginUser('maria@example.com', 'MinhaSenh@123')
  .then(data => console.log('Logado:', data))
  .catch(error => console.error('Falha:', error));
```

### 📤 Axios com Interceptors

```javascript
import axios from 'axios';

// Configurar instância do Axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Função de login
const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { data } = response.data;
    
    // Salvar dados
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao fazer login');
  }
};

export { api, login };
```

### 📥 Resposta de Sucesso

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Maria Santos",
      "email": "maria@example.com",
      "phone": "+5521987654321",
      "cpf": "987.654.321-00",
      "pix_key": "maria@example.com",
      "pix_type": "email",
      "email_verified": false,
      "created_at": "2024-11-04T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "wallet": {
      "balance": 250.00,
      "blocked_balance": 100.00,
      "total_deposited": 500.00,
      "total_withdrawn": 150.00
    }
  }
}
```

### 📥 Resposta de Erro (Credenciais Inválidas)

```json
{
  "success": false,
  "message": "Email ou senha inválidos"
}
```

---

## 3. Usando Token JWT em Requisições Futuras

### 📤 cURL com Token

```bash
curl -X GET http://localhost:3001/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 📤 JavaScript (Fetch)

```javascript
const getProtectedData = async () => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch('http://localhost:3001/api/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
};
```

---

## 4. React Hook Customizado para Autenticação

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Carregar dados do localStorage ao iniciar
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/register`, userData);
      const { data } = response.data;

      // Salvar no estado e localStorage
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao registrar';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { data } = response.data;

      // Salvar no estado e localStorage
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('wallet');
  };

  const isAuthenticated = !!token;

  return {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated
  };
};

// Uso no componente:
// const { user, login, register, logout, isAuthenticated } = useAuth();
```

---

## 5. Validação de CPF no Frontend

```javascript
/**
 * Valida CPF brasileiro
 * @param {string} cpf - CPF no formato XXX.XXX.XXX-XX
 * @returns {boolean}
 */
function validateCPF(cpf) {
  // Remove formatação
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Formata CPF
 * @param {string} value - CPF sem formatação
 * @returns {string} CPF formatado
 */
function formatCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}
```

---

## 6. Tratamento de Erros Recomendado

```javascript
const handleAPIError = (error) => {
  if (error.response) {
    // Erro com resposta do servidor
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return `Erro de validação: ${data.message}`;
      case 401:
        return 'Credenciais inválidas';
      case 403:
        return 'Acesso negado';
      case 409:
        return data.message || 'Recurso já existe';
      case 429:
        return 'Muitas requisições. Aguarde um momento.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      default:
        return data.message || 'Erro desconhecido';
    }
  } else if (error.request) {
    // Requisição foi feita mas não houve resposta
    return 'Sem resposta do servidor. Verifique sua conexão.';
  } else {
    // Erro ao configurar a requisição
    return 'Erro ao fazer requisição: ' + error.message;
  }
};

// Uso
try {
  await login(email, password);
} catch (error) {
  const errorMessage = handleAPIError(error);
  alert(errorMessage);
}
```

---

## 📝 Notas Importantes

1. **Segurança do Token**: Nunca exponha o token JWT em logs ou console em produção
2. **HTTPS**: Use sempre HTTPS em produção para proteger as credenciais
3. **Armazenamento**: Considere usar `httpOnly cookies` em vez de localStorage para maior segurança
4. **Expiração**: Implemente refresh tokens para melhor experiência do usuário
5. **Validação**: Sempre valide dados no frontend E no backend

---

**🎱 SinucaBet - Documentação da API**










