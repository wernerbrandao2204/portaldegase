import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Edit2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function AdminMenu() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    linkType: "internal" as "internal" | "external",
    internalPageId: "",
    externalUrl: "",
    parentId: "",
    openInNewTab: false,
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
    });
  };

  const handleDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.index === destination.index) return;
    try {
      const itemId = parseInt(draggableId);
      const newOrder = destination.index + 1;
      await reorderMutation.mutateAsync({
        items: [{ id: itemId, parentId: null, sortOrder: newOrder }],
      });
      toast.success("Item reordenado com sucesso");
      menuQuery.refetch();
    } catch (error) {
      toast.error("Erro ao reordenar item");
    }
  };

  const renderMenuItems = (items: any[], level = 0) => {
    return items
      .filter(item => item.parentId === null)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(item => (
        <div key={item.id} className="border rounded-lg p-4 mb-3">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
            <div className="flex-1">
              <h4 className="font-medium">{item.label}</h4>
              <p className="text-sm text-gray-500">
                {item.linkType === "internal" ? "Link Interno" : "Link Externo"}
                {item.linkType === "external" && ` - ${item.externalUrl}`}
              </p>
            </div>
            <div className="flex gap-2">
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
      ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Menu</h1>
        <p className="text-gray-600">Adicione, edite e organize os itens do menu principal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar Item de Menu" : "Novo Item de Menu"}</CardTitle>
          <CardDescription>
            Configure um novo item de menu ou edite um existente
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
                  type="url"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Item Pai (Submenu)</label>
              <Select
                value={formData.parentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum (item principal)" />
                </SelectTrigger>
                <SelectContent>
                  {menuQuery.data?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.openInNewTab}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, openInNewTab: checked as boolean })
                }
              />
              <label className="text-sm">Abrir em nova aba</label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
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
            {menuQuery.data?.length || 0} itens no menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {menuQuery.isLoading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : menuQuery.data?.length === 0 ? (
            <p className="text-gray-500">Nenhum item de menu criado ainda</p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="menu-items">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {renderMenuItems(menuQuery.data || [])}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
