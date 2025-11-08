/**
 * ============================================================
 * Parceiros Index - Redireciona para Dashboard ou Login
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useInfluencerStore from '../../store/influencerStore';
import Loader from '../../components/admin/Loader';

export default function ParceirosIndex() {
  const router = useRouter();
  const { isAuthenticated } = useInfluencerStore();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (redirecting) return; // Evitar múltiplos redirecionamentos
    
    setRedirecting(true);
    
    // Pequeno delay para evitar conflitos
    setTimeout(() => {
      // Se não está autenticado, vai para login
      if (!isAuthenticated) {
        router.replace('/parceiros/login');
      } else {
        // Se está autenticado, vai para dashboard
        router.replace('/parceiros/dashboard');
      }
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-admin-black flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}
