/**
 * ============================================================
 * Influencers Panel Controller
 * ============================================================
 * Endpoints para o painel do influencer/parceiro
 * Data: 08/11/2025
 */

const { supabase } = require('../config/supabase.config');

/**
 * GET /api/influencers/dashboard
 * Dashboard com estatísticas do influencer
 */
const getDashboard = async (req, res) => {
  try {
    const { id } = req.influencer;

    console.log('📊 [INFLUENCER PANEL] Dashboard do influencer:', id);

    // Buscar partidas do influencer
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, status, created_at')
      .eq('influencer_id', id);

    if (matchesError) {
      console.error('❌ [INFLUENCER PANEL] Erro ao buscar partidas:', matchesError);
    }

    // Buscar comissões
    const { data: commissions, error: commissionsError } = await supabase
      .from('influencer_commissions')
      .select('commission_amount, status, calculated_at')
      .eq('influencer_id', id);

    if (commissionsError) {
      console.error('❌ [INFLUENCER PANEL] Erro ao buscar comissões:', commissionsError);
    }

    // Calcular estatísticas
    const stats = {
      total_matches: matches?.length || 0,
      active_matches: matches?.filter(m => m.status === 'em_andamento').length || 0,
      completed_matches: matches?.filter(m => m.status === 'finalizada').length || 0,
      total_commissions: commissions?.reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0) || 0,
      pending_commissions: commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0) || 0,
      paid_commissions: commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.commission_amount || 0), 0) || 0
    };

    // Partidas recentes (últimas 5)
    const recentMatches = matches
      ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5) || [];

    console.log('✅ [INFLUENCER PANEL] Dashboard retornado');

    res.json({
      success: true,
      data: {
        stats,
        recent_matches: recentMatches
      }
    });
  } catch (error) {
    console.error('❌ [INFLUENCER PANEL] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dashboard',
      error: error.message
    });
  }
};

/**
 * GET /api/influencers/matches
 * Listar partidas do influencer
 */
const listMatches = async (req, res) => {
  try {
    const { id } = req.influencer;
    const { status, limit = 50, offset = 0 } = req.query;

    console.log('📋 [INFLUENCER PANEL] Listando partidas do influencer:', id);

    let query = supabase
      .from('matches')
      .select(`
        *,
        player1:players!matches_player1_id_fkey(id, name, nickname),
        player2:players!matches_player2_id_fkey(id, name, nickname)
      `, { count: 'exact' })
      .eq('influencer_id', id)
      .order('created_at', { ascending: false });

    // Filtro por status
    if (status) {
      query = query.eq('status', status);
    }

    // Paginação
    query = query.range(offset, parseInt(offset) + parseInt(limit) - 1);

    const { data: matches, error, count } = await query;

    if (error) {
      console.error('❌ [INFLUENCER PANEL] Erro ao listar partidas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar partidas',
        error: error.message
      });
    }

    console.log(`✅ [INFLUENCER PANEL] ${matches.length} partidas encontradas`);

    res.json({
      success: true,
      data: matches,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < count
      }
    });
  } catch (error) {
    console.error('❌ [INFLUENCER PANEL] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar partidas',
      error: error.message
    });
  }
};

/**
 * GET /api/influencers/matches/:id
 * Detalhes de uma partida + histórico de apostas confirmadas
 */
