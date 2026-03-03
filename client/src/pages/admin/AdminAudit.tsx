import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AdminAudit() {
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: '',
    startDate: '',
    endDate: '',
  });

  const { data: logs = [], isLoading } = (trpc.audit.logs.useQuery as any)({
    userId: filters.userId ? parseInt(filters.userId) : undefined,
    action: filters.action || undefined,
    entityType: filters.entityType || undefined,
    startDate: filters.startDate ? new Date(filters.startDate) : undefined,
    endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    limit: 100,
  });

  const { data: count = 0 } = (trpc.audit.count.useQuery as any)({
    userId: filters.userId ? parseInt(filters.userId) : undefined,
    action: filters.action || undefined,
    entityType: filters.entityType || undefined,
    startDate: filters.startDate ? new Date(filters.startDate) : undefined,
    endDate: filters.endDate ? new Date(filters.endDate) : undefined,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      userId: '',
      action: '',
      entityType: '',
      startDate: '',
      endDate: '',
    });
  };

  const actionLabels: Record<string, string> = {
    'create_user': 'Criar Usuário',
    'update_user': 'Atualizar Usuário',
    'delete_user': 'Deletar Usuário',
    'change_password': 'Alterar Senha',
    'reset_password': 'Reset de Senha',
    'create_post': 'Criar Post',
    'update_post': 'Atualizar Post',
    'delete_post': 'Deletar Post',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auditoria de Ações</h1>
        <p className="text-muted-foreground">Visualize e filtre todas as ações realizadas no sistema</p>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">ID do Usuário</label>
            <Input
              type="number"
              placeholder="ID do usuário"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ação</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">Todas as ações</option>
              <option value="create_user">Criar Usuário</option>
              <option value="update_user">Atualizar Usuário</option>
              <option value="delete_user">Deletar Usuário</option>
              <option value="change_password">Alterar Senha</option>
              <option value="reset_password">Reset de Senha</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Entidade</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={filters.entityType}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
            >
              <option value="">Todos os tipos</option>
              <option value="user">Usuário</option>
              <option value="post">Post</option>
              <option value="category">Categoria</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Inicial</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Final</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleClearFilters} variant="outline">
            Limpar Filtros
          </Button>
        </div>
      </Card>

      {/* Logs */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Logs de Auditoria ({count} registros)
          </h2>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Carregando logs...</p>
        ) : logs && logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Data/Hora</th>
                  <th className="text-left py-2 px-2">Usuário ID</th>
                  <th className="text-left py-2 px-2">Ação</th>
                  <th className="text-left py-2 px-2">Tipo</th>
                  <th className="text-left py-2 px-2">Entidade ID</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </td>
                    <td className="py-2 px-2">{log.userId}</td>
                    <td className="py-2 px-2">
                      {actionLabels[log.action] || log.action}
                    </td>
                    <td className="py-2 px-2">{log.entityType}</td>
                    <td className="py-2 px-2">{log.entityId || '-'}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status === 'success' ? 'Sucesso' : 'Erro'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      {log.errorMessage && (
                        <span title={log.errorMessage} className="text-red-600 cursor-help">
                          ⚠️
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Nenhum log encontrado</p>
        )}
      </Card>
    </div>
  );
}
