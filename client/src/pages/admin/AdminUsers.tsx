import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Search, Plus, Lock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminUsers() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { user: currentUser } = useAuth();
  
  // Form state
  const [openId, setOpenId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [functionalId, setFunctionalId] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [role, setRole] = useState<"user" | "admin" | "contributor">("user");
  const [isImporting, setIsImporting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const listUsers = trpc.users.list.useQuery();
  const listCategories = trpc.categories.list.useQuery();
  
  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      listUsers.refetch();
      resetForm();
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      listUsers.refetch();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const changePasswordMutation = trpc.users.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setIsChangingPassword(null);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário deletado com sucesso!");
      listUsers.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const importCSVMutation = trpc.users.importCSV.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.success} usuários importados com sucesso!`);
      if (result.failed > 0) {
        toast.warning(`${result.failed} usuários falharam na importação`);
      }
      listUsers.refetch();
      setIsImporting(false);
      setCsvFile(null);
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  function resetForm() {
    setEditingId(null);
    setIsCreating(false);
    setIsChangingPassword(null);
    setOpenId("");
    setName("");
    setEmail("");
    setFunctionalId("");
    setPassword("");
    setNewPassword("");
    setCategoryId(undefined);
    setRole("user");
  }

  function editUser(user: any) {
    setIsCreating(false);
    setIsChangingPassword(null);
    setEditingId(user.id);
    setName(user.name || "");
    setEmail(user.email || "");
    setFunctionalId(user.functionalId || "");
    setCategoryId(user.categoryId || undefined);
    setRole(user.role);
  }

  function handleCreateClick() {
    setIsCreating(true);
    setEditingId(null);
    setIsChangingPassword(null);
    setOpenId("");
    setName("");
    setEmail("");
    setFunctionalId("");
    setPassword("");
    setCategoryId(undefined);
    setRole("user");
  }

  function handleChangePasswordClick(userId: number) {
    setIsChangingPassword(userId);
    setNewPassword("");
    setEditingId(null);
    setIsCreating(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (isCreating) {
      if (!openId.trim()) {
        toast.error("OpenID é obrigatório para criar um novo usuário.");
        return;
      }
      if (!password.trim()) {
        toast.error("Senha é obrigatória para criar um novo usuário.");
        return;
      }
      const data = { openId, name: name || undefined, email: email || undefined, functionalId: functionalId || undefined, password, role, categoryId };
      createUserMutation.mutate(data);
    } else if (isChangingPassword) {
      if (!newPassword.trim()) {
        toast.error("Nova senha é obrigatória.");
        return;
      }
      changePasswordMutation.mutate({ userId: isChangingPassword, newPassword });
    } else {
      if (!editingId) {
        toast.error("Selecione um usuário para editar.");
        return;
      }
      const data = { name, email, functionalId: functionalId || undefined, categoryId, role };
      updateUserMutation.mutate({ id: editingId, ...data });
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      await deleteUserMutation.mutateAsync({ id });
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error("Selecione um arquivo CSV");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvContent = event.target?.result as string;
      importCSVMutation.mutate({ csvContent });
    };
    reader.readAsText(csvFile);
  };

  if (listUsers.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Carregando usuários...</div>
      </div>
    );
  }

  const filteredUsers = listUsers.data?.filter((user: any) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.functionalId?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const isContributor = currentUser?.role === 'contributor';
  const editingUser = editingId ? listUsers.data?.find((u: any) => u.id === editingId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--degase-blue-dark)" }}>Cadastro de Usuários</h1>
        <p className="text-gray-600 mt-2">Gerencie usuários, roles e permissões</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User List */}
        <div className="lg:col-span-2 bg-white rounded-lg border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Usuários do Sistema</h2>
              {!isContributor && (
                <div className="flex gap-2">
                  <Button onClick={() => setIsImporting(!isImporting)} size="sm" style={{ backgroundColor: "#4a7c59" }}>
                    Importar CSV
                  </Button>
                  <Button onClick={handleCreateClick} size="sm" style={{ backgroundColor: "var(--degase-blue-dark)" }}>
                    <Plus size={16} className="mr-2" />
                    Novo Usuário
                  </Button>
                </div>
              )}
            </div>
            {isImporting && (
              <form onSubmit={handleImportCSV} className="mb-4 p-4 bg-gray-50 rounded border">
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">Selecione arquivo CSV</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="w-full border rounded p-2 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">Formato esperado: email, name (opcional), functionalId (opcional), category (opcional)</p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" style={{ backgroundColor: "#4a7c59" }}>
                    Importar
                  </Button>
                  <Button type="button" onClick={() => setIsImporting(false)} size="sm" variant="outline">
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou ID funcional..."
                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">ID Funcional</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nível</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{user.name || "Sem nome"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.functionalId || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          user.role === "admin" ? "bg-red-100 text-red-700" :
                          user.role === "contributor" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {user.role === "admin" ? "Admin" : user.role === "contributor" ? "Contribuidor" : "Usuário"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <CategoryName categoryId={user.categoryId} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isContributor && (
                            <button onClick={() => editUser(user)} className="p-1.5 hover:bg-gray-200 rounded" title="Editar">
                              <Edit2 size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleChangePasswordClick(user.id)} 
                            className="p-1.5 hover:bg-blue-100 rounded text-blue-600" 
                            title="Alterar Senha"
                          >
                            <Lock size={14} />
                          </button>
                          {!isContributor && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 hover:bg-red-100 rounded text-red-600"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit/Create Panel */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">
            {isCreating ? "Criar Novo Usuário" : isChangingPassword ? "Alterar Senha" : editingId ? "Editar Usuário" : "Selecione um usuário"}
          </h2>
          
          {isCreating || editingId || isChangingPassword ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isChangingPassword ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nova Senha *</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                  </div>
                </>
              ) : isCreating ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">OpenID *</label>
                    <input
                      type="text"
                      value={openId}
                      onChange={(e) => setOpenId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="ID único do usuário"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">ID Funcional</label>
                    <input
                      type="text"
                      value={functionalId}
                      onChange={(e) => setFunctionalId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="Ex: 12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Senha *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Nível de Acesso *</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                    >
                      <option value="user">Usuário</option>
                      <option value="contributor">Contribuidor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Categoria {role === "contributor" ? "*" : "(Opcional)"}</label>
                    <select
                      value={categoryId ?? ""}
                      onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      required={role === "contributor"}
                    >
                      <option value="">Selecionar categoria</option>
                      {listCategories.data?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : editingId ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      required
                      disabled={isContributor && currentUser?.id !== editingId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      required
                      disabled={isContributor && currentUser?.id !== editingId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">ID Funcional</label>
                    <input
                      type="text"
                      value={functionalId}
                      onChange={(e) => setFunctionalId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="Ex: 12345"
                      disabled={isContributor}
                    />
                  </div>

                  {!isContributor && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Nível de Acesso *</label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value as any)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="user">Usuário</option>
                          <option value="contributor">Contribuidor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>

                      {role === "contributor" && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Categoria *</label>
                          <select
                            value={categoryId ?? ""}
                            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                          >
                            <option value="">Selecionar categoria</option>
                            {listCategories.data?.map((cat: any) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : null}

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending || changePasswordMutation.isPending} className="flex-1"
                  style={{ backgroundColor: "var(--degase-blue-dark)" }}>
                  {createUserMutation.isPending || updateUserMutation.isPending || changePasswordMutation.isPending ? "Salvando..." : isCreating ? "Criar" : isChangingPassword ? "Alterar Senha" : "Atualizar"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              {isContributor 
                ? "Selecione um usuário para alterar sua senha"
                : "Selecione um usuário na lista para editar suas informações ou clique em \"Novo Usuário\" para criar um novo"}
            </p>
          )}

          <div className="mt-6 pt-6 border-t space-y-3">
            <h3 className="font-medium text-sm">Descrição dos Níveis</h3>
            <div className="text-xs space-y-2">
              <div className="border-l-4 border-red-500 pl-3">
                <p className="font-medium">Administrador</p>
                <p className="text-gray-600">Acesso total ao sistema</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium">Contribuidor</p>
                <p className="text-gray-600">Acesso limitado à categoria</p>
              </div>
              <div className="border-l-4 border-gray-500 pl-3">
                <p className="font-medium">Usuário</p>
                <p className="text-gray-600">Acesso somente leitura</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryName({ categoryId }: { categoryId?: number | null }) {
  const { data: categories } = trpc.categories.list.useQuery();
  if (!categoryId) return <span>-</span>;
  const category = categories?.find((c: any) => c.id === categoryId);
  return <span>{category?.name || "-"}</span>;
}
