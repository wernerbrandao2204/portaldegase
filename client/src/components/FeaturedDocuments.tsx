import { FileText, Download, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function FeaturedDocuments() {
  const { data: categories, isLoading: categoriesLoading } = trpc.documents.getCategories.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  
  const { data: documents, isLoading: documentsLoading } = trpc.documents.getFeaturedByCategory.useQuery(
    { categoryId: selectedCategory }
  );
  
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

  const isLoading = categoriesLoading || documentsLoading;

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8" />
            <div className="flex gap-2 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded w-24" />
              ))}
            </div>
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

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: "var(--degase-blue-light)" }}>
          Documentos em Destaque
        </h2>
        <div className="w-16 h-1 mx-auto mb-8" style={{ backgroundColor: "var(--degase-blue-dark)" }} />

        {/* Filtros por categoria */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === undefined
                  ? "text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              style={selectedCategory === undefined ? { backgroundColor: "var(--degase-blue-dark)" } : {}}
            >
              Todos
            </button>
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? "text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                style={selectedCategory === category.id ? { backgroundColor: "var(--degase-blue-dark)" } : {}}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {documents && documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum documento cadastrado nesta categoria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {documents.map((doc: any) => (
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
        )}

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
