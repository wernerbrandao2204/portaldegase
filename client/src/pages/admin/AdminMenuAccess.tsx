import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';

const ROLES = [
  { value: 'user', label: 'Usuário' },
  { value: 'contributor', label: 'Contribuidor' },
  { value: 'admin', label: 'Administrador' },
];

export default function AdminMenuAccess() {
  const [selectedRole, setSelectedRole] = useState<string>('contributor');
  const [selectedMenuItems, setSelectedMenuItems] = useState<Set<number>>(new Set());
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch menu items
  const { data: menuItems = [] } = trpc.menu.list.useQuery();

  // Fetch permissions for selected role
  const { data: permissions } = trpc.menuPermissions.getByRole.useQuery(
    { role: selectedRole },
    { enabled: !!selectedRole }
  );

  // Update permissions mutation
  const updatePermissionsMutation = trpc.menuPermissions.updateBatch.useMutation({
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  // Update selected items when permissions change
  useEffect(() => {
    if (permissions?.allowedMenuItems) {
      setSelectedMenuItems(new Set(permissions.allowedMenuItems));
    }
  }, [permissions]);

  const handleToggleMenuItem = (menuItemId: number) => {
    const newSet = new Set(selectedMenuItems);
    if (newSet.has(menuItemId)) {
      newSet.delete(menuItemId);
    } else {
      newSet.add(menuItemId);
    }
    setSelectedMenuItems(newSet);
  };

  const handleSavePermissions = () => {
    updatePermissionsMutation.mutate({
      role: selectedRole,
      menuItemIds: Array.from(selectedMenuItems),
      canAccess: true,
    });
  };

  const handleSelectAll = () => {
    if (selectedRole === 'admin') {
      return;
    }
    setSelectedMenuItems(new Set(menuItems.map(item => item.id)));
  };

  const handleDeselectAll = () => {
    setSelectedMenuItems(new Set());
  };

  const renderMenuTree = (items: typeof menuItems, level: number = 0): React.ReactNode => {
    return items.map((item) => {
      const children = items.filter(i => i.parentId === item.id);

      return (
        <div key={item.id}>
          <div style={{ paddingLeft: `${level * 20}px` }} className="flex items-center gap-3 py-2">
            {selectedRole !== 'admin' && (
              <Checkbox
                checked={selectedMenuItems.has(item.id)}
                onCheckedChange={() => handleToggleMenuItem(item.id)}
              />
            )}
            <span className={selectedRole === 'admin' ? 'text-gray-500' : ''}>
              {item.label} {item.isColumnTitle && '(Coluna)'}
            </span>
          </div>
          {children.length > 0 && renderMenuTree(children, level + 1)}
        </div>
      );
    });
  };

  // Filter root items (no parent)
  const rootMenuItems = menuItems.filter(item => !item.parentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Controle de Acesso do Menu</h1>
        <p className="text-gray-600 mt-2">
          Configure quais itens do menu cada perfil pode acessar. Administradores têm acesso irrestrito.
        </p>
      </div>

      {saveSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-green-900">✓ Permissões de menu atualizadas com sucesso</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Selecione o Perfil</CardTitle>
          <CardDescription>
            Escolha o perfil para configurar suas permissões de menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRole === 'admin' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-blue-900">
              ℹ️ O perfil <strong>Administrador</strong> tem acesso irrestrito a todos os itens de menu.
              Não é possível modificar suas permissões.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Itens de Menu</CardTitle>
          <CardDescription>
            Selecione quais itens este perfil pode acessar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedRole !== 'admin' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                Selecionar Tudo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
              >
                Desselecionar Tudo
              </Button>
            </div>
          )}

          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
            {rootMenuItems.length > 0 ? (
              renderMenuTree(rootMenuItems)
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhum item de menu disponível</p>
            )}
          </div>

          {selectedRole !== 'admin' && (
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedMenuItems(new Set(permissions?.allowedMenuItems || []))}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePermissions}
                disabled={updatePermissionsMutation.isPending}
              >
                {updatePermissionsMutation.isPending ? 'Salvando...' : 'Salvar Permissões'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
