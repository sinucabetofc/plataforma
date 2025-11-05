import { useState, useEffect } from 'react';
import { X, CreditCard, QrCode, Flame } from 'lucide-react';

/**
 * Modal de Depósito Moderno - Design RASPA GREEN
 */
export default function DepositModal({ isOpen, onClose, onDeposit, isLoading }) {
  const [amount, setAmount] = useState(0);

  // Reset valor quando modal abre
  useEffect(() => {
    if (isOpen) {
      setAmount(0);
    }
  }, [isOpen]);

  // Opções de valores rápidos (todos em horizontal)
  const quickAmounts = [
    { value: 10, label: 'R$ 10' },
    { value: 20, label: 'R$ 20' },
    { value: 30, label: 'R$ 30', hot: true }, // Opção em destaque
    { value: 50, label: 'R$ 50' },
    { value: 100, label: 'R$ 100' },
    { value: 250, label: 'R$ 250' },
    { value: 500, label: 'R$ 500' },
    { value: 1000, label: 'R$ 1000' },
  ];

  // Adicionar valor ao total ao clicar (permite cliques múltiplos)
  const handleAddAmount = (value) => {
    setAmount((prev) => prev + value);
  };

  // Limpar valor
  const handleClear = () => {
    setAmount(0);
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
      setAmount(0); // Limpar após enviar
    }
  };

  const handleClose = () => {
    setAmount(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform px-4">
        <div className="relative rounded-xl bg-[#1a1a1a] shadow-2xl border border-cinza-borda">
          {/* Botão Fechar */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-texto-secundario transition-all hover:bg-cinza-claro hover:text-white"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>

          {/* Conteúdo */}
          <div className="p-6 md:p-8">
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

            {/* Campo de Valor (Somente Leitura) */}
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

            {/* Botões de Valor Rápido - Horizontal */}
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

            {/* Info adicional */}
            <p className="mt-4 text-center text-xs text-texto-secundario">
              O QR Code Pix expira em 15 minutos
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

