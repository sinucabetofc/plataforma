import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdminStore } from '../store/adminStore';
import Loader from './Loader';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, restoreSession } = useAdminStore();

  useEffect(() => {
    // Tentar restaurar sessão ao montar
    const hasSession = restoreSession();
    
    // Se não tem sessão, redireciona para login
    if (!hasSession) {
      router.replace('/');
    }
  }, []);

  // Mostrar loader enquanto verifica autenticação
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader />
      </div>
    );
  }

  return children;
}
