import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';

function Games() {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Partidas</h1>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400">Gerenciamento de partidas em desenvolvimento...</p>
        </div>
      </div>
    </Layout>
  );
}

export default function GamesPage() {
  return (
    <ProtectedRoute>
      <Games />
    </ProtectedRoute>
  );
}
