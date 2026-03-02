import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Eye, Plus, Minus, Instagram, Facebook, Twitter, Youtube, Settings, ChevronDown } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { DynamicMenu } from "./DynamicMenu";
import { trpc } from "@/lib/trpc";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
  const [, navigate] = useLocation();
  const { highContrast, toggleHighContrast, increaseFontSize, decreaseFontSize } = useAccessibility();
  const { user, isAuthenticated } = useAuth();
  const { data: menuItems = [] } = trpc.menu.hierarchy.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header role="banner">
      {/* Skip Navigation */}
      <a href="#main-content" className="skip-nav">
        Pular para o conteúdo principal
      </a>

      {/* Top Bar - Gov.br style */}
      <div className="w-full text-white text-xs" style={{ backgroundColor: '#000000' }}>
        <div className="container flex items-center justify-between py-1.5">
          <div className="flex items-center gap-3">
            <a href="https://rj.gov.br" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium" aria-label="Portal rj.gov.br">
              rj.gov
            </a>
            <div className="flex items-center gap-2">
              <a href="https://www.instagram.com/degaserj" target="_blank" rel="noopener noreferrer" aria-label="Instagram do DEGASE" className="hover:opacity-80">
                <Instagram size={14} />
              </a>
              <a href="https://www.facebook.com/degaserj" target="_blank" rel="noopener noreferrer" aria-label="Facebook do DEGASE" className="hover:opacity-80">
                <Facebook size={14} />
              </a>
              <a href="https://twitter.com/RjDegase" target="_blank" rel="noopener noreferrer" aria-label="Twitter do DEGASE" className="hover:opacity-80">
                <Twitter size={14} />
              </a>
              <a href="https://www.youtube.com/@tvdegase" target="_blank" rel="noopener noreferrer" aria-label="YouTube do DEGASE" className="hover:opacity-80">
                <Youtube size={14} />
              </a>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="https://transparencia.rj.gov.br" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Portal da Transparência
            </a>
            <a href="/transparencia" className="hover:underline">
              Acesso à Informação
            </a>
            <button
              onClick={toggleHighContrast}
              className="hover:underline flex items-center gap-1"
              aria-label={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
            >
              <Eye size={12} />
              Acessibilidade
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="w-full text-white" style={{ backgroundColor: "var(--degase-blue-medium)" }}>
        <div className="container flex items-center justify-between py-3 gap-4">
          {/* Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-md transition-colors shrink-0"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo DEGASE */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="DEGASE - Página Inicial">
            <img src="https://www.rj.gov.br/degase/sites/default/files/brasao-degase-300.png" alt="DEGASE - Departamento Geral de Ações Socioeducativas" className="h-12 md:h-14 object-contain" />
            <div className="hidden sm:block">
              <div className="text-[10px] uppercase tracking-wider opacity-80">Governo do Estado</div>
              <div className="text-lg font-bold leading-tight">DEGASE</div>
              <div className="text-[9px] opacity-70">Departamento Geral de Ações Socioeducativas</div>
            </div>
          </Link>

          {/* Logo Governo RJ - Center */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <img src="https://www.rj.gov.br/degase/sites/default/themes/rjgov/imagens/logo-gov-footer.png" alt="Governo do Estado do Rio de Janeiro" className="h-10 object-contain" />
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 shrink-0">
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite aqui para buscar..."
                className="px-3 py-1.5 rounded-l-md text-sm w-48 lg:w-64 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#333333",
                  borderRight: "1px solid var(--degase-gold)",
                  focusRing: "2px solid var(--degase-gold)",
                }}
                aria-label="Campo de busca do site"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-r-md text-sm font-medium flex items-center gap-1 hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: '#397ff0',
                  color: '#f7f7f7',
                }}
                aria-label="Executar busca"
              >
                <Search size={16} />
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </form>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-md"
              aria-label="Abrir busca"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite para buscar..."
                className="flex-1 px-3 py-2 rounded-l-md text-sm focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#333333",
                  borderRight: "1px solid var(--degase-gold)",
                }}
                aria-label="Campo de busca do site"
                autoFocus
              />
              <button type="submit" className="px-4 py-2 rounded-r-md text-sm font-medium flex items-center gap-1 hover:opacity-90 transition-opacity" style={{ backgroundColor: "var(--degase-gold)", color: "var(--degase-blue-dark)" }}>
                <Search size={16} />
                Buscar
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      {menuOpen && (
        <div className="w-full text-white shadow-lg" style={{ backgroundColor: "var(--degase-blue-accent)" }}>
          <div className="container py-4">
            <DynamicMenu
              items={menuItems}
              onItemClick={() => setMenuOpen(false)}
              isHierarchical={true}
            />
            {isAuthenticated && (
              <div className="border-t border-white/20 mt-4 pt-4">
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2 hover:bg-white/10 rounded-md transition-colors font-medium">
                  Painel Administrativo
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accessibility Floating Bar */}
      <div className="fixed right-0 top-1/3 z-50 flex flex-col gap-1" role="toolbar" aria-label="Ferramentas de acessibilidade">
        <button
          onClick={toggleHighContrast}
          className="p-2 text-white rounded-l-md shadow-md text-xs"
          style={{ backgroundColor: "var(--degase-blue-light)" }}
          aria-label={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
          title={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
        >
          <Eye size={18} />
        </button>
        <button
          onClick={increaseFontSize}
          className="p-2 text-white rounded-l-md shadow-md text-xs"
          style={{ backgroundColor: "var(--degase-blue-light)" }}
          aria-label="Aumentar tamanho da fonte"
          title="Aumentar fonte"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={decreaseFontSize}
          className="p-2 text-white rounded-l-md shadow-md text-xs"
          style={{ backgroundColor: "var(--degase-blue-light)" }}
          aria-label="Diminuir tamanho da fonte"
          title="Diminuir fonte"
        >
          <Minus size={18} />
        </button>
        <button
          onClick={() => setAccessibilityPanelOpen(true)}
          className="p-2 text-white rounded-l-md shadow-md text-xs"
          style={{ backgroundColor: "var(--degase-blue-light)" }}
          aria-label="Abrir painel de acessibilidade completo"
          title="Acessibilidade"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Accessibility Panel Modal */}
      <AccessibilityPanel
        isOpen={accessibilityPanelOpen}
        onClose={() => setAccessibilityPanelOpen(false)}
      />
    </header>
  );
}
