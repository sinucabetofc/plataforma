# 💻 EXEMPLOS DE IMPLEMENTAÇÃO FRONTEND - WOOVI PIX

## 📋 Índice

1. [Modal de Depósito](#-modal-de-depósito)
2. [Componente QR Code](#-componente-qr-code)
3. [Polling de Status](#-polling-de-status)
4. [Histórico de Transações](#-histórico-de-transações)
5. [Validações e Feedback](#-validações-e-feedback)

---

## 🎨 Modal de Depósito

### Componente Completo (`components/DepositModal.js`)

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';

const DepositModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Valor, 2: QR Code, 3: Sucesso
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dados do PIX
  const [pixData, setPixData] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  
  // Polling
  const [pollingInterval, setPollingInterval] = useState(null);

  // Limpar ao fechar
  useEffect(() => {
    if (!isOpen) {
      handleReset();
    }
  }, [isOpen]);

  // Countdown de expiração
  useEffect(() => {
    if (expiresAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires - now;

        if (diff <= 0) {
          setTimeLeft('Expirado');
          clearInterval(interval);
          stopPolling();
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [expiresAt]);

  const handleReset = () => {
    setStep(1);
    setAmount('');
    setError(null);
    setPixData(null);
    setTransactionId(null);
    setExpiresAt(null);
    setTimeLeft(null);
    stopPolling();
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setAmount(value);
    setError(null);
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount)) {
      setError('Digite um valor válido');
      return false;
    }

    if (numAmount < 10) {
      setError('Valor mínimo: R$ 10,00');
      return false;
    }

    if (numAmount % 10 !== 0) {
      setError('O valor deve ser múltiplo de 10 (ex: 10, 20, 30...)');
      return false;
    }

    return true;
  };

  const handleCreateDeposit = async () => {
    if (!validateAmount()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/deposit/create',
        { amount: parseFloat(amount) },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPixData(response.data.pix);
        setTransactionId(response.data.transaction.id);
        setExpiresAt(response.data.transaction.expiresAt);
        setStep(2);
        startPolling(response.data.transaction.id);
      }
    } catch (err) {
      console.error('Erro ao criar depósito:', err);
      setError(
        err.response?.data?.error || 'Erro ao criar depósito. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (txId) => {
    // Verificar status a cada 3 segundos
    const interval = setInterval(() => {
      checkPaymentStatus(txId);
    }, 3000);

    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const checkPaymentStatus = async (txId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/transactions/${txId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 'completed') {
        stopPolling();
        setStep(3);
        setTimeout(() => {
          onSuccess && onSuccess();
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
  };

  const handleCopyCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      alert('Código PIX copiado!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Step 1: Informar Valor */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Depositar via PIX</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Valor do Depósito
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">R$</span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Valor mínimo: R$ 10,00 (múltiplos de 10)
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              <strong>✓</strong> Depósito instantâneo<br />
              <strong>✓</strong> Sem taxas<br />
              <strong>✓</strong> Disponível 24/7
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDeposit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Gerando...' : 'Continuar'}
              </button>
            </div>
          </>
        )}

        {/* Step 2: Exibir QR Code */}
        {step === 2 && pixData && (
          <>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">Pague com PIX</h2>
              <p className="text-gray-600">Escaneie o QR Code ou copie o código</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <div className="flex justify-center mb-4">
                {pixData.qrCodeImage ? (
                  <img 
                    src={pixData.qrCodeImage} 
                    alt="QR Code PIX"
                    className="w-64 h-64"
                  />
                ) : (
                  <QRCode value={pixData.qrCode} size={256} />
                )}
              </div>

              <div className="text-center mb-2">
                <p className="text-2xl font-bold text-green-600">
                  R$ {parseFloat(amount).toFixed(2)}
                </p>
              </div>

              {timeLeft && (
                <div className="text-center text-sm text-gray-500">
                  Expira em: <span className="font-semibold">{timeLeft}</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <button
                onClick={handleCopyCode}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm font-medium transition"
              >
                📋 Copiar Código PIX
              </button>
            </div>

            {pixData.paymentLink && (
              <div className="mb-4">
                <a
                  href={pixData.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-center rounded-lg font-medium transition"
                >
                  📱 Abrir no App do Banco
                </a>
              </div>
            )}

            <div className="text-center text-sm text-gray-500 mb-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Aguardando pagamento...
              </div>
            </div>

            <button
              onClick={() => {
                stopPolling();
                onClose();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancelar
            </button>
          </>
        )}

        {/* Step 3: Sucesso */}
        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Pagamento Confirmado!
            </h2>
            <p className="text-gray-600 mb-4">
              Seu saldo foi atualizado com sucesso
            </p>
            <p className="text-3xl font-bold text-green-600">
              + R$ {parseFloat(amount).toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositModal;
```

---

## 🎯 Componente de Botões de Valores Rápidos

### Valores Pré-definidos

```javascript
const QuickAmountButtons = ({ onSelectAmount }) => {
  const amounts = [10, 20, 50, 100, 200, 500];

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {amounts.map((value) => (
        <button
          key={value}
          onClick={() => onSelectAmount(value)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
        >
          R$ {value}
        </button>
      ))}
    </div>
  );
};

// Uso no DepositModal:
<QuickAmountButtons onSelectAmount={(value) => setAmount(value.toString())} />
```

---

## 📊 Página de Histórico de Transações

### Componente Completo

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, deposit, withdrawal

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/transactions?type=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      pending: 'Pendente',
      completed: 'Concluído',
      failed: 'Falhou',
      cancelled: 'Cancelado',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const labels = {
      deposit: 'Depósito',
      withdrawal: 'Saque',
      bet: 'Aposta',
      win: 'Ganho',
      refund: 'Reembolso',
    };
    return labels[type] || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Histórico de Transações</h1>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('deposit')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'deposit'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Depósitos
        </button>
        <button
          onClick={() => setFilter('withdrawal')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'withdrawal'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Saques
        </button>
      </div>

      {/* Lista de Transações */}
      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhuma transação encontrada
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {getTypeLabel(tx.type)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(tx.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${
                    tx.type === 'deposit' || tx.type === 'win' || tx.type === 'refund'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'refund' ? '+' : '-'}
                    R$ {parseFloat(tx.amount).toFixed(2)}
                  </p>
                  {getStatusBadge(tx.status)}
                </div>
              </div>

              {tx.description && (
                <p className="text-sm text-gray-600 mb-2">{tx.description}</p>
              )}

              {tx.woovi_transaction_id && (
                <p className="text-xs text-gray-400">
                  ID: {tx.woovi_transaction_id}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
```

---

## 🔔 Sistema de Notificações

### Toast de Sucesso

```javascript
import React from 'react';
import { toast } from 'react-toastify';

export const showDepositSuccess = (amount) => {
  toast.success(
    <div>
      <strong>Depósito Confirmado!</strong>
      <p>+ R$ {amount.toFixed(2)}</p>
    </div>,
    {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    }
  );
};

export const showDepositPending = () => {
  toast.info('Aguardando confirmação do pagamento...', {
    position: 'top-right',
    autoClose: 3000,
  });
};

export const showDepositError = (message) => {
  toast.error(message || 'Erro ao processar depósito', {
    position: 'top-right',
    autoClose: 5000,
  });
};
```

---

## 🎨 Componente de Saldo Atualizado em Tempo Real

### Hook Customizado

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useBalance = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    // Atualizar a cada 10 segundos
    const interval = setInterval(fetchBalance, 10000);

    return () => clearInterval(interval);
  }, []);

  return { balance, loading, refresh: fetchBalance };
};

// Uso:
const BalanceDisplay = () => {
  const { balance, loading, refresh } = useBalance();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
      <p className="text-sm opacity-90 mb-1">Seu Saldo</p>
      <p className="text-4xl font-bold">
        R$ {parseFloat(balance).toFixed(2)}
      </p>
      <button
        onClick={refresh}
        className="mt-2 text-sm underline hover:text-blue-200"
      >
        Atualizar
      </button>
    </div>
  );
};
```

---

## ✅ Validações e Mensagens de Erro

### Helper de Validação

```javascript
export const validateDepositAmount = (amount) => {
  const numAmount = parseFloat(amount);

  if (!amount || isNaN(numAmount)) {
    return { valid: false, error: 'Digite um valor válido' };
  }

  if (numAmount < 10) {
    return { valid: false, error: 'Valor mínimo: R$ 10,00' };
  }

  if (numAmount > 10000) {
    return { valid: false, error: 'Valor máximo: R$ 10.000,00' };
  }

  if (numAmount % 10 !== 0) {
    return { valid: false, error: 'O valor deve ser múltiplo de 10' };
  }

  return { valid: true };
};

// Uso:
const result = validateDepositAmount(amount);
if (!result.valid) {
  setError(result.error);
  return;
}
```

---

## 🔄 WebSocket (Alternativa ao Polling)

### Implementação com Socket.IO

```javascript
import { useEffect } from 'react';
import io from 'socket.io-client';

export const usePaymentWebSocket = (transactionId, onPaymentConfirmed) => {
  useEffect(() => {
    if (!transactionId) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    // Subscrever ao status da transação
    socket.emit('subscribe', { transactionId });

    // Ouvir confirmação de pagamento
    socket.on('payment:confirmed', (data) => {
      if (data.transactionId === transactionId) {
        onPaymentConfirmed(data);
      }
    });

    return () => {
      socket.emit('unsubscribe', { transactionId });
      socket.disconnect();
    };
  }, [transactionId, onPaymentConfirmed]);
};

// Uso no DepositModal:
usePaymentWebSocket(transactionId, (data) => {
  setStep(3);
  showDepositSuccess(data.amount);
});
```

---

## 📱 Responsividade

### Ajustes para Mobile

```css
/* styles/deposit.module.css */

.depositModal {
  @apply fixed inset-0 z-50 overflow-y-auto;
}

.modalContent {
  @apply min-h-screen px-4 py-8 flex items-center justify-center;
}

.modalCard {
  @apply bg-white rounded-lg shadow-xl w-full;
  max-width: 500px;
}

@media (max-width: 640px) {
  .modalCard {
    @apply rounded-none;
    min-height: 100vh;
  }

  .qrCodeContainer {
    @apply w-full;
  }

  .qrCodeImage {
    @apply w-full h-auto;
    max-width: 280px;
  }
}
```

---

## 🧪 Testes com Jest

### Teste do DepositModal

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DepositModal from './DepositModal';
import axios from 'axios';

jest.mock('axios');

describe('DepositModal', () => {
  test('valida valor mínimo', async () => {
    render(<DepositModal isOpen={true} onClose={jest.fn()} />);
    
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '5' } });
    
    const button = screen.getByText('Continuar');
    fireEvent.click(button);
    
    expect(screen.getByText('Valor mínimo: R$ 10,00')).toBeInTheDocument();
  });

  test('valida múltiplos de 10', () => {
    render(<DepositModal isOpen={true} onClose={jest.fn()} />);
    
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '15' } });
    
    const button = screen.getByText('Continuar');
    fireEvent.click(button);
    
    expect(screen.getByText(/múltiplo de 10/)).toBeInTheDocument();
  });

  test('cria depósito com sucesso', async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
        pix: {
          qrCode: '00020101021226...',
          qrCodeImage: 'https://...',
        },
        transaction: {
          id: '123',
          expiresAt: '2025-01-09T12:00:00Z',
        },
      },
    });

    render(<DepositModal isOpen={true} onClose={jest.fn()} />);
    
    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '50' } });
    
    const button = screen.getByText('Continuar');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Pague com PIX')).toBeInTheDocument();
    });
  });
});
```

---

## 🎯 Checklist de Implementação Frontend

- [ ] Criar componente `DepositModal`
- [ ] Implementar validação de valores
- [ ] Adicionar botões de valores rápidos
- [ ] Exibir QR Code (imagem ou biblioteca)
- [ ] Implementar código copia e cola
- [ ] Adicionar countdown de expiração
- [ ] Implementar polling de status
- [ ] Criar notificações (toast)
- [ ] Atualizar saldo em tempo real
- [ ] Criar página de histórico
- [ ] Adicionar filtros no histórico
- [ ] Implementar responsividade
- [ ] Adicionar loading states
- [ ] Tratar erros adequadamente
- [ ] Escrever testes unitários
- [ ] Testar fluxo completo

---

**Documento gerado em**: 08/11/2025  
**Versão**: 1.0  
**Complemento de**: INTEGRACAO_WOOVI_PIX.md
