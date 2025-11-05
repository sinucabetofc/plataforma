import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import AuthModal from '../components/AuthModal';
import { AuthProvider } from '../contexts/AuthContext';

/**
 * Custom App - Configuração global do Next.js
 */
function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  
  // Criar instância do QueryClient
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 1000,
          },
        },
      })
  );

  // Páginas que não devem mostrar o BottomNav
  const noBottomNavPages = [];
  const showBottomNav = !noBottomNavPages.includes(router.pathname);

  // Função para abrir modal de auth
  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-[#171717] text-texto-normal">
          <Header onOpenAuthModal={handleOpenAuthModal} />
          <main className={`container mx-auto flex-1 px-4 py-8 md:px-6 ${showBottomNav ? 'pb-24 md:pb-8' : ''}`}>
            <Component {...pageProps} />
          </main>
          {showBottomNav && <BottomNav />}
        </div>
        
        {/* Modal de Auth */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode={authModalMode}
        />
        
        {/* Toaster */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0B0C0B',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              border: '2px solid #27E502',
              boxShadow: '0 0 20px rgba(39, 229, 2, 0.4)',
            },
            success: {
              iconTheme: {
                primary: '#27E502',
                secondary: '#0a0f14',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default MyApp;

