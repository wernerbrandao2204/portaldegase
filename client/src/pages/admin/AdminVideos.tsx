import { useState } from "react";
import imageCompression from 'browser-image-compression';
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Star, Upload } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminVideos() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [visibility, setVisibility] = useState<"site" | "intranet" | "both">("site");

  const utils = trpc.useUtils();
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = trpc.upload.image.useMutation();
  const { data: videos } = trpc.videos.list.useQuery();

  const createMutation = trpc.videos.create.useMutation({
    onSuccess: () => { utils.videos.list.invalidate(); toast.success("Vídeo adicionado!"); resetForm(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });
  const updateMutation = trpc.videos.update.useMutation({
    onSuccess: () => { utils.videos.list.invalidate(); toast.success("Vídeo atualizado!"); resetForm(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });
  const deleteMutation = trpc.videos.delete.useMutation({
    onSuccess: () => { utils.videos.list.invalidate(); toast.success("Vídeo excluído!"); },
  });

  function resetForm() { setShowForm(false); setEditingId(null); setTitle(""); setYoutubeUrl(""); setDescription(""); setIsFeatured(false); setThumbnailUrl(""); setThumbnailPreview(null); setVisibility("site"); }

  function editVideo(v: any) { setEditingId(v.id); setTitle(v.title); setYoutubeUrl(v.youtubeUrl); setDescription(v.description || ""); setIsFeatured(v.isFeatured); setThumbnailUrl(v.thumbnailUrl || ""); setVisibility(v.visibility || "site"); setShowForm(true); }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    setIsUploading(true);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const buffer = await compressedFile.arrayBuffer();
      const result = await uploadMutation.mutateAsync({
        file: new Uint8Array(buffer),
        filename: compressedFile.name,
        mimetype: compressedFile.type,
      });
      setThumbnailUrl(result.url);
      toast.success("Thumbnail enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer upload do thumbnail.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim()) { toast.error("Título e URL do YouTube são obrigatórios."); return; }
    if (editingId) { updateMutation.mutate({ id: editingId, title, youtubeUrl, description: description || undefined, thumbnailUrl: thumbnailUrl || undefined, isFeatured, visibility }); }
    else { createMutation.mutate({ title, youtubeUrl, description: description || undefined, thumbnailUrl: thumbnailUrl || undefined, isFeatured, visibility }); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--degase-blue-dark)" }}>Vídeos</h1>
        <Button onClick={() => setShowForm(true)} style={{ backgroundColor: "var(--degase-blue-dark)" }}><Plus size={16} className="mr-1" /> Novo Vídeo</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg border mb-6 space-y-3">
          <h2 className="font-bold">{editingId ? "Editar Vídeo" : "Novo Vídeo"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Título *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" required /></div>
            <div><label className="block text-sm font-medium mb-1">URL do YouTube *</label><input type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="w-full px-3 py-2 border rounded-md" required placeholder="https://www.youtube.com/watch?v=..." /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Descrição</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md h-20" /></div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Thumbnail do Vídeo (Máx 10MB, Ideal: 1280x720px)</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailUpload}
                disabled={isUploading}
                className="flex-1 px-3 py-2 border rounded-md"
              />
              {isUploading && <span className="text-sm text-gray-500">Enviando...</span>}
            </div>
            {thumbnailPreview && (
              <div className="mt-3">
                <p className="text-xs font-medium mb-2">Preview:</p>
                <img src={thumbnailPreview} alt="Preview" className="w-full max-w-md h-auto rounded-md border" />
              </div>
            )}
            {thumbnailUrl && <p className="text-xs text-green-600 mt-1">✓ Thumbnail enviado</p>}
            <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, WebP | Tamanho ideal: 1280x720 pixels | Será comprimido automaticamente</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="videoFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <label htmlFor="videoFeatured" className="text-sm">Destaque na página inicial</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visibilidade</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="site">Site DEGASE somente</option>
                <option value="intranet">Intranet somente</option>
                <option value="both">Site e Intranet</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" style={{ backgroundColor: "var(--degase-blue-dark)" }}>{editingId ? "Atualizar" : "Adicionar"}</Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </form>
      )}

      {videos && videos.length > 0 ? (
        <div className="space-y-3">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border">
              <div className="flex-1">
                <p className="font-medium text-sm flex items-center gap-1">
                  {v.isFeatured && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                  {v.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{v.youtubeUrl}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => editVideo(v)} className="p-1.5 hover:bg-gray-200 rounded"><Edit size={14} /></button>
                <button onClick={() => { if (confirm("Excluir?")) deleteMutation.mutate({ id: v.id }); }} className="p-1.5 hover:bg-red-100 rounded text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg"><p className="text-gray-500">Nenhum vídeo cadastrado.</p></div>
      )}
    </div>
  );
}
