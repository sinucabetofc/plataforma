/**
 * ============================================================
 * MatchSkeleton - Loading State para MatchCard
 * ============================================================
 */

export default function MatchSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md border-2 border-gray-200 animate-pulse"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>

          {/* Jogadores */}
          <div className="p-6">
            <div className="flex items-center justify-between gap-4">
              {/* Jogador 1 */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="h-3 w-20 bg-gray-200 rounded mx-auto"></div>
              </div>

              {/* VS */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>

              {/* Jogador 2 */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="h-3 w-20 bg-gray-200 rounded mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="px-6 pb-4 space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-1">
              <div className="h-3 w-full bg-gray-200 rounded"></div>
              <div className="h-3 w-full bg-gray-200 rounded"></div>
              <div className="h-3 w-full bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Botão */}
          <div className="px-6 pb-6">
            <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </>
  );
}



