"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit2, GripVertical, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableMenuItem({ item, items, onEdit, onDelete, onToggle, isExpanded, level }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: `${level * 24}px`,
  };

  const hasChildren = items.some((child: any) => child.parentId === item.id);

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`border rounded-lg p-4 mb-3 transition-all ${isDragging ? "bg-blue-100 shadow-lg" : "hover:bg-gray-50"}`}>
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>

          {hasChildren && (
            <button
              onClick={() => onToggle(item.id)}
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
              {hasChildren && (
                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
                  CATEGORIA
                </span>
              )}
              <h4 className="font-medium truncate">{item.label}</h4>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-semibold">
                #{item.sortOrder}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {item.linkType === "internal" ? "Link Interno" : "Link Externo"}
              {item.linkType === "external" && ` - ${item.externalUrl}`}
            </p>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminMenu() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    label: "",
    linkType: "internal" as "internal" | "external",
    internalPageId: "" as string,
    externalUrl: "",
    parentId: "" as string,
    sortOrder: "0" as string,
    openInNewTab: false,
    isColumnTitle: false,
  });

  const menuQuery = trpc.menu.list.useQuery();
  const pagesQuery = trpc.pages.list.useQuery();
  const createMutation = trpc.menu.create.useMutation();
  const updateMutation = trpc.menu.update.useMutation();
  const deleteMutation = trpc.menu.delete.useMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    try {
      const items = menuQuery.data || [];
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Atualizar sortOrder baseado na nova posição
      const itemToMove = items[oldIndex];
      const newSortOrder = newIndex;

      await updateMutation.mutateAsync({
        id: itemToMove.id,
        sortOrder: newSortOrder,
      });

      toast.success("Ordem atualizada");
      menuQuery.refetch();
    } catch (error) {
      toast.error("Erro ao reordenar item");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label.trim()) {
      toast.error("Label é obrigatório");
      return;
    }

    if (!formData.isColumnTitle) {
      if (formData.linkType === "internal" && !formData.internalPageId) {
        toast.error("Selecione uma página para links internos");
        return;
      }

      if (formData.linkType === "external" && !formData.externalUrl) {
        toast.error("URL é obrigatória para links externos");
        return;
      }
    }

    try {
      const payload = {
        label: formData.label,
        linkType: formData.linkType,
        internalPageId: formData.linkType === "internal" ? parseInt(formData.internalPageId) || 0 : 0,
        externalUrl: formData.linkType === "external" ? formData.externalUrl : "",
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined,
        sortOrder: parseInt(formData.sortOrder) || 0,
        openInNewTab: formData.openInNewTab,
        isColumnTitle: formData.isColumnTitle,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
        toast.success("Item atualizado");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Item criado");
      }

      setFormData({
        label: "",
        linkType: "internal",
        internalPageId: "",
        externalUrl: "",
        parentId: "",
        sortOrder: "0",
        openInNewTab: false,
        isColumnTitle: false,
      });
      setEditingId(null);
      menuQuery.refetch();
    } catch (error) {
      toast.error("Erro ao salvar item");
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      label: item.label,
      linkType: item.linkType,
      internalPageId: item.internalPageId || "",
      externalUrl: item.externalUrl || "",
      parentId: item.parentId ? item.parentId.toString() : "",
      sortOrder: item.sortOrder?.toString() || "0",
      openInNewTab: item.openInNewTab || false,
      isColumnTitle: item.isColumnTitle || false,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      label: "",
      linkType: "internal",
      internalPageId: "",
      externalUrl: "",
      parentId: "",
      sortOrder: "0",
      openInNewTab: false,
      isColumnTitle: false,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este item?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Item deletado");
      menuQuery.refetch();
    } catch (error) {
      toast.error("Erro ao deletar item");
    }
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
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (filtered.length === 0) return null;

    return (
      <>
        {filtered.map((item) => {
          const hasChildren = items.some((child) => child.parentId === item.id);
          const isExpanded = expandedCategories.has(item.id);

          return (
            <div key={item.id}>
              <SortableMenuItem
                item={item}
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={toggleCategory}
                isExpanded={isExpanded}
                level={level}
              />

              {hasChildren && isExpanded && renderMenuItems(items, item.id, level + 1)}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Item de Menu</CardTitle>
          <CardDescription>
            Configure um novo item de menu ou edite um existente. Itens sem pai são categorias principais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Label *</label>
              <Input
                placeholder="Ex: Notícias, Sobre, Contato"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Link *</label>
              <Select value={formData.linkType} onValueChange={(value) => setFormData({ ...formData, linkType: value as "internal" | "external" })}>
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
                <label className="block text-sm font-medium mb-2">Página *</label>
                <Select value={formData.internalPageId} onValueChange={(value) => setFormData({ ...formData, internalPageId: value })}>
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
                <label className="block text-sm font-medium mb-2">URL *</label>
                <Input
                  placeholder="https://exemplo.com"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Categoria Pai (opcional)</label>
              <Select value={formData.parentId || "none"} onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? "" : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma (item principal)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (item principal)</SelectItem>
                  {menuQuery.data?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ordem de Exibição</label>
              <Input
                type="number"
                placeholder="0"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Número menor = exibido primeiro. Deixe em branco para 0.</p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="columnTitle"
                checked={formData.isColumnTitle}
                onCheckedChange={(checked) => setFormData({ ...formData, isColumnTitle: checked as boolean })}
              />
              <label htmlFor="columnTitle" className="text-sm font-medium cursor-pointer">
                É Título da Coluna (sem link, texto BOLD)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="newTab"
                checked={formData.openInNewTab}
                onCheckedChange={(checked) => setFormData({ ...formData, openInNewTab: checked as boolean })}
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
            Arraste e solte para reordenar os itens. Clique para expandir subcategorias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {menuQuery.isLoading ? (
            <p className="text-gray-500">Carregando...</p>
          ) : menuQuery.data && menuQuery.data.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={menuQuery.data.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">{renderMenuItems(menuQuery.data)}</div>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-gray-500">Nenhum item de menu criado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
