import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { MarkdownPreview } from "@/components/MarkdownPreview";

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminPages() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [showInMenu, setShowInMenu] = useState(false);
  const [menuLabel, setMenuLabel] = useState("");
  const [tempPageId, setTempPageId] = useState<number | null>(null);
  const [visibility, setVisibility] = useState<"site" | "intranet" | "both">("site");

  const utils = trpc.useUtils();
  const { data: pages } = trpc.pages.list.useQuery();

  const createMutation = trpc.pages.create.useMutation({
    onSuccess: (data) => { 
      utils.pages.list.invalidate(); 
      toast.success("Página criada!"); 
      setEditingId(data.id);
      setTempPageId(null);
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const updateMutation = trpc.pages.update.useMutation({
    onSuccess: () => { utils.pages.list.invalidate(); toast.success("Página atualizada!"); resetForm(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const deleteMutation = trpc.pages.delete.useMutation({
    onSuccess: () => { utils.pages.list.invalidate(); toast.success("Página excluída!"); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });



  function resetForm() {
    setShowEditor(false); setEditingId(null); setTempPageId(null); setTitle(""); setSlug(""); setContent(""); setExcerpt(""); setStatus("draft"); setShowInMenu(false); setMenuLabel(""); setVisibility("site");
  }

  function editPage(page: any) {
    setEditingId(page.id); setTitle(page.title); setSlug(page.slug); setContent(page.content); setExcerpt(page.excerpt || ""); setStatus(page.status); setShowInMenu(page.showInMenu); setMenuLabel(page.menuLabel || ""); setVisibility(page.visibility || "site"); setShowEditor(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { toast.error("Título e conteúdo são obrigatórios."); return; }
    const data = { title, slug: slug || slugify(title), content, excerpt: excerpt || undefined, status: status as any, showInMenu, menuLabel: menuLabel || undefined, visibility };
    if (editingId) { updateMutation.mutate({ id: editingId, ...data }); }
    else { 
      // Para nova página, criar com status draft primeiro para permitir adicionar blocos
      createMutation.mutate(data);
    }
  }

  if (showEditor) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--degase-blue-dark)" }}>{editingId ? "Editar Página" : "Nova Página"}</h1>

          </div>
          <div className="flex gap-2">

            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="auto-gerado" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Resumo</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full px-3 py-2 border rounded-md h-20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-3 py-2 border rounded-md">
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visibilidade</label>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as any)} className="w-full px-3 py-2 border rounded-md">
                <option value="site">Site DEGASE somente</option>
                <option value="intranet">Intranet somente</option>
                <option value="both">Site e Intranet</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Conteúdo *</label>
            <p className="text-xs text-gray-500 mb-2">Use Markdown. Exemplo: ![alt](url) para imagens, [texto](url) para links</p>
            <div className="mb-2">
              <MarkdownPreview content={content} />
            </div>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-3 py-2 border rounded-md h-64 font-mono text-sm" placeholder="Escreva o conteúdo da página em Markdown..." required />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" style={{ backgroundColor: "var(--degase-blue-dark)" }}>
              {editingId ? "Atualizar" : "Criar Página"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </form>
        {editingId && (
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-lg font-bold mb-4">Blocos Personalizados</h2>
            <p className="text-sm text-gray-600">Editor de blocos em desenvolvimento.</p>
          </div>
        )}


      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--degase-blue-dark)" }}>Páginas Institucionais</h1>
        <Button onClick={() => setShowEditor(true)} style={{ backgroundColor: "var(--degase-blue-dark)" }}>
          <Plus size={16} className="mr-1" /> Nova Página
        </Button>
      </div>

      {pages && pages.length > 0 ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm">{page.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">/{page.slug}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${page.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {page.status === "published" ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => editPage(page)} className="p-1.5 hover:bg-gray-200 rounded"><Edit size={14} /></button>
                      <button onClick={() => { if (confirm("Excluir esta página?")) deleteMutation.mutate({ id: page.id }); }} className="p-1.5 hover:bg-red-100 rounded text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Nenhuma página criada.</p>
          <Button onClick={() => setShowEditor(true)} style={{ backgroundColor: "var(--degase-blue-dark)" }}>
            <Plus size={16} className="mr-1" /> Criar Primeira Página
          </Button>
        </div>
      )}

    </div>
  );
}
