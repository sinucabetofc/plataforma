/**
 * ============================================================
 * Admin Index - Redireciona para Dashboard ou Login
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../../utils/auth';
import Loader from '../../components/admin/Loader';

export default function AdminIndex() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Verificar autenticação no lado do cliente
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      
      if (!isAuthenticated()) {
        router.replace('/admin/login');
      } else {
        router.replace('/admin/dashboard');
      }
    };
    
    checkAuth();
  }, [mounted, router]);

  return (
    <div className="min-h-screen bg-admin-black flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}

// Forçar renderização no cliente
export async function getServerSideProps() {
  return { props: {} };
}

