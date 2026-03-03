import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import {
  LayoutDashboard, FileText, FolderOpen, BookOpen,
  Image, Video, Building2, Shield, Settings, LogOut,
  Menu, X, ArrowLeft, File, List
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Notícias", icon: FileText },
  { href: "/admin/categorias", label: "Categorias", icon: FolderOpen },
  { href: "/admin/paginas", label: "Páginas", icon: BookOpen },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/videos", label: "Vídeos", icon: Video },
  { href: "/admin/servicos", label: "Serviços", icon: Building2 },
  { href: "/admin/servicos/analytics", label: "Analytics de Serviços", icon: Building2 },
  { href: "/admin/documentos", label: "Documentos", icon: File },
  { href: "/admin/menu", label: "Menu", icon: List },
  { href: "/admin/unidades", label: "Unidades", icon: Building2 },
  { href: "/admin/transparencia", label: "Transparência", icon: Shield },
  { href: "/admin/usuarios", label: "Usuários", icon: Shield },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Permissões de menu são apenas para o menu público, não para o menu CMS (admin)
  // Todos os usuários autenticados têm acesso a todas as páginas do admin

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--degase-blue-dark)" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <Shield size={48} className="mx-auto mb-4" style={{ color: "var(--degase-blue-dark)" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--degase-blue-dark)" }}>Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">Faça login para acessar o painel administrativo do DEGASE.</p>
          <a href={getLoginUrl()}>
            <Button style={{ backgroundColor: "var(--degase-blue-dark)" }}>Fazer Login</Button>
          </a>
          <div className="mt-4">
            <Link href="/" className="text-sm hover:underline" style={{ color: "var(--degase-blue-light)" }}>
              <ArrowLeft size={14} className="inline mr-1" /> Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    );
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
          <Link href="/" className="flex items-center gap-2">
            <img src="https://www.rj.gov.br/degase/sites/default/files/brasao-degase-300.png" alt="DEGASE" className="h-8" />
            <div>
              <div className="font-bold text-sm">DEGASE</div>
              <div className="text-[10px] opacity-70">Painel Administrativo</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1" aria-label="Menu administrativo">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive ? "bg-white/15 font-medium" : "hover:bg-white/10 opacity-80"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
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
              <p className="text-[10px] opacity-60">{user?.role === "admin" ? "Administrador" : "Editor"}</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            <Link href="/" className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs hover:bg-white/10 rounded">
              <ArrowLeft size={12} /> Site
            </Link>
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
