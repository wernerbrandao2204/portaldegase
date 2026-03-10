import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Download, FileText, BarChart3, Star, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

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
          <Link href="/admin/documentos/estatisticas">
            <Button variant="outline" style={{ borderColor: "var(--degase-blue-dark)", color: "var(--degase-blue-dark)" }}>
              <BarChart3 size={16} className="mr-1" /> Estatísticas
            </Button>
          </Link>
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
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingDocId(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (editingDocName.trim()) {
                    updateDocumentNameMutation.mutate({ id: editingDocId, name: editingDocName });
                  } else {
                    toast.error("Nome não pode estar vazio");
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {documentsLoading ? (
        <p className="text-gray-500">Carregando documentos...</p>
      ) : Object.keys(documentsByCategory).length > 0 ? (
        <div className="space-y-6">
          {Object.values(documentsByCategory).map((group: any) => (
            <div key={group.category.id} className="bg-white rounded-lg border p-5">
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--degase-blue-dark)" }}>
                {group.category.name}
              </h2>
              {group.category.description && (
                <p className="text-sm text-gray-600 mb-4">{group.category.description}</p>
              )}
              <div className="space-y-2">
                {group.documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText size={20} className="text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingDocId(doc.id); setEditingDocName(doc.name); }}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                        title="Editar nome"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleFeaturedMutation.mutate({ id: doc.id, isFeatured: !doc.isFeatured })}
                        className={`p-1.5 rounded transition-colors ${doc.isFeatured ? "bg-yellow-100 text-yellow-600" : "hover:bg-yellow-100 text-gray-400 hover:text-yellow-600"}`}
                        title={doc.isFeatured ? "Remover de destaque" : "Adicionar a destaque"}
                      >
                        <Star size={16} fill={doc.isFeatured ? "currentColor" : "none"} />
                      </button>
                      <a href={doc.fileUrl} download className="p-1.5 hover:bg-blue-100 rounded text-blue-600">
                        <Download size={16} />
                      </a>
                      <button onClick={() => { if (confirm("Deletar?")) deleteDocumentMutation.mutate({ id: doc.id }); }} className="p-1.5 hover:bg-red-100 rounded text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Nenhum documento enviado ainda.</p>
      )}

      {categories && categories.length > 0 && (
        <div className="mt-8 bg-white p-5 rounded-lg border">
          <h3 className="font-bold mb-4">Categorias de Documentos</h3>
          <div className="space-y-2">
            {categories.map((cat: any) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
                </div>
                <button onClick={() => { if (confirm("Deletar?")) deleteCategoryMutation.mutate({ id: cat.id }); }} className="p-1.5 hover:bg-red-100 rounded text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
