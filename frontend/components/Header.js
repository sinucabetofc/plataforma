import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getWallet, createDeposit } from '../utils/api';
import DepositModal from './DepositModal';
import SinucaIcon from './icons/SinucaIcon';
import { ChevronDown, CreditCard, User, LogOut, Home, Wallet, TrendingUp, DollarSign, ArrowUpCircle } from 'lucide-react';

/**
 * Componente Header - Estilo RASPA GREEN com modal
 */

export default function Header({ onOpenAuthModal }) {
  const router = useRouter();
  const { user, authenticated, logout: authLogout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBalanceMenu, setShowBalanceMenu] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const balanceMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (balanceMenuRef.current && !balanceMenuRef.current.contains(event.target)) {
        setShowBalanceMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar saldo se autenticado
  const { data: walletData, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const result = await getWallet();
      if (result.success) {
        return result.data;
      }
      return null;
    },
    enabled: authenticated,
    refetchInterval: 10000, // Atualiza a cada 10s
  });

  // Mutation para depósito
  const depositMutation = useMutation({
    mutationFn: async (amount) => {
      const result = await createDeposit(amount);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: (data) => {
      toast.success('Depósito iniciado! Aguardando pagamento...');
      setShowDepositModal(false);
      refetchWallet();
      // Abrir QR Code do Pix (integração Woovi)
      if (data.data?.pix_qrcode || data.pix_qrcode) {
        const pixUrl = data.data?.pix_url || data.pix_url;
        if (pixUrl) {
          window.open(pixUrl, '_blank');
        }
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar depósito');
    },
  });

  const handleDeposit = (amount) => {
    if (isNaN(amount) || amount < 10) {
      toast.error('O valor mínimo para depósito é R$ 10');
      return;
    }
    depositMutation.mutate(amount);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  // Função de logout usando AuthContext
  const handleLogout = () => {
    setShowUserMenu(false);
    authLogout();
    toast.success('Até logo!');
  };

  const isActivePage = (path) => {
    if (path === '/home') {
      return router.pathname === '/home' || router.pathname === '/';
    }
    return router.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0C0B] border-b-2 border-cinza-borda">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        {/* Logo */}
        <Link href="/home" className="group flex items-center mr-8">
          <div className="relative">
            {/* Ícone de Sinuca (bola 8) */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-verde-neon shadow-lg transition-transform group-hover:scale-110">
              <span className="text-xl font-bold text-cinza-escuro">8</span>
            </div>
          </div>
        </Link>

        {/* Navegação Desktop - Centro (SEMPRE VISÍVEL) */}
        <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
          <Link href="/home">
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
                isActivePage('/home')
                  ? 'bg-verde-neon/20 text-verde-neon border-2 border-verde-neon'
                  : 'text-texto-secundario hover:bg-[#1a1a1a] hover:text-verde-neon'
              }`}
            >
              <Home size={18} />
              <span>Início</span>
            </div>
          </Link>
          
          <Link href="/partidas">
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
                isActivePage('/partidas')
                  ? 'bg-verde-neon/20 text-verde-neon border-2 border-verde-neon'
                  : 'text-texto-secundario hover:bg-[#1a1a1a] hover:text-verde-neon'
              }`}
            >
              <SinucaIcon size={18} active={isActivePage('/partidas')} />
              <span>Partidas</span>
            </div>
          </Link>
          
          {authenticated && (
            <Link href="/wallet">
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
                  isActivePage('/wallet')
                    ? 'bg-verde-neon/20 text-verde-neon border-2 border-verde-neon'
                    : 'text-texto-secundario hover:bg-[#1a1a1a] hover:text-verde-neon'
                }`}
              >
                <Wallet size={18} />
                <span>Carteira</span>
              </div>
            </Link>
          )}
          
          {authenticated && (
            <>
              <Link href="/apostas">
                <div
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
                    isActivePage('/apostas')
                      ? 'bg-verde-neon/20 text-verde-neon border-2 border-verde-neon'
                      : 'text-texto-secundario hover:bg-[#1a1a1a] hover:text-verde-neon'
                  }`}
                >
                  <TrendingUp size={18} />
                  <span>Apostas</span>
                </div>
              </Link>
              
              <Link href="/profile">
                <div
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all ${
                    isActivePage('/profile')
                      ? 'bg-verde-neon/20 text-verde-neon border-2 border-verde-neon'
                      : 'text-texto-secundario hover:bg-[#1a1a1a] hover:text-verde-neon'
                  }`}
                >
                  <User size={18} />
                  <span>Perfil</span>
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* Área Direita */}
        <div className="flex items-center gap-3 md:gap-4 ml-auto">
          {/* NÃO AUTENTICADO - Botões Registrar e Entrar (abrem modal) */}
          {!authenticated && (
            <>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="rounded-lg border-2 border-white bg-transparent px-4 py-2 text-xs font-bold uppercase text-white transition-all hover:bg-white hover:text-cinza-escuro md:px-6 md:py-2.5 md:text-sm"
              >
                Registrar
              </button>
              <button
                onClick={() => onOpenAuthModal('login')}
                className="rounded-lg bg-verde-neon px-4 py-2 text-xs font-bold uppercase text-cinza-escuro transition-all hover:bg-verde-accent md:px-6 md:py-2.5 md:text-sm"
              >
                Entrar
              </button>
            </>
          )}

          {/* AUTENTICADO - Saldo, Depositar e Perfil */}
          {authenticated && (
            <>
              {/* Saldo com Dropdown */}
              <div className="relative" ref={balanceMenuRef}>
                <button
                  onClick={() => setShowBalanceMenu(!showBalanceMenu)}
                  className="group flex cursor-pointer items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-2.5 transition-all hover:bg-cinza-claro"
                >
                  <span className="text-base font-bold text-verde-neon">
                    {formatCurrency(walletData?.available_balance || 0)}
                  </span>
                  <ChevronDown size={16} className={`text-white transition-transform ${showBalanceMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown do Saldo */}
                {showBalanceMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-cinza-borda bg-[#1a1a1a] shadow-2xl z-50">
                    {/* Informações do Saldo */}
                    <div className="p-4 space-y-3">
                      {/* Saldo Disponível */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-verde-neon" />
                          <span className="text-sm text-texto-secundario">Disponível</span>
                        </div>
                        <span className="text-base font-bold text-verde-neon">
                          {formatCurrency(walletData?.available_balance || 0)}
                        </span>
                      </div>

                      {/* Saldo Bloqueado */}
                      {walletData?.blocked_balance > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-yellow-500" />
                            <span className="text-sm text-texto-secundario">Bloqueado</span>
                          </div>
                          <span className="text-base font-bold text-yellow-500">
                            {formatCurrency(walletData?.blocked_balance || 0)}
                          </span>
                        </div>
                      )}

                      {/* Divisor */}
                      <div className="border-t border-cinza-borda"></div>

                      {/* Total */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">Total</span>
                        <span className="text-lg font-bold text-white">
                          {formatCurrency(walletData?.total_balance || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Botão Sacar */}
                    <div className="p-3 border-t border-cinza-borda">
                      <button
                        onClick={() => {
                          setShowBalanceMenu(false);
                          router.push('/wallet');
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-verde-neon px-4 py-2.5 text-base font-bold text-black transition-all hover:brightness-110"
                      >
                        <ArrowUpCircle size={20} />
                        Sacar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão Depositar - Quadrado verde com ícone de cartão */}
              <button
                onClick={() => setShowDepositModal(true)}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-verde-neon shadow-md transition-transform hover:scale-105 active:scale-100"
                aria-label="Depositar"
                title="Depositar"
              >
                <div className="relative pointer-events-none">
                  <CreditCard size={20} className="text-cinza-escuro" strokeWidth={2.5} />
                  <div className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-cinza-escuro">
                    <span className="text-[8px] font-bold text-verde-neon">+</span>
                  </div>
                </div>
              </button>

              {/* Menu do Usuário - Circular branco */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 transition-all"
                  aria-label="Menu do usuário"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-all hover:shadow-lg">
                    <User size={20} className="text-cinza-escuro" strokeWidth={2} />
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-cinza-borda bg-[#1a1a1a] shadow-2xl z-50">
                    <div className="p-3 border-b border-cinza-borda">
                      <p className="text-sm font-semibold text-white">
                        {user?.name || 'Usuário'}
                      </p>
                      <p className="text-xs text-texto-secundario">
                        {user?.email || ''}
                      </p>
                      <p className="mt-2 text-xs text-verde-neon font-semibold">
                        Saldo: {formatCurrency(walletData?.available_balance || 0)}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-sinuca-error font-semibold transition-all hover:bg-cinza-claro"
                      >
                        <LogOut size={16} />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Depósito */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
        isLoading={depositMutation.isPending}
      />
    </header>
  );
}

