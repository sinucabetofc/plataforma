import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { InlineLoader } from './Loader';

/**
 * Componente BetButton - Botões para realizar apostas
 */
export default function BetButton({
  gameId,
  playerId,
  playerName,
  onBetPlaced,
  disabled = false,
}) {
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = [10, 20, 50];

  const handleBet = async (amount) => {
    // Validar múltiplos de 10
    if (amount % 10 !== 0) {
      setError('O valor deve ser múltiplo de R$ 10');
      return;
    }

    if (amount < 10) {
      setError('O valor mínimo é R$ 10');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await onBetPlaced({
        game_id: gameId,
        player_id: playerId,
        amount,
      });

      if (result.success) {
        setSuccess(true);
        setCustomAmount('');
        setShowCustomInput(false);
        
        // Reset success após 3 segundos
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(result.message || 'Erro ao processar aposta');
      }
    } catch (err) {
      setError('Erro ao processar aposta');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomBet = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount)) {
      setError('Digite um valor válido');
      return;
    }
    handleBet(amount);
  };

  return (
    <div className="rounded-xl border-2 border-verde-neon bg-[#1a1a1a] p-6 shadow-verde-soft">
      <h3 className="mb-4 text-xl font-bold text-texto-principal">
        Apostar em {playerName}
      </h3>

      {/* Botões de valores rápidos */}
      <div className="mb-4 flex flex-wrap gap-3">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            onClick={() => handleBet(amount)}
            disabled={disabled || loading}
            className="flex-1 rounded-lg bg-verde-neon px-6 py-3 text-lg font-semibold text-white shadow-verde-soft transition-all hover:scale-105 hover:bg-verde-claro hover:shadow-verde-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <InlineLoader /> : `R$ ${amount}`}
          </button>
        ))}
      </div>

      {/* Botão "Outro valor" */}
      {!showCustomInput ? (
        <button
          onClick={() => setShowCustomInput(true)}
          disabled={disabled || loading}
          className="w-full rounded-lg border-2 border-verde-neon bg-transparent px-6 py-3 text-lg font-semibold text-verde-accent transition-all hover:bg-verde-medio hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Outro valor
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Digite o valor (múltiplos de 10)"
              min="10"
              step="10"
              disabled={disabled || loading}
              className="flex-1 rounded-lg border-2 border-cinza-borda bg-cinza-claro px-4 py-3 text-lg text-texto-principal placeholder:text-texto-desabilitado focus:border-verde-neon focus:outline-none focus:ring-2 focus:ring-verde-glow disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={handleCustomBet}
              disabled={disabled || loading || !customAmount}
              className="rounded-lg bg-verde-neon px-6 py-3 text-lg font-semibold text-white shadow-verde-soft transition-all hover:bg-verde-claro disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <InlineLoader /> : 'Apostar'}
            </button>
          </div>
          <button
            onClick={() => {
              setShowCustomInput(false);
              setCustomAmount('');
              setError('');
            }}
            disabled={loading}
            className="text-sm text-texto-secundario hover:text-verde-accent"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Feedback de sucesso */}
      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-verde-accent bg-verde-accent/10 p-3 text-verde-accent shadow-verde-glow animate-fade-in">
          <Check size={20} />
          <span className="text-base font-semibold">Aposta realizada com sucesso!</span>
        </div>
      )}

      {/* Feedback de erro */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-sinuca-error bg-sinuca-error/10 p-3 text-sinuca-error animate-fade-in">
          <AlertCircle size={20} />
          <span className="text-base font-semibold">{error}</span>
        </div>
      )}
    </div>
  );
}

