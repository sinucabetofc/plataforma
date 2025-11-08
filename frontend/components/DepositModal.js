import { useState, useEffect } from 'react';
import { X, CreditCard, QrCode, Flame, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

/**
 * Modal de Depósito com 3 Etapas - Integração Woovi PIX
 * Step 1: Seleção de valor
 * Step 2: Exibição de QR Code + Polling
 * Step 3: Confirmação de sucesso
 */
export default function DepositModal({ 
  isOpen, 
  onClose, 
  onDeposit, 
  isLoading,
  pixData,
  transactionId,
  onPaymentSuccess 
}) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Reset quando modal abre/fecha
  useEffect(() => {
    if (isOpen && !pixData) {
      setStep(1);
      setAmount(0);
      setTimeLeft(null);
    } else if (isOpen && pixData) {
      setStep(2);
    }
  }, [isOpen, pixData]);

  // Countdown de expiração
  useEffect(() => {
    if (pixData?.expiresAt && step === 2) {
      const interval = setInterval(() => {
        const now = new Date();
        const expires = new Date(pixData.expiresAt);
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
  }, [pixData, step]);

  // Iniciar polling quando tiver transactionId
  useEffect(() => {
    if (transactionId && step === 2) {
      startPolling();
    }

    return () => stopPolling();
  }, [transactionId, step]);

  const startPolling = () => {
    // Verificar status a cada 3 segundos
    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 3000);

    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Verificar se token existe
      if (!token) {
        console.error('❌ Token não encontrado - usuário precisa fazer login novamente');
        stopPolling();
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const url = apiUrl.includes('/api') 
        ? `${apiUrl}/wallet/transactions/${transactionId}`
        : `${apiUrl}/api/wallet/transactions/${transactionId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.data.status === 'completed') {
        stopPolling();
        setStep(3);
        toast.success('Pagamento confirmado!');
        
        // Notificar parent component
        if (onPaymentSuccess) {
          setTimeout(() => {
            onPaymentSuccess();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      
      // Se erro 401, parar polling e avisar usuário
      if (err.response?.status === 401) {
        stopPolling();
        toast.error('Sessão expirada. Faça login novamente para ver atualizações.');
      }
    }
  };

  // Opções de valores rápidos
  const quickAmounts = [
    { value: 10, label: 'R$ 10' },
    { value: 20, label: 'R$ 20' },
    { value: 30, label: 'R$ 30', hot: true },
    { value: 50, label: 'R$ 50' },
    { value: 100, label: 'R$ 100' },
    { value: 250, label: 'R$ 250' },
    { value: 500, label: 'R$ 500' },
    { value: 1000, label: 'R$ 1000' },
  ];

  const handleAddAmount = (value) => {
    setAmount((prev) => prev + value);
  };

  const handleClear = () => {
    setAmount(0);
  };

  const handleCopyCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      toast.success('Código PIX copiado!');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const handleSubmit = () => {
    if (amount >= 10) {
      onDeposit(amount);
    }
  };

  const handleClose = () => {
    stopPolling();
    setStep(1);
    setAmount(0);
    setTimeLeft(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={step === 1 ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform px-4">
        <div className="relative rounded-xl bg-[#1a1a1a] shadow-2xl border border-cinza-borda">
          {/* Botão Fechar */}
          {step !== 2 && (
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-lg p-2 text-texto-secundario transition-all hover:bg-cinza-claro hover:text-white z-10"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          )}

          {/* Conteúdo */}
          <div className="p-5 md:p-6">
            {/* ========================================= */}
            {/* STEP 1: SELEÇÃO DE VALOR */}
            {/* ========================================= */}
            {step === 1 && (
              <>
                {/* Título */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-verde-neon/20">
                    <div className="relative">
                      <CreditCard size={24} className="text-verde-neon" strokeWidth={2.5} />
                      <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-verde-neon">
                        <span className="text-[10px] font-bold text-cinza-escuro">+</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-texto-principal">
                    Depositar
                  </h2>
                </div>

                {/* Campo de Valor */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-texto-normal">
                      Valor Total:
                    </label>
                    {amount > 0 && (
                      <button
                        onClick={handleClear}
                        className="text-xs text-sinuca-error hover:text-red-400 transition-colors"
                        type="button"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatCurrency(amount)}
                      readOnly
                      className="w-full rounded-lg border-2 border-cinza-borda bg-cinza-claro px-4 py-3 text-lg font-semibold text-texto-principal cursor-default focus:border-verde-neon focus:outline-none"
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <p className="mt-2 text-xs text-texto-secundario">
                    Clique nos valores abaixo para adicionar (pode clicar múltiplas vezes)
                  </p>
                </div>

                {/* Botões de Valor Rápido */}
                <div className="mb-6">
                  <label className="mb-2 block text-xs font-medium text-texto-secundario">
                    Adicionar ao valor:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAddAmount(option.value)}
                        type="button"
                        className={`relative rounded-lg px-3 py-3 text-sm font-bold transition-all border-2 hover:scale-105 active:scale-95 ${
                          option.hot 
                            ? 'border-yellow-400 bg-[#11230F] text-[#27E502]' 
                            : 'border-transparent bg-[#11230F] text-[#27E502] hover:border-[#27E502]/30'
                        }`}
                        style={{ backgroundColor: '#11230F', color: '#27E502' }}
                      >
                        {option.hot && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-1.5 py-0.5 flex items-center gap-0.5 whitespace-nowrap">
                            <Flame size={8} className="text-black" />
                            <span className="text-[8px] font-bold text-black uppercase">
                              Top
                            </span>
                          </div>
                        )}
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-texto-desabilitado italic">
                    💡 Dica: Clique 2x em R$ 10 para R$ 20, ou combine valores diferentes
                  </p>
                </div>

                {/* Info */}
                <div className="mb-6 p-3 bg-verde-neon/10 border border-verde-neon/30 rounded-lg">
                  <p className="text-xs text-texto-normal">
                    <strong className="text-verde-neon">✓</strong> Depósito instantâneo<br />
                    <strong className="text-verde-neon">✓</strong> Sem taxas<br />
                    <strong className="text-verde-neon">✓</strong> Disponível 24/7
                  </p>
                </div>

                {/* Botão Principal */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || amount < 10}
                  className="w-full rounded-lg bg-verde-neon px-6 py-4 text-lg font-bold text-cinza-escuro shadow-lg transition-all hover:scale-[1.02] hover:shadow-verde-strong disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <div className="flex items-center justify-center gap-3">
                    <QrCode size={24} strokeWidth={2.5} />
                    <span>{isLoading ? 'Gerando...' : 'Gerar QR Code'}</span>
                  </div>
                </button>

                <p className="mt-4 text-center text-xs text-texto-secundario">
                  O QR Code Pix expira em 24 horas
                </p>
              </>
            )}

            {/* ========================================= */}
            {/* STEP 2: EXIBIR QR CODE */}
            {/* ========================================= */}
            {step === 2 && pixData && (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-texto-principal mb-1">
                    Pague com PIX
                  </h2>
                  <p className="text-texto-secundario text-xs">
                    Escaneie o QR Code ou copie o código
                  </p>
                </div>

                {/* QR Code - Menor */}
                <div className="bg-white p-4 rounded-xl mb-4">
                  <div className="flex justify-center mb-3">
                    {pixData.qrCodeImage ? (
                      <img 
                        src={pixData.qrCodeImage} 
                        alt="QR Code PIX"
                        className="w-48 h-48 rounded-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <QrCode size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600 mb-1">
                      {formatCurrency(amount)}
                    </p>
                    {timeLeft && timeLeft !== 'Expirado' && (
                      <p className="text-xs text-gray-500">
                        Expira em: <span className="font-semibold">{timeLeft}</span>
                      </p>
                    )}
                    {timeLeft === 'Expirado' && (
                      <p className="text-xs text-red-600 font-semibold">
                        ⚠️ QR Code expirado
                      </p>
                    )}
                  </div>
                </div>

                {/* Botão Copiar Código */}
                <button
                  onClick={handleCopyCode}
                  className="w-full mb-2 px-4 py-2.5 bg-cinza-claro hover:bg-cinza-medio border border-cinza-borda rounded-lg text-sm font-medium text-texto-principal transition-all hover:border-verde-neon/50 flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  Copiar Código PIX
                </button>

                {/* Botão Abrir no App */}
                {pixData.paymentLink && (
                  <a
                    href={pixData.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mb-3 px-4 py-2.5 bg-verde-neon hover:bg-verde-neon/90 text-cinza-escuro text-center rounded-lg font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Abrir no App do Banco
                  </a>
                )}

                {/* Status de Aguardando */}
                <div className="text-center py-2 mb-3">
                  <div className="flex items-center justify-center gap-2 text-texto-secundario">
                    <div className="w-2 h-2 bg-verde-neon rounded-full animate-pulse"></div>
                    <span className="text-xs">Aguardando pagamento...</span>
                  </div>
                </div>

                {/* Instruções - Mais Compactas */}
                <div className="bg-cinza-claro border border-cinza-borda rounded-lg p-3 mb-3">
                  <p className="text-xs text-texto-secundario leading-relaxed">
                    <strong className="text-texto-normal">Como pagar:</strong><br />
                    1. Abra o app do seu banco<br />
                    2. Escolha "Pagar com PIX"<br />
                    3. Escaneie o QR Code ou cole o código<br />
                    4. Confirme o pagamento<br />
                    <br />
                    💰 Seu saldo será atualizado automaticamente
                  </p>
                </div>

                {/* Botão Cancelar - Mais Visível */}
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-3 border-2 border-cinza-borda rounded-lg hover:bg-cinza-claro hover:border-texto-secundario transition text-base font-medium text-texto-normal"
                >
                  Cancelar
                </button>
              </>
            )}

            {/* ========================================= */}
            {/* STEP 3: SUCESSO */}
            {/* ========================================= */}
            {step === 3 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle size={48} className="text-green-500" strokeWidth={2.5} />
                </div>
                
                <h2 className="text-3xl font-bold text-green-500 mb-3">
                  Pagamento Confirmado!
                </h2>
                
                <p className="text-texto-secundario mb-6">
                  Seu saldo foi atualizado com sucesso
                </p>
                
                <div className="bg-verde-neon/10 border border-verde-neon/30 rounded-lg p-6 mb-6">
                  <p className="text-sm text-texto-secundario mb-2">
                    Valor depositado
                  </p>
                  <p className="text-4xl font-bold text-verde-neon">
                    + {formatCurrency(amount)}
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full px-6 py-3 bg-verde-neon hover:bg-verde-neon/90 text-cinza-escuro rounded-lg font-bold transition-all hover:scale-[1.02]"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
