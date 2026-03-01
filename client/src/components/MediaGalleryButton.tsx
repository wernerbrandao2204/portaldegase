import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image, FileText, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
  id: number;
  title: string;
  url: string;
  fileType: "image" | "video";
  mimeType: string;
}

interface MediaGalleryButtonProps {
  onInsertImage?: (url: string, alt: string) => void;
  onInsertDocument?: (url: string, name: string) => void;
}

export function MediaGalleryButton({ onInsertImage, onInsertDocument }: MediaGalleryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"images" | "documents">("images");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Mock data - em produção, viria de uma query tRPC
  const mockImages: MediaItem[] = [
    {
      id: 1,
      title: "Imagem 1",
      url: "https://via.placeholder.com/300x200?text=Imagem+1",
      fileType: "image",
      mimeType: "image/jpeg",
    },
    {
      id: 2,
      title: "Imagem 2",
      url: "https://via.placeholder.com/300x200?text=Imagem+2",
      fileType: "image",
      mimeType: "image/jpeg",
    },
  ];

  const mockDocuments: MediaItem[] = [
    {
      id: 3,
      title: "Documento 1.pdf",
      url: "https://example.com/doc1.pdf",
      fileType: "video",
      mimeType: "application/pdf",
    },
    {
      id: 4,
      title: "Relatório 2024.docx",
      url: "https://example.com/relatorio.docx",
      fileType: "video",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  ];

  const handleCopyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copiada!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsertImage = (item: MediaItem) => {
    if (onInsertImage) {
      onInsertImage(item.url, item.title);
      setIsOpen(false);
      toast.success("Imagem inserida!");
    }
  };

  const handleInsertDocument = (item: MediaItem) => {
    if (onInsertDocument) {
      onInsertDocument(item.url, item.title);
      setIsOpen(false);
      toast.success("Documento inserido!");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1"
      >
        <Image size={14} /> Galeria de Mídia
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Galeria de Mídia</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab("images")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                tab === "images" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              <Image size={16} /> Imagens
            </button>
            <button
              onClick={() => setTab("documents")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                tab === "documents" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              <FileText size={16} /> Documentos
            </button>
          </div>

          {tab === "images" && (
            <div className="grid grid-cols-3 gap-4">
              {mockImages.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2 space-y-2">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleInsertImage(item)}
                        className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Inserir
                      </button>
                      <button
                        onClick={() => handleCopyUrl(item.url, item.id)}
                        className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                      >
                        {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "documents" && (
            <div className="space-y-2">
              {mockDocuments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <FileText size={20} className="text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.mimeType}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleInsertDocument(item)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Inserir
                    </button>
                    <button
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                    >
                      {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
