/**
 * ============================================================
 * Página: /partidas
 * Descrição: Lista de todas as partidas disponíveis
 * ============================================================
 */

'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import MatchList from '../../components/partidas/MatchList';
import MatchFilters from '../../components/partidas/MatchFilters';

export default function PartidasPage() {
  const router = useRouter();
  
  // Estados
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: router.query.status || '',
    sport: router.query.sport || '',
    limit: 20,
    offset: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    has_more: false,
  });

  // Função para buscar partidas
  const fetchMatches = async (newFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando partidas com filtros:', newFilters);
      const data = await api.matches.getAll(newFilters);
      console.log('✅ Dados recebidos:', data);
      
      setMatches(data.matches || []);
      setPagination(data.pagination || { total: 0, has_more: false });
    } catch (err) {
      console.error('❌ Erro ao buscar partidas:', err);
      setError(err.message || 'Erro ao carregar partidas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar partidas ao montar e quando filtros mudarem
  useEffect(() => {
    fetchMatches();
  }, [filters.status, filters.sport]);

  // Função para alterar filtros
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
      offset: 0, // Reset offset quando filtro muda
    };
    
    setFilters(newFilters);
    
    // Atualizar URL
    const query = {};
    if (newFilters.status) query.status = newFilters.status;
    if (newFilters.sport) query.sport = newFilters.sport;
    
    router.push({
      pathname: '/partidas',
      query,
    }, undefined, { shallow: true });
  };

  // Função para resetar filtros
  const handleResetFilters = () => {
    const newFilters = {
      status: '',
      sport: '',
      limit: 20,
      offset: 0,
    };
    
    setFilters(newFilters);
    router.push('/partidas', undefined, { shallow: true });
  };

  // Função para carregar mais (paginação)
  const handleLoadMore = () => {
    const newFilters = {
      ...filters,
      offset: filters.offset + filters.limit,
    };
    
    setFilters(newFilters);
  };

  return (
    <>
      <Head>
        <title>Partidas - SinucaBet</title>
        <meta name="description" content="Veja todas as partidas de sinuca disponíveis para apostar no SinucaBet" />
      </Head>

      <div className="min-h-screen bg-[#171717] py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              🎱 Partidas
            </h1>
            <p className="text-gray-400">
              Escolha uma partida e faça suas apostas
            </p>
          </div>

          {/* Filtros */}
          <MatchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Lista de Partidas */}
          <MatchList
            matches={matches}
            loading={loading}
            error={error}
          />

          {/* Paginação */}
          {!loading && pagination.has_more && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold
                           hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
              >
                Carregar Mais Partidas
              </button>
            </div>
          )}

          {/* Info de Paginação */}
          {!loading && matches.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-400">
              Mostrando {matches.length} de {pagination.total} partidas
            </div>
          )}
        </div>
      </div>
    </>
  );
}

