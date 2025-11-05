/**
 * ============================================================
 * MatchList - Container da Lista de Partidas
 * ============================================================
 */

import MatchCard from './MatchCard';
import MatchSkeleton from './MatchSkeleton';

export default function MatchList({ matches, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MatchSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950 border border-red-800 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-red-100 mb-2">
          Erro ao carregar partidas
        </h3>
        <p className="text-red-300 mb-4">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border-2 border-dashed border-gray-700 rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">🎱</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Nenhuma partida encontrada
        </h3>
        <p className="text-gray-400 mb-4">
          Não há partidas disponíveis no momento com os filtros selecionados.
        </p>
        <p className="text-sm text-gray-500">
          Tente ajustar os filtros ou aguarde novas partidas serem criadas.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Grid de Partidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      {/* Contador */}
      <div className="mt-6 text-center text-sm text-gray-400">
        {matches.length === 1 ? (
          <p>1 partida encontrada</p>
        ) : (
          <p>{matches.length} partidas encontradas</p>
        )}
      </div>
    </>
  );
}

