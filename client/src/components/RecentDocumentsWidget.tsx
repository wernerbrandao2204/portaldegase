import { FileText, Download, TrendingUp, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function RecentDocumentsWidget() {
  const { data: recentDocuments, isLoading: recentLoading } = trpc.documents.getRecent.useQuery();
  const { data: mostDownloaded, isLoading: downloadLoading } = trpc.documents.getMostDownloaded.useQuery();

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Documentos Recentes */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--degase-blue-dark)" }}>
            <Clock size={20} />
            Documentos Recentes
          </h3>
        </div>

        {recentLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : recentDocuments && recentDocuments.length > 0 ? (
          <div className="space-y-3">
            {recentDocuments.slice(0, 5).map((doc: any) => (
              <div key={doc.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                <FileText size={18} className="text-blue-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
            {/* ✅ Usando <a> com caminho absoluto para evitar conflito /degase/degase/ */}
            <a href="https://www.rj.gov.br/degase/admin/documentos">
              <button className="w-full mt-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50">
                Ver todos os documentos
              </button>
            </a>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Nenhum documento enviado ainda</p>
          </div>
        )}
      </div>

      {/* Documentos Mais Baixados */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--degase-blue-dark)" }}>
            <TrendingUp size={20} />
            Mais Baixados
          </h3>
        </div>

        {downloadLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : mostDownloaded && mostDownloaded.length > 0 ? (
          <div className="space-y-3">
            {mostDownloaded.slice(0, 5).map((doc: any, index: number) => (
              <div key={doc.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: "var(--degase-blue-dark)" }}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Download size={14} className="text-green-600" />
                    <span className="text-xs text-gray-600">{doc.downloadCount || 0} downloads</span>
                  </div>
                </div>
              </div>
            ))}
            {/* ✅ Usando <a> com caminho absoluto para evitar conflito /degase/degase/ */}
            <a href="https://www.rj.gov.br/degase/admin/documentos/estatisticas">
              <button className="w-full mt-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50">
                Ver estatísticas completas
              </button>
            </a>
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Nenhum download registrado ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
