/**
 * ============================================================
 * Users Page - Página de Usuários
 * ============================================================
 */

import { useRouter } from 'next/router';
import { useUsers, useUpdateUserStatus } from '../../hooks/admin/useUsers';
import useAdminStore from '../../store/adminStore';
import Table from '../../components/admin/Table';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatCurrency, formatCPF, formatPhone, formatDate } from '../../utils/formatters';
import { Users as UsersIcon, Search, Eye } from 'lucide-react';

export default function Users() {
  const router = useRouter();
  const { filters, setUsersFilters } = useAdminStore();
  const usersFilters = filters.users;
  
  const { data, isLoading } = useUsers(usersFilters);
  const updateUserStatus = useUpdateUserStatus();

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active;
    const action = newStatus ? 'desbloquear' : 'bloquear';
    
    if (!confirm(`Confirmar ${action} usuário ${user.name}?`)) {
      return;
    }

    await updateUserStatus.mutateAsync({
      userId: user.id,
      isActive: newStatus,
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'cpf',
      label: 'CPF',
      render: (value) => formatCPF(value),
    },
    {
      key: 'phone',
      label: 'Telefone',
      render: (value) => formatPhone(value),
    },
    {
      key: 'wallet',
      label: 'Saldo',
      render: (wallet) => formatCurrency((wallet?.balance || 0) / 100),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => <StatusBadge status={value ? 'active' : 'blocked'} />,
    },
    {
      key: 'created_at',
      label: 'Cadastro',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/users/${row.id}`)}
            className="btn btn-secondary btn-sm px-3 py-1 text-xs flex items-center gap-1"
            title="Ver detalhes"
          >
            <Eye size={14} />
            Ver detalhes
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`btn btn-sm px-3 py-1 text-xs ${
              row.is_active ? 'btn-danger' : 'btn-primary'
            }`}
            disabled={updateUserStatus.isPending}
          >
            {row.is_active ? 'Bloquear' : 'Desbloquear'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-admin-text-primary mb-2">
            Usuários
          </h1>
          <p className="text-admin-text-secondary">
            Gerenciar usuários da plataforma
          </p>
        </div>
        <div className="flex-shrink-0">
          <UsersIcon className="text-admin-green" size={24} />
        </div>
      </div>

      <div className="admin-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-admin-text-secondary mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted" size={18} />
              <input
                type="text"
                className="input pl-11"
                placeholder="Nome, email ou CPF..."
                value={usersFilters.search}
                onChange={(e) => setUsersFilters({ search: e.target.value, page: 1 })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-admin-text-secondary mb-2">
              Status
            </label>
            <select
              className="select"
              value={usersFilters.status || ''}
              onChange={(e) => setUsersFilters({ status: e.target.value || null, page: 1 })}
            >
              <option value="">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Bloqueados</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <Table
          columns={columns}
          data={data?.users || []}
          loading={isLoading}
          emptyMessage="Nenhum usuário encontrado"
        />

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-admin-text-muted">
              Página {data.pagination.page} de {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setUsersFilters({ page: usersFilters.page - 1 })}
                disabled={usersFilters.page === 1}
                className="btn btn-secondary btn-sm"
              >
                Anterior
              </button>
              <button
                onClick={() => setUsersFilters({ page: usersFilters.page + 1 })}
                disabled={usersFilters.page >= data.pagination.totalPages}
                className="btn btn-secondary btn-sm"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

