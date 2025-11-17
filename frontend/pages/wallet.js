'use client';

import { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getWallet, getTransactions, createDeposit, createWithdraw, getProfile } from '../utils/api';
import { withAuth } from '../contexts/AuthContext';
import Loader, { FullPageLoader } from '../components/Loader';
import TransactionCard from '../components/TransactionCard';
import DepositModal from '../components/DepositModal';
import {
  Wallet as WalletIcon,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

/**
 * Página Wallet - Carteira Digital
 * Protegida com withAuth HOC
 */
function Wallet() {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  // Buscar dados da carteira
  const {
    data: walletData,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const result = await getWallet();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message);
    },
  });

  // Buscar perfil do usuário (para pegar chave PIX)
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const result = await getProfile();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message);
    },
  });

  // Buscar transações
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const result = await getTransactions({ limit: 50, offset: 0 });
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message);
    },
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
      toast.success('QR Code gerado! Aguardando pagamento...');
      
      // Passar dados do PIX para o modal
      setPixData(data.pix);
      setTransactionId(data.transaction_id);
      
      // Manter modal aberto para exibir QR Code
      // (não fechar o modal)
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar depósito');
    },
  });

  // Callback quando pagamento é confirmado
  const handlePaymentSuccess = () => {
    refetchWallet();
    refetchTransactions();
    setPixData(null);
    setTransactionId(null);
    setShowDepositModal(false);
  };

  // Mutation para saque
  const withdrawMutation = useMutation({
    mutationFn: async ({ amount, pix_key }) => {
      const result = await createWithdraw(amount, { pix_key });
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
    onSuccess: () => {
      toast.success('Saque solicitado com sucesso! Aguarde aprovação.');
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      refetchWallet();
      refetchTransactions();
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao solicitar saque');
    },
  });

  const handleDeposit = (amount) => {
    if (isNaN(amount) || amount < 10) {
      toast.error('O valor mínimo para depósito é R$ 10');
      return;
    }
    depositMutation.mutate(amount);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    // Validações
    if (isNaN(amount) || amount < 20) {
      toast.error('O valor mínimo para saque é R$ 20,00');
      return;
    }
    if (amount > walletData.available_balance) {
      toast.error('Saldo insuficiente');
      return;
    }
    
    // Verificar se usuário tem chave PIX
    if (!userProfile?.pix_key) {
      toast.error('Configure sua chave PIX no perfil antes de solicitar saque');
      return;
    }
    
    // Solicitar saque com chave PIX do usuário
    withdrawMutation.mutate({ 
      amount, 
      pix_key: userProfile.pix_key 
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  if (walletLoading) {
    return <FullPageLoader text="Carregando carteira..." />;
  }

  return (
    <>
      <Head>
        <title>Carteira - SinucaBet</title>
      </Head>

      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 flex items-center gap-3 text-3xl font-bold text-texto-principal">
          <WalletIcon className="text-sinuca-green" size={36} />
          Minha Carteira
        </h1>

        {/* Cards de saldo */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Saldo disponível */}
          <div className="rounded-lg border border-sinuca-green bg-[#1a1a1a] p-6 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg text-texto-secundario">Saldo Disponível</h2>
              <Info size={20} className="text-texto-desabilitado" />
            </div>
            <p className="mb-4 text-4xl font-bold text-sinuca-success">
              {formatCurrency(walletData?.available_balance)}
            </p>
            <p className="text-sm text-texto-desabilitado">
              Disponível para apostas e saques
            </p>
          </div>

          {/* Saldo bloqueado */}
          <div className="rounded-lg border border-cinza-borda bg-[#1a1a1a] p-6 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg text-texto-secundario">Saldo Bloqueado</h2>
              <Info size={20} className="text-texto-desabilitado" />
            </div>
            <p className="mb-4 text-4xl font-bold text-yellow-500">
              {formatCurrency(walletData?.blocked_balance)}
            </p>
            <p className="text-sm text-texto-desabilitado">Em apostas ativas</p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-verde-neon py-4 text-xl font-semibold text-texto-principal transition-all hover:bg-verde-claro hover:shadow-lg"
          >
            <ArrowDownCircle size={24} />
            Depositar via Pix
          </button>

          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!walletData?.available_balance || walletData.available_balance < 10}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-sinuca-green bg-transparent py-4 text-xl font-semibold text-sinuca-green transition-all hover:bg-verde-neon hover:text-texto-principal disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowUpCircle size={24} />
            Sacar
          </button>
        </div>

        {/* Informações sobre saque */}
        <div className="mb-8 rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 flex-shrink-0 text-yellow-600" size={20} />
            <div>
              <p className="text-base font-medium text-yellow-600">
                Informações sobre saques
              </p>
              <p className="mt-1 text-sm text-yellow-700">
                • Taxa de 8% sobre o valor do saque
                <br />
                • Valor mínimo: R$ 10,00
                <br />
                • Processamento instantâneo via PIX
                <br />• O saque será enviado para sua chave Pix cadastrada
              </p>
            </div>
          </div>
        </div>

        {/* Histórico de transações */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-texto-principal">
            Últimas Transações
          </h2>

          {transactionsLoading ? (
            <Loader text="Carregando transações..." />
          ) : transactionsData?.length > 0 ? (
            <div className="space-y-4">
              {transactionsData.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-cinza-borda bg-[#1a1a1a] p-8 text-center">
              <p className="text-lg text-texto-secundario">
                Nenhuma transação encontrada
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Depósito Moderno */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
          setPixData(null);
          setTransactionId(null);
        }}
        onDeposit={handleDeposit}
        isLoading={depositMutation.isPending}
        pixData={pixData}
        transactionId={transactionId}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Modal de Saque */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md rounded-lg border border-cinza-borda bg-[#1a1a1a] p-6">
            <h2 className="mb-4 text-2xl font-bold text-texto-principal">Solicitar Saque</h2>
            <p className="mb-2 text-texto-secundario">
              Digite o valor que deseja sacar
            </p>
            <p className="mb-4 text-sm text-yellow-600">
              Taxa de 8% será descontada do valor
            </p>

            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="R$ 0,00"
              min="10"
              max={walletData?.available_balance}
              step="10"
              className="mb-4 w-full rounded-lg border border-cinza-borda bg-cinza-claro px-4 py-3 text-lg text-texto-principal placeholder:text-texto-desabilitado focus:border-sinuca-green focus:outline-none focus:ring-2 focus:ring-sinuca-green"
            />

            {withdrawAmount && (
              <div className="mb-4 rounded-lg bg-cinza-claro p-3">
                <p className="text-sm text-texto-secundario">Você receberá:</p>
                <p className="text-xl font-bold text-sinuca-success">
                  {formatCurrency(parseFloat(withdrawAmount) * 0.92)}
                </p>
                <p className="text-xs text-texto-desabilitado">
                  (Taxa de 8%: {formatCurrency(parseFloat(withdrawAmount) * 0.08)})
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                }}
                disabled={withdrawMutation.isPending}
                className="flex-1 rounded-lg border border-sinuca-green bg-transparent px-4 py-3 text-lg font-medium text-sinuca-green transition-all hover:bg-verde-neon hover:text-texto-principal disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className="flex-1 rounded-lg bg-verde-neon px-4 py-3 text-lg font-medium text-texto-principal transition-all hover:bg-verde-claro disabled:cursor-not-allowed disabled:opacity-50"
              >
                {withdrawMutation.isPending ? 'Processando...' : 'Solicitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Proteger rota com autenticação
export default withAuth(Wallet);

