import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { LogOut, Menu, X, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Intranet() {
  const [, setLocation] = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [loginTime, setLoginTime] = useState<string>("");

  const { data: user } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => setLocation("/"),
  });

  const { data: posts } = trpc.posts.list.useQuery();
  const { data: banners } = trpc.banners.list.useQuery();
  const { data: videos } = trpc.videos.list.useQuery();
  const { data: documents } = trpc.documents.list.useQuery();
  const { data: services } = trpc.services.listAll.useQuery();

  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  useEffect(() => {
    const now = new Date();
    setLoginTime(now.toLocaleString("pt-BR"));
  }, []);

  if (!user) {
    return null;
  }

  // Filtrar conteúdo para Intranet (intranet ou both)
  const intranetPosts = posts?.filter(p => p.visibility === "intranet" || p.visibility === "both") || [];
  const intranetBanners = banners?.filter(b => b.visibility === "intranet" || b.visibility === "both") || [];
  const intranetVideos = videos?.filter(v => v.visibility === "intranet" || v.visibility === "both") || [];
  const intranetDocuments = documents?.filter(d => d.visibility === "intranet" || d.visibility === "both") || [];
  const intranetServices = services?.filter(s => s.visibility === "intranet" || s.visibility === "both") || [];

  return (
    <div style={{ backgroundColor: "#2d5a4a", minHeight: "100vh" }}>
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{ backgroundColor: "#2d5a4a" }}></div>
            <h1 className="text-2xl font-bold" style={{ color: "#2d5a4a" }}>DEGASE Intranet</h1>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="/intranet" className="text-gray-700 hover:text-gray-900 font-medium">Início</a>
            <a href="/intranet/noticias" className="text-gray-700 hover:text-gray-900 font-medium">Notícias</a>
            <a href="/intranet/documentos" className="text-gray-700 hover:text-gray-900 font-medium">Documentos</a>
            <a href="/intranet/videos" className="text-gray-700 hover:text-gray-900 font-medium">Vídeos</a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="gap-2"
            >
              <LogOut size={16} /> Sair
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setShowMenu(!showMenu)}
          >
            {showMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden bg-gray-50 border-t p-4 space-y-3">
            <a href="/intranet" className="block text-gray-700 hover:text-gray-900 font-medium">Início</a>
            <a href="/intranet/noticias" className="block text-gray-700 hover:text-gray-900 font-medium">Notícias</a>
            <a href="/intranet/documentos" className="block text-gray-700 hover:text-gray-900 font-medium">Documentos</a>
            <a href="/intranet/videos" className="block text-gray-700 hover:text-gray-900 font-medium">Vídeos</a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="w-full gap-2"
            >
              <LogOut size={16} /> Sair
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* User Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#2d5a4a" }}>
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{user.name || "Usuário"}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock size={16} />
                <span className="text-sm">Login às:</span>
              </div>
              <p className="text-sm font-medium text-gray-800">{loginTime}</p>
            </div>
          </div>
        </div>

        {/* Banners */}
        {intranetBanners.length > 0 && (
          <div className="mb-8 space-y-4">
            {intranetBanners.map((banner) => (
              <div key={banner.id} className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-64 object-cover"
                />
                <div className="bg-white p-4">
                  <h3 className="text-xl font-bold text-gray-800">{banner.title}</h3>
                  {banner.subtitle && <p className="text-gray-600">{banner.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notícias */}
        {intranetPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Notícias</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {intranetPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                    <a
                      href={`/intranet/noticias/${post.slug}`}
                      className="text-white font-medium text-sm px-4 py-2 rounded inline-block"
                      style={{ backgroundColor: "#2d5a4a" }}
                    >
                      Ler Mais
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vídeos */}
        {intranetVideos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Vídeos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {intranetVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{video.description}</p>
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-medium text-sm px-4 py-2 rounded inline-block"
                      style={{ backgroundColor: "#2d5a4a" }}
                    >
                      Assistir
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Documentos */}
        {intranetDocuments.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Documentos</h2>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-3">
                {intranetDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-medium text-gray-800">{doc.name}</h4>
                      {doc.description && <p className="text-sm text-gray-600">{doc.description}</p>}
                    </div>
                    <a
                      href={doc.fileUrl}
                      download
                      className="text-white font-medium text-sm px-4 py-2 rounded"
                      style={{ backgroundColor: "#2d5a4a" }}
                    >
                      Baixar
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Serviços */}
        {intranetServices.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Serviços</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {intranetServices.map((service) => (
                <a
                  key={service.id}
                  href={service.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition-shadow flex flex-col items-center text-center"
                  style={{ backgroundColor: service.color || "#2d5a4a" }}
                >
                  {service.icon && (
                    <img src={service.icon} alt={service.name} className="w-16 h-16 mb-4 object-contain" />
                  )}
                  <h3 className="text-lg font-bold">{service.name}</h3>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {intranetPosts.length === 0 && intranetVideos.length === 0 && intranetDocuments.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">Nenhum conteúdo disponível no momento.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>&copy; 2026 DEGASE. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
