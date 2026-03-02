import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TagSelectorProps {
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
}

export default function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const { data: allTags, isLoading, refetch } = trpc.categories.listTags.useQuery();
  const createTagMutation = trpc.categories.createTag.useMutation();

  const handleAddTag = async (tagId: number) => {
    if (!selectedTags.includes(tagId)) {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      toast.error("Digite um nome para a tag");
      return;
    }

    setIsCreatingTag(true);
    try {
      const result = await createTagMutation.mutateAsync({
        name: newTagName.trim(),
        slug: newTagName.trim().toLowerCase().replace(/\s+/g, "-"),
      });
      
      toast.success("Tag criada com sucesso!");
      setNewTagName("");
      refetch();
      
      if (result) {
        handleAddTag(result);
      }
    } catch (error) {
      toast.error("Erro ao criar tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const selectedTagObjects = allTags?.filter(tag => selectedTags.includes(tag.id)) || [];
  const availableTags = allTags?.filter(tag => !selectedTags.includes(tag.id)) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>
          Selecione ou crie tags para categorizar esta notícia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tags Selecionadas */}
        {selectedTagObjects.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Tags Selecionadas</label>
            <div className="flex flex-wrap gap-2">
              {selectedTagObjects.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm text-white"
                  style={{ backgroundColor: "var(--degase-blue-dark)" }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:opacity-80"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulário de Nova Tag */}
        <form onSubmit={handleCreateTag} className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nome da nova tag..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{ borderColor: "var(--degase-gold)", focusRing: "2px solid var(--degase-gold)" }}
          />
          <Button
            type="submit"
            disabled={isCreatingTag}
            style={{ backgroundColor: "var(--degase-gold)" }}
            className="text-white hover:opacity-90"
          >
            {isCreatingTag ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
          </Button>
        </form>

        {/* Tags Disponíveis */}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="animate-spin" style={{ color: "var(--degase-blue-dark)" }} />
          </div>
        ) : availableTags.length > 0 ? (
          <div>
            <label className="block text-sm font-medium mb-2">Tags Disponíveis</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleAddTag(tag.id)}
                  className="px-3 py-1 rounded-full text-sm border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "var(--degase-gold)", color: "var(--degase-blue-dark)" }}
                >
                  + {tag.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
