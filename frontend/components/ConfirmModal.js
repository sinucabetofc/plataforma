import { X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

/**
 * Modal de Confirmação - Design consistente com o projeto
 * 
 * @param {boolean} isOpen - Se o modal está aberto
 * @param {function} onClose - Callback ao fechar
 * @param {function} onConfirm - Callback ao confirmar
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem do modal
 * @param {string} confirmText - Texto do botão confirmar (padrão: "Confirmar")
 * @param {string} cancelText - Texto do botão cancelar (padrão: "Cancelar")
 * @param {string} variant - Variante do modal: 'danger', 'warning', 'success' (padrão: 'danger')
 * @param {boolean} isLoading - Se está processando ação
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) {
  if (!isOpen) return null;

  // Configurações de estilo por variante
  const variantConfig = {
    danger: {
      icon: XCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/10',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      borderColor: 'border-red-500/20',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-500/10',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      borderColor: 'border-yellow-500/20',
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-500/10',
      confirmBg: 'bg-green-600 hover:bg-green-700',
      borderColor: 'border-green-500/20',
    },
  };

  const config = variantConfig[variant] || variantConfig.danger;
  const Icon = config.icon;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform px-4">
        <div className={`relative rounded-xl bg-[#1a1a1a] shadow-2xl border ${config.borderColor}`}>
          {/* Botão Fechar */}
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>

          {/* Conteúdo */}
          <div className="p-6">
            {/* Ícone */}
            <div className={`mb-4 flex justify-center`}>
              <div className={`rounded-full p-3 ${config.iconBg}`}>
                <Icon className={`${config.iconColor}`} size={32} />
              </div>
            </div>

            {/* Título */}
            <h3 className="mb-3 text-center text-xl font-bold text-white">
              {title}
            </h3>

            {/* Mensagem */}
            <p className="mb-6 text-center text-sm text-gray-400 leading-relaxed">
              {message}
            </p>

            {/* Botões */}
            <div className="flex gap-3">
              {/* Botão Cancelar */}
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-700 bg-transparent px-4 py-3 font-semibold text-gray-300 transition-all hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>

              {/* Botão Confirmar */}
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white transition-all ${config.confirmBg} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Aguarde...</span>
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}




