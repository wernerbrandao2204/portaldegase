import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit2, Eye, EyeOff, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import imageCompression from 'browser-image-compression';
import { toast } from "sonner";

export default function AdminServices() {
  const { data: services, refetch } = trpc.services.listAll.useQuery();
  const createMutation = trpc.services.create.useMutation();
  const updateMutation = trpc.services.update.useMutation();
  const deleteMutation = trpc.services.delete.useMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = trpc.upload.image.useMutation();
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    link: "",
    color: "#0066CC",
    sortOrder: 0,
    isActive: true,
    visibility: "site" as "site" | "intranet" | "both",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      resetForm();
      refetch();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
    }
  };

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      icon: service.icon,
      link: service.link,
      color: service.color,
      sortOrder: service.sortOrder,
      isActive: service.isActive,
      visibility: service.visibility || "site",
    });
    setEditingId(service.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este serviço?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
      } catch (error) {
        console.error("Erro ao deletar serviço:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "",
      link: "",
      color: "#0066CC",
      sortOrder: 0,
      isActive: true,
      visibility: "site",
    });
    setEditingId(null);
    setIsFormOpen(false);
    setIconPreview(null);
  };

  async function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setIconPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setIsUploading(true);
    try {
      const options = { maxSizeMB: 0.5, maxWidthOrHeight: 256, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);
      const buffer = await compressedFile.arrayBuffer();
      const result = await uploadMutation.mutateAsync({
        file: new Uint8Array(buffer),
        filename: compressedFile.name,
        mimetype: compressedFile.type,
      });
      setFormData({ ...formData, icon: result.url });
      toast.success("Icone enviado!");
    } catch (error) {
      toast.error("Erro ao fazer upload");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Serviços</h1>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
          <Plus size={20} /> Novo Serviço
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Editar Serviço" : "Novo Serviço"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Serviço</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ícone do Serviço</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="https://... ou faça upload"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <IconUploadButton onUpload={(url) => setFormData({ ...formData, icon: url })} />
              </div>
              {formData.icon && (
                <div className="mt-2">
                  <img src={formData.icon} alt="Preview" className="h-16 w-16 object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Link do Serviço</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cor do Card</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-20 cursor-pointer border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ordem de Exibição</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Ativo
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Visibilidade</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="site">Site DEGASE somente</option>
                  <option value="intranet">Intranet somente</option>
                  <option value="both">Site e Intranet</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="default">
                {editingId ? "Atualizar" : "Criar"} Serviço
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {services && services.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">Nome</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Ícone</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Link</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Cor</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service: any) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{service.name}</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <img src={service.icon} alt={service.name} className="h-8 w-8 object-contain" />
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <a href={service.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate max-w-xs">
                      {service.link}
                    </a>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: service.color }} />
                      <span className="text-sm">{service.color}</span>
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {service.isActive ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <Eye size={16} /> Ativo
                      </span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1">
                        <EyeOff size={16} /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Deletar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Nenhum serviço cadastrado. Clique em "Novo Serviço" para criar um.
        </div>
      )}
    </div>
  );
}


function IconUploadButton({ onUpload }: { onUpload: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = trpc.upload.image.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const arrayBuffer = await fetch(base64).then(r => r.arrayBuffer());
      const result = await uploadMutation.mutateAsync({
        file: new Uint8Array(arrayBuffer),
        filename: file.name,
        mimetype: file.type,
      });

      onUpload(result.url);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        className="gap-2"
      >
        <Upload size={16} />
        {isUploading ? "Enviando..." : "Upload"}
      </Button>
    </label>
  );
}
