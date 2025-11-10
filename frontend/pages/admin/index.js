/**
 * ============================================================
 * Admin Index - Redireciona para Dashboard ou Login
 * ============================================================
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se tem token nos cookies
    const token = Cookies.get('sinucabet_token');
    
    if (token) {
      // Se tem token, vai para dashboard
      router.replace('/admin/dashboard');
    } else {
      // Se não tem token, vai para login
        router.replace('/admin/login');
      }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27E502] mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando...</p>
      </div>
    </div>
  );
}

