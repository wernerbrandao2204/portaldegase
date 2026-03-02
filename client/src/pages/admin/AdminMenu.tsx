import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Edit2, GripVertical, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function AdminMenu() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    label: "",
    linkType: "internal" as "internal" | "external",
    internalPageId: "",
    externalUrl: "",
    parentId: "",
    openInNewTab: false,
    isColumnTitle: false,
  });

  const menuQuery = trpc.menu.list.useQuery();
  const pagesQuery = trpc.pages.list.useQuery();
  const createMutation = trpc.menu.create.useMutation();
  const updateMutation = trpc.menu.update.useMutation();
  const deleteMutation = trpc.menu.delete.useMutation();
  const reorderMutation = trpc.menu.reorder.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label.trim()) {
      toast.error("Label é obrigatório");
      return;
    }

    if (formData.linkType === "internal" && !formData.internalPageId) {
      toast.error("Selecione uma página para links internos");
      return;
    }

    if (formData.linkType === "external" && !formData.externalUrl) {
      toast.error("URL é obrigatória para links externos");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          label: formData.label,
          linkType: formData.linkType,
          internalPageId: formData.internalPageId ? parseInt(formData.internalPageId) : undefined,
          externalUrl: formData.externalUrl || undefined,
          parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
          openInNewTab: formData.openInNewTab,
          isColumnTitle: formData.isColumnTitle,
        });
        toast.success("Item de menu atualizado");
        setEditingId(null);
      } else {
        await createMutation.mutateAsync({
          label: formData.label,
          linkType: formData.linkType,
          internalPageId: formData.internalPageId ? parseInt(formData.internalPageId) : undefined,
          externalUrl: formData.externalUrl || undefined,
          parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
          openInNewTab: formData.openInNewTab,
          isColumnTitle: formData.isColumnTitle,
        });
        toast.success("Item de menu criado");
      }
      
      setFormData({
        label: "",
        linkType: "internal",
        internalPageId: "",
        externalUrl: "",
        parentId: "",
        openInNewTab: false,
        isColumnTitle: false,
      });
      menuQuery.refetch();
    } catch (error) {
      toast.error("Erro ao salvar item de menu");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      label: item.label,
      linkType: item.linkType,
      internalPageId: item.internalPageId?.toString() || "",
      externalUrl: item.externalUrl || "",
      parentId: item.parentId?.toString() || "",
      openInNewTab: item.openInNewTab,
      isColumnTitle: item.isColumnTitle || false,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este item?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Item de menu deletado");
        menuQuery.refetch();
      } catch (error) {
        toast.error("Erro ao deletar item");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      label: "",
      linkType: "internal",
      internalPageId: "",
      externalUrl: "",
      parentId: "",
      openInNewTab: false,
      isColumnTitle: false,
    });
  };

  const toggleCategory = (id: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const renderMenuItems = (items: any[], parentId: number | null = null, level = 0) => {
    const filtered = items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (filtered.length === 0) return null;

    return (
      <>
        {filtered.map(item => {
          const hasChildren = items.some(child => child.parentId === item.id);
          const isExpanded = expandedCategories.has(item.id);
          const marginLeft = level * 24;

          return (
            <div key={item.id}>
              <div className="border rounded-lg p-4 mb-3 hover:bg-gray-50 transition-colors" style={{ marginLeft: `${marginLeft}px` }}>
                <div className="flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move flex-shrink-0" />
                  
                  {hasChildren && (
                    <button
                      onClick={() => toggleCategory(item.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                      aria-label={isExpanded ? "Recolher" : "Expandir"}
                    >
                      <ChevronRight
                        size={16}
                        className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>
                  )}
                  {!hasChildren && <div className="w-7 flex-shrink-0" />}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {hasChildren && <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">CATEGORIA</span>}
                      <h4 className="font-medium truncate">{item.label}</h4>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {item.linkType === "internal" ? "Link Interno" : "Link Externo"}
                      {item.linkType === "external" && ` - ${item.externalUrl}`}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {hasChildren && isExpanded && renderMenuItems(items, item.id, level + 1)}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Menu</h1>
        <p className="text-gray-600">Adicione, edite e organize os itens do menu principal com suporte a categorias aninhadas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar Item de Menu" : "Novo Item de Menu"}</CardTitle>
          <CardDescription>
            Configure um novo item de menu ou edite um existente. Itens sem pai são categorias principais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label *</label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ex: Notícias, Sobre, Contato"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Link *</label>
              <Select
                value={formData.linkType}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, linkType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Link Interno (Página)</SelectItem>
                  <SelectItem value="external">Link Externo (URL)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.linkType === "internal" && (
              <div>
                <label className="block text-sm font-medium mb-1">Página *</label>
                <Select
                  value={formData.internalPageId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, internalPageId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma página" />
                  </SelectTrigger>
                  <SelectContent>
                    {pagesQuery.data?.map((page: any) => (
                      <SelectItem key={page.id} value={page.id.toString()}>
                        {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.linkType === "external" && (
              <div>
                <label className="block text-sm font-medium mb-1">URL *</label>
                <Input
                  value={formData.externalUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, externalUrl: e.target.value })
                  }
                  placeholder="https://exemplo.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Categoria Pai (opcional)</label>
              <Select
                value={formData.parentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma (item principal)" />
                </SelectTrigger>
                <SelectContent>
                  {menuQuery.data
                    ?.filter((item: any) => item.id !== editingId && item.isColumnTitle)
                    .map((item: any) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="columnTitle"
                checked={formData.isColumnTitle}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isColumnTitle: checked as boolean })
                }
              />
              <label htmlFor="columnTitle" className="text-sm font-medium cursor-pointer">
                É Título da Coluna (sem link, texto BOLD)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="newTab"
                checked={formData.openInNewTab}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, openInNewTab: checked as boolean })
                }
              />
              <label htmlFor="newTab" className="text-sm font-medium cursor-pointer">
                Abrir em nova aba
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Atualizar" : "Criar"} Item
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens do Menu</CardTitle>
          <CardDescription>
            Organize seus itens de menu em categorias. Clique em um item para expandir subcategorias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {menuQuery.isLoading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : menuQuery.data && menuQuery.data.length > 0 ? (
            <div className="space-y-2">
              {renderMenuItems(menuQuery.data)}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum item de menu criado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
