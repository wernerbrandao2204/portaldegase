import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { GripVertical, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MenuItem {
  id: number;
  label: string;
  linkType: "internal" | "external" | "category";
  internalPageId?: number;
  externalUrl?: string;
  parentId?: number;
  sortOrder: number;
  children?: MenuItem[];
}

interface DraggableMenuListProps {
  items: MenuItem[];
  onReorder: (items: MenuItem[]) => Promise<void>;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}

export default function DraggableMenuList({
  items,
  onReorder,
  onEdit,
  onDelete,
}: DraggableMenuListProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      setIsLoading(true);
      const newItems = Array.from(items);
      const draggedItem = newItems.find((item) => item.id.toString() === draggableId);

      if (draggedItem) {
        newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, draggedItem);

        const reorderedItems = newItems.map((item, index) => ({
          ...item,
          sortOrder: index,
        }));

        await onReorder(reorderedItems);
        toast.success("Menu reordenado com sucesso");
      }
    } catch (error) {
      toast.error("Erro ao reordenar menu");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMenuItems = (menuItems: MenuItem[], level = 0) => {
    return menuItems.map((item, index) => (
      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`p-3 mb-2 bg-white border rounded-lg transition-colors ${
              snapshot.isDragging ? "bg-blue-50 border-blue-300" : "border-gray-200"
            }`}
            style={{
              marginLeft: `${level * 20}px`,
              ...provided.draggableProps.style,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                  <GripVertical size={16} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500">
                    {item.linkType === "internal" && "Link Interno"}
                    {item.linkType === "external" && "Link Externo"}
                    {item.linkType === "category" && "Categoria"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(item)}
                  disabled={isLoading}
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(item.id)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            {item.children && item.children.length > 0 && (
              <div className="mt-2">{renderMenuItems(item.children, level + 1)}</div>
            )}
          </div>
        )}
      </Draggable>
    ));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="menu-list">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-4 rounded-lg transition-colors ${
              snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50"
            }`}
          >
            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum item de menu criado</p>
            ) : (
              renderMenuItems(items)
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
