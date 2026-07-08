import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Download, FileText, BarChart3, Star, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminDocuments() {
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [showFeaturedReorder, setShowFeaturedReorder] = useState(false);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editingDocName, setEditingDocName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibility, setVisibility] = useState<"site" | "intranet" | "both">("site");

  const utils = trpc.useUtils();
  const { data: documents, isLoading: documentsLoading } = trpc.documents.list.useQuery();
  const { data: categories } = trpc.documentCategories.list.useQuery();

  const uploadMutation = trpc.upload.image.useMutation();
  const createDocumentMutation = trpc.documents.create.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      toast.success("Documento enviado com sucesso!");
      resetForm();
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const deleteDocumentMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      toast.success("Documento deletado!");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const createCategoryMutation = trpc.documentCategories.create.useMutation({
    onSuccess: () => {
      utils.documentCategories.list.invalidate();
      toast.success("Categoria criada!");
      setCategoryName("");
      setCategoryDescription("");
      setShowCategoryForm(false);
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const deleteCategoryMutation = trpc.documentCategories.delete.useMutation({
    onSuccess: () => {
      utils.documentCategories.list.invalidate();
      toast.success("Categoria deletada!");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const toggleFeaturedMutation = trpc.documents.toggleFeatured.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      utils.documents.getFeatured.invalidate();
      toast.success("Status de destaque atualizado!");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const updateDocumentNameMutation = trpc.documents.updateName.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      toast.success("Nome do documento atualizado!");
      setEditingDocId(null);
      setEditingDocName("");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const reorderMutation = trpc.documents.reorderFeatured.useMutation({
    onSuccess: () => {
      utils.documents.list.invalidate();
      utils.documents.getFeatured.invalidate();
      toast.success("Ordem de documentos atualizada!");
      setShowFeaturedReorder(false);
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setDocumentName("");
    setDocumentDescription("");
    setSelectedCategory(null);
    setDocumentFile(null);
    setVisibility("site");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 40 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 40MB.");
      return;
    }

    setDocumentFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!documentName.trim()) {
      toast.error("Nome do documento é obrigatório.");
      return;
    }

    if (!selectedCategory) {
      toast.error("Selecione uma categoria.");
      return;
    }

    if (!documentFile) {
      toast.error("Selecione um arquivo.");
      return;
    }

    setIsUploading(true);
    try {
      const buffer = await documentFile.arrayBuffer();
      // Usando o novo endpoint trpc.upload.file para documentos
      const result = await utils.client.upload.file.mutate({
        file: new Uint8Array(buffer),
        filename: documentFile.name,
        mimetype: documentFile.type,
        category: 'documents',
      });

      await createDocumentMutation.mutateAsync({
        name: documentName,
        description: documentDescription || undefined,
        categoryId: selectedCategory,
        fileUrl: result.url,
        fileKey: documentFile.name,
        fileSize: documentFile.size,
        mimeType: documentFile.type,
        visibility,
      });
    } catch (error) {
      toast.error("Erro ao fazer upload do documento.");
    } finally {
      setIsUploading(false);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  const filteredDocuments = documents?.filter((doc: any) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const documentsByCategory = filteredDocuments?.reduce((acc, item: any) => {
    if (!item.document_categories) return acc;
    const categoryId = item.document_categories.id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: item.document_categories,
        documents: [],
      };
    }
    acc[categoryId].documents.push(item);
    return acc;
  }, {} as Record<number, any>) || {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--degase-blue-dark)" }}>Documentos</h1>
        <div className="flex gap-2 flex-1 mx-4">
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="flex gap-2">
          {/* ✅ Usando <a> com caminho absoluto para evitar conflito /degase/degase/ */}
          <a href="https://www.rj.gov.br/degase/admin/documentos/estatisticas">
            <Button variant="outline" style={{ borderColor: "var(--degase-blue-dark)", color: "var(--degase-blue-dark)" }}>
              <BarChart3 size={16} className="mr-1" /> Estatísticas
            </Button>
          </a>
          <Button onClick={() => setShowCategoryForm(true)} variant="outline" style={{ borderColor: "var(--degase-blue-dark)", color: "var(--degase-blue-dark)" }}>
            <Plus size={16} className="mr-1" /> Nova Categoria
          </Button>
          <Button onClick={() => setShowForm(true)} style={{ backgroundColor: "var(--degase-blue-dark)" }}>
            <Plus size={16} className="mr-1" /> Novo Documento
          </Button>
        </div>
      </div>

      {showCategoryForm && (
        <form onSubmit={(e) => {
          e.preventDefault();
          createCategoryMutation.mutate({ name: categoryName, description: categoryDescription });
        }} className="bg-white p-5 rounded-lg border mb-6 space-y-3">
          <h2 className="font-bold">Nova Categoria</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Categoria *</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md h-20"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" style={{ backgroundColor: "var(--degase-blue-dark)" }}>Criar</Button>
            <Button type="button" variant="outline" onClick={() => setShowCategoryForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg border mb-6 space-y-3">
          <h2 className="font-bold">Novo Documento</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Documento *</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md h-20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoria *</label>
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Arquivo *  (Máx 40MB)</label>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            {documentFile && (
              <p className="text-xs text-gray-500 mt-2">
                Arquivo selecionado: {documentFile.name} ({formatFileSize(documentFile.size)})
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Visibilidade</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="site">Site DEGASE somente</option>
              <option value="intranet">Intranet somente</option>
              <option value="both">Site e Intranet</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isUploading} style={{ backgroundColor: "var(--degase-blue-dark)" }}>
              {isUploading ? "Enviando..." : "Enviar"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--degase-blue-dark)" }}>Documentos em Destaque</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFeaturedReorder(!showFeaturedReorder)}
          >
            {showFeaturedReorder ? "Fechar" : "Reordenar"}
          </Button>
        </div>
        {showFeaturedReorder && documents && (
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600 mb-3">Arraste os documentos para reordenar. Clique em Salvar quando terminar.</p>
            {documents
              .filter((doc: any) => doc.isFeatured)
              .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((doc: any, index: number) => (
                <div
                  key={doc.id}
                  draggable
                  onDragStart={() => setDraggedItem(doc.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedItem && draggedItem !== doc.id) {
                      const orders = documents
                        .filter((d: any) => d.isFeatured)
                        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
                        .map((d: any, i: number) => ({
                          id: d.id === draggedItem ? doc.id : d.id === doc.id ? draggedItem : d.id,
                          sortOrder: i,
                        }));
                      reorderMutation.mutate({ orders });
                    }
                  }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border cursor-move hover:bg-gray-100 transition-colors"
                >
                  <GripVertical size={18} className="text-gray-400" />
                  <FileText size={16} className="text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-gray-500">Ordem: {index + 1}</p>
                  </div>
                </div>
              ))}
            {documents.filter((doc: any) => doc.isFeatured).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum documento em destaque</p>
            )}
          </div>
        )}
      </div>

      {editingDocId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Editar Nome do Documento</h2>
            <input
              type="text"
              value={editingDocName}
              onChange={(e) => setEditingDocName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-4"
              placeholder="Nome do documento"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingDocId(null);
                  setEditingDocName("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (editingDocName.trim()) {
                    updateDocumentNameMutation.mutate({
                      id: editingDocId,
                      name: editingDocName,
                    });
                  }
                }}
                style={{ backgroundColor: "var(--degase-blue-dark)" }}
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.values(documentsByCategory).map(({ category, documents }: any) => (
          <div key={category.id} className="bg-white rounded-lg border overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{category.name}</h3>
                {category.description && <p className="text-xs text-gray-500">{category.description}</p>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (confirm("Tem certeza que deseja deletar esta categoria? Todos os documentos nela serão mantidos, mas sem categoria.")) {
                    deleteCategoryMutation.mutate(category.id);
                  }
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="divide-y">
              {documents.map((doc: any) => (
                <div key={doc.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-gray-900">{doc.name}</p>
                        {doc.isFeatured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800">
                            Destaque
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          doc.visibility === 'intranet' ? 'bg-purple-100 text-purple-800' : 
                          doc.visibility === 'both' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {doc.visibility === 'intranet' ? 'Intranet' : doc.visibility === 'both' ? 'Site/Intranet' : 'Site'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize || 0)}</p>
                        <p className="text-xs text-gray-500">•</p>
                        <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeaturedMutation.mutate({ id: doc.id, featured: !doc.isFeatured })}
                      className={doc.isFeatured ? "text-yellow-600" : "text-gray-400"}
                    >
                      <Star size={16} fill={doc.isFeatured ? "currentColor" : "none"} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingDocId(doc.id);
                        setEditingDocName(doc.name);
                      }}
                    >
                      <Edit size={16} />
                    </Button>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <Download size={16} />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja deletar este documento?")) {
                          deleteDocumentMutation.mutate(doc.id);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  Nenhum documento nesta categoria.
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum documento encontrado</h3>
            <p className="text-gray-500 mt-1">Tente ajustar sua busca ou adicione um novo documento.</p>
            <Button onClick={() => setShowForm(true)} className="mt-6" style={{ backgroundColor: "var(--degase-blue-dark)" }}>
              <Plus size={16} className="mr-2" /> Novo Documento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
