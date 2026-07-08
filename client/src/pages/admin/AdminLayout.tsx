import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, FolderOpen, BookOpen,
  Image, Video, Building2, Shield, Settings, LogOut,
  Menu, X, ArrowLeft, File, List, Layers
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

// ✅ Menu com caminhos absolutos para evitar conflito de rotas /degase/degase/
const MENU_ITEMS_BY_ROLE = {
  admin: [
    { href: "https://www.rj.gov.br/degase/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "https://www.rj.gov.br/degase/admin/posts", label: "Notícias", icon: FileText },
    { href: "https://www.rj.gov.br/degase/admin/categorias", label: "Categorias", icon: FolderOpen },
    { href: "https://www.rj.gov.br/degase/admin/paginas", label: "Páginas", icon: BookOpen },
    { href: "https://www.rj.gov.br/degase/admin/banners", label: "Banners", icon: Image },
    { href: "https://www.rj.gov.br/degase/admin/videos", label: "Vídeos", icon: Video },
    { href: "https://www.rj.gov.br/degase/admin/servicos", label: "Serviços", icon: Building2 },
    { href: "https://www.rj.gov.br/degase/admin/servicos/analytics", label: "Analytics de Serviços", icon: Building2 },
    { href: "https://www.rj.gov.br/degase/admin/documentos", label: "Documentos", icon: File },
    { href: "https://www.rj.gov.br/degase/admin/menu", label: "Menu", icon: List },
    { href: "https://www.rj.gov.br/degase/admin/intranet", label: "Intranet", icon: Layers },
    { href: "https://www.rj.gov.br/degase/admin/unidades", label: "Unidades", icon: Building2 },
    { href: "https://www.rj.gov.br/degase/admin/transparencia", label: "Transparência", icon: Shield },
    { href: "https://www.rj.gov.br/degase/admin/usuarios", label: "Usuários", icon: Shield },
    { href: "https://www.rj.gov.br/degase/admin/configuracoes", label: "Configurações", icon: Settings },
  ],
  contributor: [
    { href: "https://www.rj.gov.br/degase/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "https://www.rj.gov.br/degase/admin/posts", label: "Notícias", icon: FileText },
    { href: "https://www.rj.gov.br/degase/admin/categorias", label: "Categorias", icon: FolderOpen },
    { href: "https://www.rj.gov.br/degase/admin/banners", label: "Banners", icon: Image },
    { href: "https://www.rj.gov.br/degase/admin/videos", label: "Vídeos", icon: Video },
    { href: "https://www.rj.gov.br/degase/admin/documentos", label: "Documentos", icon: File },
  ]
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  // Atualiza o path atual para marcar item ativo sem depender exclusivamente do wouter
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.href);
    }
  }, []);

  const navItems = user?.role ? MENU_ITEMS_BY_ROLE[user.role as keyof typeof MENU_ITEMS_BY_ROLE] || [] : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--degase-blue-dark)" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      // Redirecionamento absoluto para evitar duplicidade
      window.location.href = "https://www.rj.gov.br/degase/admin/login";
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 text-white transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-auto`}
        style={{ backgroundColor: "var(--degase-blue-dark)" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {/* Link para o site (público) - Usando caminho absoluto */}
          <a href="https://www.rj.gov.br/degase/" className="flex items-center gap-2">
            <img src="/degase/uploads/brasao-degase-300.png" alt="DEGASE" className="h-8" />
            <div>
              <div className="font-bold text-sm">DEGASE</div>
              <div className="text-[10px] opacity-70">Painel Administrativo</div>
            </div>
          </a>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }} aria-label="Menu administrativo">
          {navItems.map((item) => {
            // Verifica se é o item ativo comparando com a URL completa ou o final dela
            const isActive = currentPath === item.href || 
                            (item.href !== "https://www.rj.gov.br/degase/admin" && currentPath.startsWith(item.href));
            
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive ? "bg-white/15 font-medium" : "hover:bg-white/10 opacity-80"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Usuário"}</p>
              <p className="text-[10px] opacity-60">
                {user?.role === "admin" ? "Administrador" : user?.role === "contributor" ? "Colaborador" : "Usuário"}
              </p>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            <a href="https://www.rj.gov.br/degase/" className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs hover:bg-white/10 rounded">
              <ArrowLeft size={12} /> Site
            </a>
            <button onClick={() => logout()} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs hover:bg-white/10 rounded">
              <LogOut size={12} /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded">
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-sm" style={{ color: "var(--degase-blue-dark)" }}>DEGASE Admin</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
