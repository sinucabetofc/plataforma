/**
 * ============================================================
 * StatusBadge Component
 * ============================================================
 */

import { formatStatus } from '../../utils/formatters';

const STATUS_COLORS = {
  // Status verde (sucesso/ao vivo)
  active: 'status-success',
  completed: 'status-success',
  paid: 'status-success',
  approved: 'status-success',
  won: 'status-success',
  finished: 'status-success',
  finalizada: 'status-success',
  encerrada: 'status-success', // Série encerrada
  ganha: 'status-success', // Aposta ganha
  em_andamento: 'status-success', // Partida ao vivo
  
  // Status amarelo (atenção/pendente)
  pending: 'status-warning',
  open: 'status-warning',
  awaiting: 'status-warning',
  in_progress: 'status-warning',
  pendente: 'status-warning', // Aposta pendente / Série pendente
  
  // Status vermelho (erro/bloqueado/perdeu)
  inactive: 'status-error',
  blocked: 'status-error',
  failed: 'status-error',
  rejected: 'status-error',
  cancelled: 'status-error',
  cancelada: 'status-error',
  lost: 'status-error',
  perdida: 'status-error', // Aposta perdida
  perdeu: 'status-error', // Aposta perdeu
  
  // Status azul (info/agendada/casada)
  agendada: 'status-info', // Partida agendada
  liberada: 'status-info', // Série liberada para apostas
  refund: 'status-info',
  matched: 'status-info', // Aposta casada/pareada
  casada: 'status-info', // Aposta casada
  casado: 'status-info', // Aposta casado
  aceita: 'status-info', // Aposta aceita (casada)
  reembolsada: 'status-info', // Aposta reembolsada
};

export default function StatusBadge({ status, className = '' }) {
  const colorClass = STATUS_COLORS[status] || 'status-info';
  const text = formatStatus(status);

  return (
    <span className={`status-badge ${colorClass} ${className}`}>
      {text}
    </span>
  );
}

