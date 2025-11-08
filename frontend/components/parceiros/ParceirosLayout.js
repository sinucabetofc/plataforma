/**
 * ============================================================
 * Parceiros Layout - Layout do Painel de Parceiros
 * ============================================================
 * Segue EXATAMENTE o padrão do AdminLayout
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useInfluencerStore from '../../store/influencerStore';
import ParceirosSidebar from './ParceirosSidebar';
import ParceirosTopbar from './ParceirosTopbar';
import Loader from '../admin/Loader';
import MobileNav from './MobileNav';

export default function ParceirosLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, influencer, fetchInfluencer } = useInfluencerStore();
  const [mounted, setMounted] = useState(false);

  // Evitar hydration mismatch - só renderiza após mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Verificar autenticação
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/parceiros/login');
      return;
    }

    // Buscar dados do influencer se não tiver
    if (!influencer) {
      fetchInfluencer();
    }
  }, [mounted, isAuthenticated, influencer, router, fetchInfluencer]);

  // Durante SSR ou antes do mount, mostra loader
  if (!mounted || !isAuthenticated || !influencer) {
    return (
      <div className="min-h-screen bg-admin-black flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-black pb-16 lg:pb-0">
      <ParceirosSidebar />
      <div className="lg:ml-64">
        <ParceirosTopbar />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

