import { FileText, Download, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function FeaturedDocuments() {
  const { data: documents, isLoading } = trpc.documents.getFeatured.useQuery();
  const recordDownload = trpc.documents.recordDownload.useMutation();

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  const handleDownload = (documentId: number) => {
    recordDownload.mutate({ documentId });
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--degase-blue-dark)" }}>
          Documentos em Destaque
        </h2>
        <p className="text-gray-600 mb-8">
          Acesse os documentos mais importantes e atualizados do DEGASE
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {documents.slice(0, 3).map((doc: any) => (
            <a
              key={doc.id}
              href={doc.fileUrl}
              download
              onClick={() => handleDownload(doc.id)}
              className="group"
            >
              <div className="h-40 rounded-lg p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FileText size={28} className="text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-white font-semibold text-sm group-hover:font-bold transition-all line-clamp-2">
                    {doc.name}
                  </h3>
                  <p className="text-white/80 text-xs mt-1">
                    {formatFileSize(doc.fileSize)}
                  </p>
                  <Download size={14} className="text-white/70 mx-auto mt-2 group-hover:text-white transition-all" />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="flex justify-center">
          <Link href="/documentos">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors text-white font-medium"
              style={{ backgroundColor: "var(--degase-blue-dark)" }}
            >
              Exibir mais documentos
              <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
