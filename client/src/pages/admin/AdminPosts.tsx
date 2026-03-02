import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Search, Clock } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUploadButton from "@/components/ImageUploadButton";
import imageCompression from 'browser-image-compression';


function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminPosts() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [authorId, setAuthorId] = useState<number | undefined>();
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Filter state
  const [filterAuthorId, setFilterAuthorId] = useState<number | undefined>();

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.posts.list.useQuery({ limit: 50 });
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: users } = trpc.users.list.useQuery();

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => { utils.posts.list.invalidate(); toast.success("Notícia criada com sucesso!"); resetForm(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const updateMutation = trpc.posts.update.useMutation({
    onSuccess: () => { utils.posts.list.invalidate(); toast.success("Notícia atualizada!"); resetForm(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => { utils.posts.list.invalidate(); toast.success("Notícia excluída!"); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const uploadMutation = trpc.upload.image.useMutation();
  const saveDraftMutation = trpc.posts.saveDraft.useMutation();
  const getHistoryQuery = editingId ? trpc.posts.getHistory.useQuery({ postId: editingId }) : null;
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Autosave desabilitado para evitar mensagens repetidas

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Maximo 10MB.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Formato invalido. Use JPG, PNG ou WebP.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setFeaturedImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    setIsUploadingImage(true);

    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const buffer = await compressedFile.arrayBuffer();
      const result = await uploadMutation.mutateAsync({
        file: new Uint8Array(buffer),
        filename: compressedFile.name,
        mimetype: compressedFile.type,
      });
      setFeaturedImage(result.url);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer upload da imagem.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  function resetForm() {
    setShowEditor(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setExcerpt("");
    setFeaturedImage("");
    setFeaturedImagePreview(null);
    setCategoryId(undefined);
    setAuthorId(undefined);
    setStatus("draft");
    setIsFeatured(false);
  }

  function editPost(post: any) {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setExcerpt(post.excerpt || "");
    setFeaturedImage(post.featuredImage || "");
    setCategoryId(post.categoryId || undefined);
    setAuthorId(post.authorId || undefined);
    setStatus(post.status);
    setIsFeatured(post.isFeatured);
    setShowEditor(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Título e conteúdo são obrigatórios.");
      return;
    }
    const data = { title, content, excerpt: excerpt || undefined, featuredImage: featuredImage || undefined, categoryId, authorId, status, isFeatured };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate({ ...data, slug: slugify(title) });
    }
  }

  if (showEditor) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--degase-blue-dark)" }}>
              {editingId ? "Editar Notícia" : "Nova Notícia"}
            </h1>
          </div>
          <div className="flex gap-2">
            {editingId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
              >
                Histórico de Versões
              </Button>
            )}
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--degase-blue-light)" } as any}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Resumo</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 h-20"
              placeholder="Breve descrição da notícia..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Sem categoria</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Responsável</label>
              <select
                value={authorId ?? ""}
                onChange={(e) => setAuthorId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecionar responsável</option>
                {users?.map((user: any) => (
                  <option key={user.id} value={user.id}>{user.name || user.email}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Imagem Destacada (Maximo 10MB)</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
                className="flex-1 px-3 py-2 border rounded-md"
              />
              {isUploadingImage && <span className="text-sm text-gray-500">Enviando...</span>}
            </div>
            {featuredImagePreview && (
              <div className="mt-3">
                <p className="text-xs font-medium mb-2">Preview:</p>
                <img src={featuredImagePreview} alt="Preview" className="w-full max-w-md h-auto rounded-md border" />
              </div>
            )}
            {featuredImage && <p className="text-xs text-green-600 mt-1">Imagem enviada</p>}
            <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, WebP | Sera comprimida automaticamente</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="featured" className="text-sm">Destaque na página inicial</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Conteúdo *</label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              style={{ backgroundColor: "var(--degase-blue-dark)" }}>
              {(createMutation.isPending || updateMutation.isPending) ? "Salvando..." : editingId ? "Atualizar" : "Publicar"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </form>

        {showVersionHistory && getHistoryQuery && getHistoryQuery.data && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <h2 className="text-lg font-bold mb-4">Historico de Versoes</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getHistoryQuery.data.length > 0 ? (
                getHistoryQuery.data.map((version: any) => (
                  <div key={version.id} className="p-3 bg-white rounded border text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{version.changeDescription}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(version.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Nenhuma versao anterior</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--degase-blue-dark)" }}>Notícias e Comunicados</h1>
        <Button onClick={() => setShowEditor(true)} style={{ backgroundColor: "var(--degase-blue-dark)" }}>
          <Plus size={16} className="mr-1" /> Nova Notícia
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar notícias..."
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          />
        </div>
        <select
          value={filterAuthorId ?? ""}
          onChange={(e) => setFilterAuthorId(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">Todos os responsáveis</option>
          {users?.map((user: any) => (
            <option key={user.id} value={user.id}>{user.name || user.email}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Responsável</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Data</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Views</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{post.title}</p>
                    {post.isFeatured && <span className="text-xs text-yellow-600 font-medium">★ Destaque</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                    {post.authorId ? <AuthorDisplay authorId={post.authorId} /> : "-"}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      post.status === "published" ? "bg-green-100 text-green-700" :
                      post.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {post.status === "published" ? "Publicado" : post.status === "draft" ? "Rascunho" : "Arquivado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                    <span className="flex items-center gap-1"><Eye size={12} /> {post.viewCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => editPost(post)} className="p-1.5 hover:bg-gray-200 rounded" title="Editar">
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta notícia?")) {
                            deleteMutation.mutate({ id: post.id });
                          }
                        }}
                        className="p-1.5 hover:bg-red-100 rounded text-red-600"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Nenhuma notícia encontrada.</p>
          <Button onClick={() => setShowEditor(true)} style={{ backgroundColor: "var(--degase-blue-dark)" }}>
            <Plus size={16} className="mr-1" /> Criar Primeira Notícia
          </Button>
        </div>
      )}
    </div>
  );
}

function AuthorDisplay({ authorId }: { authorId: number }) {
  const { data: user } = trpc.users.getById.useQuery({ id: authorId });
  return <span>{user?.name || user?.email || "Desconhecido"}</span>;
}
