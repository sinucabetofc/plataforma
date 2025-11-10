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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Verificar autenticação apenas no cliente
    const checkAuth = () => {
      try {
        // Acessar localStorage diretamente
        const stored = typeof window !== 'undefined' 
          ? localStorage.getItem('influencer-auth-storage') 
          : null;
        
        const isAuth = stored ? JSON.parse(stored)?.state?.isAuthenticated : false;
        
        console.log('🔍 [PARCEIROS] Verificando autenticação:', isAuth);
    
        // Redirecionar baseado na autenticação
        if (!isAuth) {
          console.log('➡️  [PARCEIROS] Redirecionando para login...');
          router.replace('/parceiros/login');
        } else {
          console.log('➡️  [PARCEIROS] Redirecionando para dashboard...');
          router.replace('/parceiros/dashboard');
        }
      } catch (error) {
        console.error('❌ [PARCEIROS] Erro ao verificar autenticação:', error);
        // Em caso de erro, redirecionar para login
        router.replace('/parceiros/login');
      }
    };

    // Pequeno delay para garantir que store está hidratado
    const timer = setTimeout(checkAuth, 150);
    
    return () => clearTimeout(timer);
  }, [mounted, router]);

  // Não renderizar nada no servidor (SSR)
  if (!mounted) {
    return null;
      }

  return (
    <div className="min-h-screen bg-admin-black flex items-center justify-center">
      <div className="text-center">
      <Loader size="lg" />
        <p className="mt-4 text-sm text-gray-400">Redirecionando...</p>
      </div>
    </div>
  );
}

// Forçar renderização no cliente
export async function getServerSideProps() {
  return {
    props: {},
  };
}
