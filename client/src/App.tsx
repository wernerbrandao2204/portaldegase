import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";

// Public pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Legislation from "./pages/Legislation";
import Transparency from "./pages/Transparency";
import Contact from "./pages/Contact";
import Units from "./pages/Units";
import NewsList from "./pages/NewsList";
import NewsDetail from "./pages/NewsDetail";
import SearchResults from "./pages/SearchResults";
import InstitutionalPage from "./pages/InstitutionalPage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Documents from "./pages/Documents";
import Page from "./pages/Page";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminPages from "./pages/admin/AdminPages";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminServices from "./pages/admin/AdminServices";
import AdminServiceAnalytics from "./pages/admin/AdminServiceAnalytics";
import AdminUnits from "./pages/admin/AdminUnits";
import AdminTransparency from "./pages/admin/AdminTransparency";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminDocumentStats from "./pages/admin/AdminDocumentStats";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminMenuAccess from "./pages/admin/AdminMenuAccess";
import { ResetPassword } from "./pages/ResetPassword";
import { AdminAudit } from "./pages/admin/AdminAudit";

// Layout components
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import CookieBanner from "./components/CookieBanner";

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <CookieBanner />
    </div>
  );
}

function PublicPage({ component: Component }: { component: React.ComponentType }) {
  return (
    <PublicLayout>
      <Component />
    </PublicLayout>
  );
}

function AdminPage({ component: Component }: { component: React.ComponentType }) {
  return (
    <AdminLayout>
      <Component />
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/">{() => <PublicPage component={Home} />}</Route>
      <Route path="/sobre">{() => <PublicPage component={About} />}</Route>
      <Route path="/servicos">{() => <PublicPage component={Services} />}</Route>
      <Route path="/legislacao">{() => <PublicPage component={Legislation} />}</Route>
      <Route path="/transparencia">{() => <PublicPage component={Transparency} />}</Route>
      <Route path="/contato">{() => <PublicPage component={Contact} />}</Route>
      <Route path="/unidades">{() => <PublicPage component={Units} />}</Route>
      <Route path="/noticias">{() => <PublicPage component={NewsList} />}</Route>
      <Route path="/noticias/:slug">{() => <PublicPage component={NewsDetail} />}</Route>
      <Route path="/busca">{() => <PublicPage component={SearchResults} />}</Route>
      <Route path="/privacidade">{() => <PublicPage component={Privacy} />}</Route>
      <Route path="/termos">{() => <PublicPage component={Terms} />}</Route>
      <Route path="/pagina/:slug">{() => <PublicPage component={Page} />}</Route>
      <Route path="/documentos">{() => <PublicPage component={Documents} />}</Route>

      {/* Admin routes */}
      <Route path="/admin">{() => <AdminPage component={AdminDashboard} />}</Route>
      <Route path="/admin/posts">{() => <AdminPage component={AdminPosts} />}</Route>
      <Route path="/admin/categorias">{() => <AdminPage component={AdminCategories} />}</Route>
      <Route path="/admin/paginas">{() => <AdminPage component={AdminPages} />}</Route>
      <Route path="/admin/banners">{() => <AdminPage component={AdminBanners} />}</Route>
      <Route path="/admin/videos">{() => <AdminPage component={AdminVideos} />}</Route>
      <Route path="/admin/servicos">{() => <AdminPage component={AdminServices} />}</Route>
      <Route path="/admin/servicos/analytics">{() => <AdminPage component={AdminServiceAnalytics} />}</Route>
      <Route path="/admin/unidades">{() => <AdminPage component={AdminUnits} />}</Route>
      <Route path="/admin/transparencia">{() => <AdminPage component={AdminTransparency} />}</Route>
      <Route path="/admin/usuarios">{() => <AdminPage component={AdminUsers} />}</Route>
      <Route path="/admin/configuracoes">{() => <AdminPage component={AdminSettings} />}</Route>
      <Route path="/admin/documentos">{() => <AdminPage component={AdminDocuments} />}</Route>
      <Route path="/admin/documentos/estatisticas">{() => <AdminPage component={AdminDocumentStats} />}</Route>
      <Route path="/admin/documents">{() => <AdminPage component={AdminDocuments} />}</Route>
      <Route path="/admin/documents/stats">{() => <AdminPage component={AdminDocumentStats} />}</Route>
      <Route path="/admin/menu">{() => <AdminPage component={AdminMenu} />}</Route>
      <Route path="/admin/permissoes">{() => <AdminPage component={AdminMenuAccess} />}</Route>
      <Route path="/admin/auditoria">{() => <AdminPage component={AdminAudit} />}</Route>

      {/* Public routes - continued */}
      <Route path="/reset-senha">{() => <PublicLayout><ResetPassword /></PublicLayout>}</Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