const getMatch = async (req, res) => {
  try {
    const { id: influencerId } = req.influencer;
    const { id: matchId } = req.params;

    console.log('🔍 [INFLUENCER PANEL] Buscando partida:', matchId);

    // Buscar partida com séries
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        player1:players!matches_player1_id_fkey(id, name, nickname),
        player2:players!matches_player2_id_fkey(id, name, nickname),
        series(*)
      `)
      .eq('id', matchId)
      .eq('influencer_id', influencerId)
      .single();

    if (matchError || !match) {
      return res.status(404).json({
        success: false,
        message: 'Partida não encontrada ou você não tem permissão'
      });
    }

    // Buscar IDs das séries desta partida
    const seriesIds = match.series?.map(s => s.id) || [];

    // Buscar todas as apostas das séries desta partida
    let bets = [];
    if (seriesIds.length > 0) {
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select(`
          *,
          user:users(id, name, email),
          serie:series(id, serie_number)
        `)
        .in('serie_id', seriesIds)
        .order('created_at', { ascending: false });

      if (betsError) {
        console.error('❌ [INFLUENCER PANEL] Erro ao buscar apostas:', betsError);
      } else {
        bets = betsData || [];
      }
    }

    // Calcular totais (amount está em centavos, dividir por 100)
    const totalBets = bets?.reduce((sum, bet) => sum + (parseFloat(bet.amount || 0) / 100), 0) || 0;
    const totalBetsPlayer1 = bets?.filter(b => b.chosen_player_id === match.player1_id).reduce((sum, bet) => sum + (parseFloat(bet.amount || 0) / 100), 0) || 0;
    const totalBetsPlayer2 = bets?.filter(b => b.chosen_player_id === match.player2_id).reduce((sum, bet) => sum + (parseFloat(bet.amount || 0) / 100), 0) || 0;

    // Buscar comissão calculada (se houver)
    const { data: commission } = await supabase
      .from('influencer_commissions')
      .select('*')
      .eq('match_id', matchId)
      .eq('influencer_id', influencerId)
      .single();

    match.betting_stats = {
      total_bets: totalBets,
      total_bets_player1: totalBetsPlayer1,
      total_bets_player2: totalBetsPlayer2,
      bets_count: bets?.length || 0
    };

    match.commission = commission || null;

    console.log('✅ [INFLUENCER PANEL] Partida encontrada:', match.id);

    res.json({
      success: true,
      data: {
        match,
        bets: bets || []
      }
    });
  } catch (error) {
    console.error('❌ [INFLUENCER PANEL] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar partida',
      error: error.message
    });
  }
};

/**
 * PATCH /api/influencers/matches/:id/start
 * Iniciar partida
 */
const startMatch = async (req, res) => {
  try {
    const { id: influencerId } = req.influencer;
    const { id: matchId } = req.params;

    console.log('▶️ [INFLUENCER PANEL] Iniciando partida:', matchId);

    // Verificar se a partida pertence ao influencer
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('id, status, influencer_id')
      .eq('id', matchId)
      .single();

    if (fetchError || !match) {
      return res.status(404).json({
        success: false,
        message: 'Partida não encontrada'
      });
    }

    if (match.influencer_id !== influencerId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para controlar esta partida'
      });
    }

    if (match.status !== 'agendada') {
      return res.status(400).json({
        success: false,
        message: 'Partida já foi iniciada ou finalizada'
      });
    }

    // Iniciar partida
    const { data: updated, error } = await supabase
      .from('matches')
      .update({
        status: 'em_andamento'
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      console.error('❌ [INFLUENCER PANEL] Erro ao iniciar partida:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao iniciar partida',
        error: error.message
      });
    }

    console.log('✅ [INFLUENCER PANEL] Partida iniciada:', updated.id);

    res.json({
      success: true,
      message: 'Partida iniciada com sucesso',
      data: updated
    });
  } catch (error) {
    console.error('❌ [INFLUENCER PANEL] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao iniciar partida',
      error: error.message
    });
  }
};

/**
 * PATCH /api/influencers/matches/:id/score
 * Atualizar placar total da partida (soma das séries)
 */
const updateScore = async (req, res) => {
  try {
    const { id: influencerId } = req.influencer;
    const { id: matchId } = req.params;
    const { player1_score, player2_score } = req.body;

    console.log('🎯 [INFLUENCER PANEL] Atualizando placar total:', matchId);

    // Verificar permissão
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('id, status, influencer_id')
      .eq('id', matchId)
      .single();

    if (fetchError || !match) {
      return res.status(404).json({
        success: false,
        message: 'Partida não encontrada'
      });
    }

    if (match.influencer_id !== influencerId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para controlar esta partida'
      });
    }

    if (match.status !== 'em_andamento') {
      return res.status(400).json({
        success: false,
        message: 'Partida não está em andamento'
      });
    }

    // Validar scores
    if (player1_score === undefined && player2_score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Informe ao menos um placar para atualizar'
      });
    }

    // Atualizar placar da série em andamento
    // Buscar série em andamento
    const { data: activeSerie } = await supabase
      .from('series')
      .select('id')
      .eq('match_id', matchId)
      .eq('status', 'em_andamento')
      .single();

    if (!activeSerie) {
      return res.status(400).json({
        success: false,
        message: 'Nenhuma série em andamento'
      });
    }

    // Atualizar placar da série
    const updateData = {};
    if (player1_score !== undefined) updateData.player1_score = parseInt(player1_score);
    if (player2_score !== undefined) updateData.player2_score = parseInt(player2_score);

    const { data: updated, error } = await supabase
      .from('series')
      .update(updateData)
      .eq('id', activeSerie.id)
      .select()
      .single();

    if (error) {
      console.error('❌ [INFLUENCER PANEL] Erro ao atualizar placar:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar placar',
        error: error.message
      });
    }

    console.log('✅ [INFLUENCER PANEL] Placar atualizado:', updated.id);

    res.json({
      success: true,
      message: 'Placar atualizado com sucesso',
      data: updated
    });
  } catch (error) {
    console.error('❌ [INFLUENCER PANEL] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar placar',
      error: error.message
    });
  }
};

/**
 * PATCH /api/influencers/series/:id/start
 * Iniciar série
 */
const startSeries = async (req, res) => {
  try {
    const { id: influencerId } = req.influencer;
    const { id: seriesId } = req.params;

    console.log('▶️ [INFLUENCER PANEL] Iniciando série:', seriesId);

    // Buscar série e verificar permissão via match
    const { data: series, error: fetchError } = await supabase
      .from('series')
      .select('id, status, match_id, matches!inner(influencer_id)')
      .eq('id', seriesId)
      .single();

    if (fetchError || !series) {
      return res.status(404).json({
        success: false,
        message: 'Série não encontrada'
      });
    }

    if (series.matches.influencer_id !== influencerId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para controlar esta série'
      });
    }

    if (series.status !== 'pendente') {
      return res.status(400).json({
        success: false,
        message: 'Série já foi iniciada ou finalizada'
      });
    }

    // Iniciar série
    const { data: updated, error } = await supabase
      .from('series')
      .update({
        status: 'em_andamento'
      })
      .eq('id', seriesId)
      .select()
      .single();

    if (error) {
      console.error('❌ [INFLUENCER PANEL] Erro ao iniciar série:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao iniciar série',
        error: error.message
      });
    }

    console.log('✅ [INFLUENCER PANEL] Série iniciada:', updated.id);

    res.json({
      success: true,
      message: 'Série iniciada com sucesso',
      data: updated
    });
  } catch (error) {
    console.error('❌ [INFLUENCER PANEL] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao iniciar série',
      error: error.message
    });
  }
};

/**
 * PATCH /api/influencers/series/:id/enable-betting
 * Liberar apostas para uma série
 */
const enableBetting = async (req, res) => {
  try {
    const { id: influencerId } = req.influencer;
    const { id: seriesId } = req.params;

    console.log('🎲 [INFLUENCER PANEL] Liberando apostas para série:', seriesId);

    // Buscar série e verificar permissão
    const { data: series, error: fetchError } = await supabase
      .from('series')
      .select('id, betting_enabled, match_id, matches!inner(influencer_id)')
      .eq('id', seriesId)
      .single();

    if (fetchError || !series) {
      return res.status(404).json({
        success: false,
        message: 'Série não encontrada'
      });
    }

    if (series.matches.influencer_id !== influencerId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para controlar esta série'
      });
    }

    // Liberar apostas
    const { data: updated, error } = await supabase
      .from('series')
      .update({ betting_enabled: true })
      .eq('id', seriesId)
      .select()
      .single();

    if (error) {
      console.error('❌ [INFLUENCER PANEL] Erro ao liberar apostas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao liberar apostas',
        error: error.message
      });
    }

    console.log('✅ [INFLUENCER PANEL] Apostas liberadas para série:', updated.id);

    res.json({
      success: true,
      message: 'Apostas liberadas com sucesso',
      data: updated
    });
  } catch (error) {
    console.error('❌ [INFLUENCER PANEL] Erro inesperado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao liberar apostas',
      error: error.message
    });
  }
};

module.exports = {
  getDashboard,
  listMatches,
  getMatch,
  startMatch,
  updateScore,
  startSeries,
  enableBetting
};

