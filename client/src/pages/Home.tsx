import { Link } from "wouter";
import { ArrowRight, Play, Building2, FileText, Users, Scale, DollarSign, HelpCircle, Database, Shield, Handshake, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect } from "react";
import ServicesSection from "@/components/ServicesSection";
import FeaturedDocuments from "@/components/FeaturedDocuments";
import { LoginBar } from "@/components/LoginBar";
import { trpc } from "@/lib/trpc";

function BannerSection() {
  const { data: banners } = trpc.banners.list.useQuery({ visibility: "site" });
  const [currentBanner, setCurrentBanner] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const activeBanners = banners && banners.length > 0 ? banners : [
    { id: 0, title: "Escola de Gestão Socioeducativa Paulo Freire", subtitle: "Formação continuada para profissionais do sistema socioeducativo", imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663378282282/uNiLAdRNGIEljZJZ.webp", linkUrl: "#" }
  ];

  // Auto-play do carrossel
  useEffect(() => {
    if (!autoPlay || activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % activeBanners.length);
    }, 5000); // Muda a cada 5 segundos
    
    return () => clearInterval(interval);
  }, [autoPlay, activeBanners.length]);

  const goToPrevious = () => {
    setCurrentBanner((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    setAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentBanner((prev) => (prev + 1) % activeBanners.length);
    setAutoPlay(false);
  };

  return (
    <section aria-label="Banners em destaque" className="relative w-full">
      <div className="w-full overflow-hidden bg-white">
        <div className="relative w-full h-48 md:h-64 lg:h-80 flex items-center justify-center">
          {/* Imagem do banner com transição suave */}
          {activeBanners[currentBanner]?.imageUrl && (
            <img
              key={currentBanner}
              src={activeBanners[currentBanner].imageUrl}
              alt={activeBanners[currentBanner].title}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
          )}
          
          {/* Overlay com gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          
          {/* Título do banner */}
          {activeBanners[currentBanner]?.title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
              <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                {activeBanners[currentBanner].title}
              </h2>
            </div>
          )}
          
          {/* Botões de navegação */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-colors"
                aria-label="Banner anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full transition-colors"
                aria-label="Próximo banner"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Indicadores de posição */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {activeBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentBanner(i);
                setAutoPlay(false);
              }}
              className={`transition-all duration-300 rounded-full ${
                i === currentBanner
                  ? "bg-white w-8 h-2"
                  : "bg-white/50 w-2 h-2 hover:bg-white/70"
              }`}
              aria-label={`Ir para banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NewsSection() {
  const { data, isLoading } = trpc.posts.list.useQuery({ status: "published", limit: 5, visibility: "site" });
  const newsItems = data?.items ?? [];

  // Placeholder news if no data
  const placeholderNews = useMemo(() => [
    { id: 1, title: "Nova unidade do Degase oferece mais infraestrutura, segurança e fortalece o atendimento regionalizado", excerpt: "Governo do Estado inaugura Centro de Socioeducação em São Gonçalo e amplia atendimento a adolescentes.", slug: "nova-unidade-degase", featuredImage: null },
    { id: 2, title: "Degase firma cooperação técnica com Fundação Casa para fortalecer políticas socioeducativas", excerpt: "Parceria visa modernizar a gestão e ampliar a proteção a adolescentes em cumprimento de medidas socioeducativas.", slug: "cooperacao-fundacao-casa", featuredImage: null },
    { id: 3, title: "DEGASE certifica 620 agentes no Curso de Capacitação do RAS por meio da DIVCAP", excerpt: "Investimento em formação fortalece a segurança institucional e a gestão do sistema socioeducativo.", slug: "certificacao-agentes", featuredImage: null },
    { id: 4, title: "Degase executará obras de adequação estrutural e expansão da rede socioeducativa em 2026", excerpt: "Governo do Estado inicia, em 2026, obras de reestruturação em unidades do Degase.", slug: "obras-expansao", featuredImage: null },
    { id: 5, title: "DEGASE participa de debates no Congresso Nacional sobre os impactos do PL 1473/2025", excerpt: "Fortalecimento das Políticas Públicas Direcionadas ao Atendimento Socioeducativo.", slug: "debates-congresso", featuredImage: null },
  ], []);

  const items = newsItems.length > 0 ? newsItems : placeholderNews;
  const topNews = items.slice(0, 3);
  const bottomNews = items.slice(3, 5);

  return (
    <section aria-labelledby="news-heading" className="py-10 bg-white">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* News column - 3 cols */}
          <div className="md:col-span-3">
            {/* Top 3 news in grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {topNews.map((item: any) => (
                <article key={item.id} className="group">
                  <Link href={`/noticias/${item.slug}`} className="block">
                    <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden mb-3">
                      {item.featuredImage ? (
                        <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--degase-blue-dark)" }}>
                          <FileText className="text-white/30" size={48} />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-sm md:text-base leading-tight group-hover:underline" style={{ color: "var(--degase-blue-dark)" }}>
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-2 line-clamp-3">{item.excerpt}</p>
                  </Link>
                </article>
              ))}
            </div>

            {/* Bottom 2 news */}
            {bottomNews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {bottomNews.map((item: any) => (
                  <article key={item.id} className="group flex gap-4">
                    <div className="w-40 h-28 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {item.featuredImage ? (
                        <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--degase-blue-dark)" }}>
                          <FileText className="text-white/30" size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/noticias/${item.slug}`}>
                        <h3 className="font-bold text-sm leading-tight group-hover:underline" style={{ color: "var(--degase-blue-dark)" }}>
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-3">{item.excerpt}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="text-center">
              <Link href="/noticias">
                <Button variant="outline" className="border-2 font-semibold text-xs uppercase tracking-wider" style={{ borderColor: "var(--degase-blue-dark)", color: "var(--degase-blue-dark)" }}>
                  Veja a lista completa de notícias
                </Button>
              </Link>
            </div>
          </div>

          {/* Login Card - 1 col */}
          <div className="md:col-span-1">
            <div className="sticky top-20">
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function VideosSection() {
  const { data: videos } = trpc.videos.list.useQuery({ visibility: "site" });
  const featuredVideo = videos?.find((v: any) => v.isFeatured) || videos?.[0];

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : url;
  };

  const videoUrl = featuredVideo?.youtubeUrl || "https://www.youtube.com/embed/FkQqOZXU3xk?rel=0";

  return (
    <section aria-labelledby="videos-heading" className="py-10" style={{ backgroundColor: "var(--degase-gray-light)" }}>
      <div className="container">
        <h2 id="videos-heading" className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: "var(--degase-blue-light)" }}>
          Vídeos
        </h2>
        <div className="w-16 h-1 mx-auto mb-8" style={{ backgroundColor: "var(--degase-blue-dark)" }} />

        <div className="max-w-2xl mx-auto">
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={featuredVideo ? getYoutubeEmbedUrl(featuredVideo.youtubeUrl) : videoUrl}
              title={featuredVideo?.title || "TV Degase"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Miniaturas dos próximos vídeos */}
        {videos && videos.length > 1 && (
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {videos.slice(1, 3).map((video: any) => {
              const videoId = video.youtubeUrl?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
              const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
              
              return (
                <a
                  key={video.id}
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                >
                  <img
                    src={video.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <Play size={32} className="text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <p className="text-white text-xs font-semibold line-clamp-2">{video.title}</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        <div className="text-center mt-6">
          <a href="https://www.youtube.com/@tvdegase" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-2 font-semibold text-xs uppercase tracking-wider" style={{ borderColor: "var(--degase-blue-dark)", color: "var(--degase-blue-dark)" }}>
              Veja a lista completa de vídeos
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

function TransparencySection() {
  const transparencyLinks = [
    { label: "Institucional", icon: Building2, href: "/transparencia" },
    { label: "Participação Social", icon: Users, href: "/transparencia" },
    { label: "Ações e Programas", icon: ClipboardList, href: "/transparencia" },
    { label: "Auditorias", icon: Shield, href: "/transparencia" },
    { label: "Convênios e Transferências", icon: Handshake, href: "/transparencia" },
    { label: "Licitações e Contratos", icon: FileText, href: "/transparencia" },
    { label: "Receitas e Despesas", icon: DollarSign, href: "/transparencia" },
    { label: "Servidores", icon: Users, href: "/transparencia" },
    { label: "Informações Classificadas", icon: Scale, href: "/transparencia" },
    { label: "Serviço de Informação ao Cidadão - SIC", icon: HelpCircle, href: "/transparencia" },
    { label: "Perguntas Frequentes", icon: HelpCircle, href: "/transparencia" },
    { label: "Dados Abertos", icon: Database, href: "/transparencia" },
  ];

  return (
    <section aria-labelledby="transparency-heading" className="py-10 text-white" style={{ backgroundColor: "var(--degase-blue-dark)" }}>
      <div className="container">
        <h2 id="transparency-heading" className="text-2xl md:text-3xl font-bold text-center mb-2">
          Transparência
        </h2>
        <div className="w-16 h-1 mx-auto mb-8" style={{ backgroundColor: "var(--degase-gold)" }} />

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Director Info */}
          <div>
            <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Diretor Geral</div>
            <h3 className="text-xl font-bold mb-3">Victor Hugo Poubel</h3>
            <p className="text-sm opacity-80 mb-4">
              O Departamento Geral de Ações Socioeducativas (Degase) tem um novo diretor-geral. O delegado federal...
            </p>
            <div className="flex gap-2">
              <Link href="/sobre">
                <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10 bg-transparent text-xs">
                  Saiba Mais
                </Button>
              </Link>
              <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10 bg-transparent text-xs">
                Agenda
              </Button>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <span className="opacity-70">📍</span>
                Rua Taifeiro Osmar de Moraes, 111, Galeão - Ilha do Governador, RJ - CEP 21941-455
              </p>
              <p className="flex items-center gap-2">
                <span className="opacity-70">🕐</span>
                Seg-Sex 9:00-17:00
              </p>
              <p className="flex items-center gap-2">
                <span className="opacity-70">📞</span>
                (21) 2334-6674
              </p>
              <p className="flex items-center gap-2">
                <span className="opacity-70">✉️</span>
                ouvidoria@novodegase.rj.gov.br
              </p>
            </div>
          </div>

          {/* Transparency Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {transparencyLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center p-4 rounded-lg text-center text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "var(--degase-blue-medium)" }}
              >
                <item.icon size={24} className="mb-2 opacity-80" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function UnitsSection() {
  const { data: units } = trpc.units.list.useQuery();
  const displayUnits = units && units.length > 0 ? units.slice(0, 12) : [];

  return (
    <section aria-labelledby="units-heading" className="py-10 bg-white">
      <div className="container">
        <h2 id="units-heading" className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: "var(--degase-blue-light)" }}>
          Links Úteis
        </h2>
        <div className="w-16 h-1 mx-auto mb-4" style={{ backgroundColor: "var(--degase-blue-dark)" }} />

        <h3 className="text-xl font-bold text-center mb-6" style={{ color: "var(--degase-blue-dark)" }}>
          Unidades do Degase
        </h3>

        {displayUnits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {displayUnits.map((unit: any) => (
              <div key={unit.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-sm" style={{ color: "var(--degase-blue-dark)" }}>{unit.name}</h4>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm">As unidades serão carregadas após cadastro no painel administrativo.</p>
        )}

        <div className="text-center mt-6">
          <Link href="/unidades">
            <Button variant="outline" className="border-2 font-semibold text-xs uppercase tracking-wider" style={{ borderColor: "var(--degase-blue-dark)", color: "var(--degase-blue-dark)" }}>
              Ver todas as unidades
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main id="main-content" role="main">
      <LoginBar />
      <BannerSection />
      <NewsSection />
      <ServicesSection />
      <VideosSection />
      <TransparencySection />
      <FeaturedDocuments />
      <UnitsSection />
    </main>
  );
}
