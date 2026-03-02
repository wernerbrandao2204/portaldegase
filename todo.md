# DEGASE CMS - Project TODO

## Banco de Dados e Schema
- [x] Schema de categorias (notícias, comunicados, legislação, páginas)
- [x] Schema de posts/conteúdo com suporte WYSIWYG
- [x] Schema de tags para organização de conteúdo
- [x] Schema de páginas institucionais
- [x] Schema de banners/carrossel
- [x] Schema de vídeos institucionais
- [x] Schema de documentos de transparência
- [x] Schema de unidades do DEGASE
- [x] Schema de configurações do site

## Backend - Routers tRPC
- [x] CRUD de posts (notícias, comunicados)
- [x] CRUD de categorias
- [x] CRUD de tags
- [x] CRUD de páginas institucionais
- [x] CRUD de banners
- [x] CRUD de vídeos
- [x] CRUD de documentos de transparência
- [x] CRUD de unidades
- [x] Sistema de busca interna
- [x] Gestão de configurações do site
- [x] Controle de acesso por role (admin/user)

## Frontend Público
- [x] Header com barra gov.br, logo, busca
- [x] Banner/carrossel principal
- [x] Seção de notícias (grid 3+2 colunas)
- [x] Seção de vídeos com embed YouTube
- [x] Seção de transparência com grid de links
- [x] Seção Links Úteis e Unidades
- [x] Rodapé institucional com contato e redes sociais
- [x] Página de notícia individual
- [x] Página de listagem de notícias
- [x] Página Sobre/Institucional
- [x] Página de Serviços
- [x] Página de Legislação
- [x] Página de Transparência
- [x] Página de Contato
- [x] Sistema de busca com resultados
- [x] Identidade visual azul/branco oficial

## Painel Administrativo
- [x] Dashboard com estatísticas
- [x] Gerenciamento de notícias com editor WYSIWYG
- [x] Gerenciamento de categorias e tags
- [x] Gerenciamento de páginas institucionais
- [x] Gerenciamento de banners
- [x] Gerenciamento de vídeos
- [x] Gerenciamento de documentos
- [x] Gerenciamento de unidades
- [x] Configurações do site

## Acessibilidade WCAG 2.1
- [x] Alto contraste
- [x] Ajuste de tamanho de fonte
- [x] Navegação por teclado
- [x] Compatibilidade com leitores de tela (ARIA)
- [x] Skip navigation links

## LGPD e Segurança
- [x] Política de Privacidade
- [x] Termos de Uso
- [x] Banner de cookies com gestão de consentimento
- [x] Preparação SSL (headers de segurança)
- [x] CSP headers

## Testes
- [x] Testes unitários para routers (32 testes passando)
- [x] Testes de autenticação e autorização

## Documentação
- [x] Manual de migração de ambientes (Manus → Homologação → Produção)

## Upload de Imagens
- [x] Endpoint tRPC para upload de imagens (validação, armazenamento S3)
- [x] Integração de upload no editor WYSIWYG TipTap
- [x] Validação de tipo e tamanho de arquivo
- [x] Preview de imagem durante upload
- [x] Tratamento de erros de upload
- [x] Testes do sistema de upload (14 testes passando)

## Edição de Imagens
- [x] Instalar biblioteca react-easy-crop
- [x] Criar componente ImageEditor com crop
- [x] Adicionar controle de redimensionamento
- [x] Integrar editor no fluxo de upload
- [x] Testes de edição de imagens (46 testes passando)

## Edição de Páginas Prontas
- [x] Permitir edição de páginas institucionais no menu do CMS
- [x] Listagem de páginas editáveis no painel admin

## Administração Geral
- [x] Criar página de configurações gerais do portal
- [x] Permitir editar título do portal
- [x] Permitir editar favicon
- [x] Permitir editar logo
- [x] Permitir editar texto do rodapé
- [x] Salvar configurações no banco de dados

## Perfil de Contribuidor
- [x] Adicionar role 'contributor' ao schema
- [x] Adicionar categoryId ao schema de usuários
- [x] Implementar controle de acesso por categoria
- [x] Contributors só podem editar notícias de sua categoria
- [x] Apenas admin pode postar em todas as categorias
- [x] Página de gerenciamento de contribuidores (admin)

## Histórico de Edições
- [x] Tabelas de histórico para posts e pages no banco de dados
- [x] Funções de criação e gerenciamento de versões
- [x] Endpoints tRPC para listar e reverter versões
- [x] Componentes UI para visualizar histórico
- [x] Modal de visualização de versões
- [x] Testes do sistema de histórico (38 testes passando)

## Agendamento de Publicação
- [x] Adicionar campos de agendamento ao schema (scheduledAt, isScheduled)
- [x] Migração do banco de dados
- [x] Funções de banco de dados para agendamento
- [x] Endpoints tRPC para agendar e gerenciar publicações
- [x] Componente PublishScheduler para seleção de data/hora
- [x] Integração no formulário de criação/edição de posts
- [x] Worker/cron para publicar posts agendados automaticamente
- [x] Testes do sistema de agendamento (4 testes passando)

## Salvamento Automático de Rascunhos
- [x] Hook useAutosave com debounce
- [x] Integração no editor de posts
- [x] Integração no editor de páginas
- [x] Notificação visual de salvamento
- [x] Recuperação de rascunho ao recarregar página

## Pré-visualização Responsiva
- [x] Componente ResponsivePreview
- [x] Visualização desktop (1920px)
- [x] Visualização tablet (768px)
- [x] Visualização mobile (375px)
- [x] Seletor de dispositivo
- [x] Integração no editor de posts

## Editor de Cores do Portal
- [x] Adicionar tabela de temas no banco de dados
- [x] Endpoints tRPC para gerenciar temas
- [x] Página admin de customização de cores
- [x] Seletor de cores para cada elemento
- [x] Preview em tempo real das mudanças
- [x] Aplicação dinâmica de cores no frontend

## Melhorias no Campo de Busca
- [x] Melhorar contraste do campo de busca
- [x] Adicionar ícone de busca visível
- [x] Customização de cores no admin
- [x] Acessibilidade (ARIA labels)
- [x] Placeholder mais descritivo

## Sistema de Comentarios
- [x] Tabela de comentarios no banco de dados
- [x] Endpoints tRPC para CRUD de comentarios
- [x] Componente CommentsSection com formulario
- [x] Listagem de comentarios na pagina de noticia
- [x] Moderacao de comentarios (admin)
- [x] Notificacao de comentario pendente
- [x] Validacao de entrada

## Galeria de Imagens e Videos
- [x] Tabela de midia no banco de dados
- [x] Endpoints tRPC para gerenciar midia
- [x] Pagina admin AdminMediaGallery
- [x] Filtro por tipo (imagem/video)
- [x] Organizacao com paginacao
- [x] Copia de URL para insercao em posts
- [x] Preview de midia

## Sistema de Tags
- [x] Tabela de tags no banco de dados
- [x] Endpoints tRPC para gerenciar tags
- [x] Componente TagSelector para selecao
- [x] Criacao de novas tags no editor
- [x] Relacao muitos-para-muitos com posts
- [x] Busca por tags

## Upload de Logo e Favicon
- [ ] Adicionar campos de URL de logo e favicon ao siteConfig
- [ ] Componente de upload de logo no AdminSettings
- [ ] Componente de upload de favicon no AdminSettings
- [ ] Exibir logo no header e no CMS
- [ ] Exibir favicon na página
- [ ] Validação de tipo de arquivo

## Painel de Análise de Dados
- [ ] Tabela de analytics para rastrear visualizações
- [ ] Endpoints tRPC para coletar dados de analytics
- [ ] Página AdminAnalytics com gráficos
- [ ] Mostrar posts mais populares
- [ ] Mostrar engajamento por período
- [ ] Mostrar tags mais usadas
- [ ] Filtro por data

## Responsável por Postagem
- [x] Adicionar campo de responsável no formulário de criação/edição de notícias
- [x] Exibir responsável na página de detalhes da notícia
- [x] Exibir responsável na listagem de notícias do admin
- [x] Permitir seleção de responsável (usuário logado ou outro usuário)
- [x] Exibir responsável na página de listagem pública de notícias
- [x] Adicionar coluna de responsável na tabela de notícias do admin
- [x] Implementar filtro por responsável no admin
- [ ] Implementar filtro por responsável na busca pública

## Cadastro de Usuários
- [x] Criar página AdminUsers.tsx no painel admin
- [x] Adicionar campos: Nome Completo, ID Funcional, Categoria, Nível de Acesso
- [x] Implementar CRUD de usuários (editar, deletar)
- [x] Adicionar validações de campo
- [x] Integrar no menu do CMS
- [x] Adicionar campo functionalId ao schema de usuários

## Compartilhamento em Redes Sociais
- [ ] Configuração de credenciais de redes sociais no AdminSettings
- [ ] Endpoints para compartilhar em Facebook
- [ ] Endpoints para compartilhar em Twitter
- [ ] Endpoints para compartilhar em Instagram
- [ ] Compartilhamento automático ao publicar
- [ ] Fila de compartilhamento
- [ ] Log de compartilhamentos

## Melhoria de Sistema de Busca
- [x] Implementar busca case-insensitive
- [x] Permitir busca por palavras parciais
- [x] Atualizar query de busca no banco de dados
- [x] Testar busca com diferentes termos

## Upload de Ícones e Analytics de Serviços
- [x] Criar tabela de analytics para rastreamento de cliques em serviços
- [x] Implementar função para registrar cliques em serviços
- [x] Adicionar campo de upload de ícones no formulário AdminServices
- [x] Integrar upload de ícones para S3
- [x] Criar dashboard de estatísticas de cliques em serviços
- [x] Exibir gráficos de engajamento por serviço

## Ajuste Visual de Ícones nos Cards
- [x] Exibir ícones com cores nos cards de serviços
- [x] Exibir ícones com cores nos cards de transparência
- [x] Validar visual em diferentes resoluções

## Remoção de Filtros CSS de Silhueta Branca
- [x] Encontrar todos os filtros brightness-0 invert no código
- [x] Remover filtros de logos e imagens
- [x] Testar visual em todo o portal (público e admin)
- [x] Validar em diferentes navegadores

## Upload de Imagens para Banners
- [x] Adicionar campo de upload de imagem no formulário de banners
- [x] Implementar validação de tamanho (10MB máximo)
- [x] Validar tipos de arquivo (JPG, PNG, WebP)
- [x] Adicionar informações sobre tamanho ideal do banner (1920x600px)
- [x] Remover campo de URL de imagem
- [x] Integrar upload para S3

## Correção de Erros TypeScript
- [x] Corrigir campo isFeatured em AdminVideos.tsx
- [x] Corrigir enum de status em AdminVideos.tsx
- [ ] Corrigir erros em AdminAnalytics.tsx

## Preview de Imagem
- [x] Implementar preview de imagem antes de upload em AdminBanners
- [x] Implementar preview em AdminServices
- [x] Implementar preview em AdminPosts

## Compressao de Imagens
- [x] Adicionar biblioteca de compressao
- [x] Implementar compressao antes de upload em AdminBanners
- [x] Implementar compressao em AdminServices
- [x] Implementar compressao em AdminPosts

## Alterações no Cabeçalho
- [x] Remover 3 campos de texto entre logo DEGASE e busca
- [x] Adicionar logo do governo RJ no centro do cabeçalho
- [x] Aproximar logo DEGASE mais à esquerda (próximo ao menu)

## Salvamento Automatico de Rascunho em AdminPosts
- [x] Adicionar procedimento saveDraft em routers.ts
- [x] Adicionar procedimento getHistory em routers.ts
- [x] Adicionar procedimento revertToDraft em routers.ts
- [x] Integrar useAutosave em AdminPosts.tsx
- [x] Adicionar indicador de salvamento automático no cabeçalho
- [x] Adicionar seção de histórico de versões

## Salvamento Automatico em AdminPages
- [x] Adicionar procedimento saveDraftPage em routers.ts
- [x] Adicionar procedimento getPageHistory em routers.ts
- [x] Integrar useAutosave em AdminPages.tsx
- [x] Adicionar indicador de salvamento automático em AdminPages
- [x] Adicionar seção de histórico de versões em AdminPages

## FASES PENDENTES

## Fase 2 - Preview e Compressao em AdminVideos e AdminMediaGallery
- [ ] Adicionar preview de thumbnail em AdminVideos
- [ ] Implementar compressão de thumbnail em AdminVideos
- [ ] Adicionar validação de arquivo em AdminVideos
- [ ] Adicionar preview de imagem em AdminMediaGallery
- [ ] Implementar compressão de imagem em AdminMediaGallery
- [ ] Adicionar validação de arquivo em AdminMediaGallery

## Fase 3 - Indicadores de Salvamento em Componentes
- [ ] Adicionar indicador em AdminBanners
- [ ] Adicionar indicador em AdminServices
- [ ] Adicionar indicador em AdminVideos
- [ ] Adicionar indicador em AdminCategories
- [ ] Adicionar indicador em AdminTags

## Fase 4 - Filtro por Responsavel na Busca Publica
- [ ] Adicionar dropdown de responsáveis em SearchPage
- [ ] Integrar filtro com query de busca
- [ ] Testar filtro com diferentes responsáveis

## Fase 5 - Upload de Logo e Favicon
- [ ] Adicionar campos de upload em AdminSettings
- [ ] Implementar validação de tipo de arquivo
- [ ] Integrar upload para S3
- [ ] Exibir logo dinamicamente no header
- [ ] Exibir favicon na página

## Fase 6 - Painel de Analise de Rascunhos
- [ ] Criar página AdminDrafts.tsx
- [ ] Adicionar query para listar todos os rascunhos
- [ ] Implementar filtros por autor, categoria e data
- [ ] Adicionar estatísticas de rascunhos
- [ ] Implementar ações em lote (publicar, deletar, arquivar)

## Fase 7 - Notificacoes de Conflito de Edicao
- [ ] Adicionar tabela de active_editors no banco de dados
- [ ] Criar procedimento para registrar editor ativo
- [ ] Criar procedimento para verificar conflito de edição
- [ ] Implementar notificação visual de conflito
- [ ] Implementar lógica de lock/unlock de edição


## Sistema de Gerenciamento de Documentos
- [ ] Criar schema de documentos no banco de dados
- [ ] Criar schema de categorias de documentos
- [ ] Implementar routers tRPC para CRUD de documentos
- [ ] Implementar routers tRPC para CRUD de categorias de documentos
- [ ] Criar página AdminDocuments.tsx com upload
- [ ] Implementar validação de tamanho (máx 40MB)
- [ ] Implementar seleção obrigatória de categoria
- [ ] Criar página pública de listagem de documentos
- [ ] Exibir documentos separados por categorias
- [ ] Implementar funcionalidade de download
- [ ] Exibir tamanho do arquivo
- [ ] Adicionar entrada no menu administrativo
- [ ] Adicionar entrada no menu público
- [ ] Integrar atualização automática de listagem ao enviar documento


## Melhorias de Documentos - Fase 2
- [ ] Adicionar busca de documentos na página pública
- [ ] Implementar filtro por categoria na busca
- [ ] Criar painel de estatísticas de downloads
- [ ] Rastrear downloads de documentos
- [ ] Exibir estatísticas por documento
- [ ] Implementar versionamento de documentos
- [ ] Permitir upload de novas versões
- [ ] Manter histórico de versões
- [ ] Exibir versões disponíveis para download


## Documentos em Destaque na Home
- [x] Adicionar campo isFeatured ao schema de documentos
- [x] Criar routers tRPC para listar documentos em destaque
- [x] Adicionar UI de destaque em AdminDocuments
- [x] Criar componente FeaturedDocuments para Home
- [x] Integrar FeaturedDocuments na página Home abaixo de Transparência
- [x] Adicionar botão "Exibir mais documentos" no card


## Filtro Avan\u00e7ado de Document## Filtro Avançado de Documentos
- [x] Criar router tRPC para busca com filtros avançados
- [x] Adicionar UI de filtros na página pública de documentos
- [x] Implementar filtro por categoria
- [x] Implementar filtro por data de publicação
- [x] Implementar filtro por tamanho de arquivo

## Widget de Documentos Recentes
- [x] Criar router tRPC para listar documentos recentes
- [x] Criar componente RecentDocumentsWidget
- [x] Integrar widget no painel administrativo
- [x] Exibir últimos 5 documentos enviados
- [x] Mostrar mais baixados


## Ordenacao de Documentos em Destaque
- [ ] Adicionar campo de ordem ao schema de documentos
- [ ] Criar routers tRPC para atualizar ordem
- [ ] Implementar drag-and-drop em AdminDocuments


## Correcoes de Erros
- [x] Corrigir exibicao de categoria em documentos em destaque (mostrando "Sem Categoria")
- [x] Corrigir erro ao clicar em "Exibir mais documentos" na pagina publica
- [x] Corrigir erro ao acessar pagina de documentos no admin


## Blocos Personalizaveis em Paginas
- [ ] Criar schema para blocos de pagina com tipos (servicos, documentos, imagens)
- [ ] Implementar routers tRPC para CRUD de blocos
- [ ] Criar interface de edicao de blocos em AdminPages
- [ ] Implementar renderizacao de blocos na pagina publica


## Blocos Personalizaveis em Paginas
- [x] Criar schema para blocos de página com suporte a diferentes tipos de conteúdo
- [x] Implementar routers tRPC para CRUD de blocos
- [x] Criar interface de edição de blocos em AdminPages
- [x] Implementar renderização de blocos na página pública


## Seletor de Imagens do Banco para Blocos
- [ ] Criar router tRPC para listar imagens do banco
- [ ] Implementar componente ImageSelector para seleção
- [ ] Integrar seletor no editor de blocos
- [ ] Exibir preview de imagens selecionadas

## Templates de Página Pré-configurados
- [ ] Criar schema para templates de página
- [ ] Implementar routers tRPC para CRUD de templates
- [ ] Criar interface de seleção de templates ao criar página
- [ ] Implementar blocos pré-montados em templates

## Sistema de Gerenciamento de Menu
- [ ] Criar schema para itens de menu com suporte a hierarquia
- [ ] Implementar routers tRPC para CRUD de menu
- [ ] Criar interface AdminMenu.tsx com drag-and-drop
- [ ] Suporte a links internos (páginas) e externos
- [ ] Controle de ordenação e hierarquia (pai/filho)
- [ ] Renderizar menu dinâmico no header
- [ ] Integrar no menu administrativo


## Correcoes Urgentes
- [x] Corrigir erro na pagina admin/documentos
- [x] Adicionar opcao de inserir cards em admin/paginas
- [x] Alterar intervalo de salvamento automatico de 3 para 60 segundos


## Problemas Criticos a Corrigir
- [ ] admin/documentos - documentos nao exibindo mesmo com upload realizado
- [ ] admin/documents/stats - erro 404
- [ ] admin/documents - erro 404  
- [ ] admin/paginas - cards nao aparecem e autosave rodando antes de clicar
- [ ] admin/menu - erro inesperado
- [ ] admin/servicos/analytics - acessos nao sendo contabilizados

## Rate Limiting para Visualizações
- [x] Adicionar tabela postViewLimits no schema (postId, ipAddress, viewedAt)
- [x] Implementar função checkViewLimit em server/db.ts
- [x] Implementar função recordPostViewWithLimit em server/db.ts
- [x] Atualizar router recordPostView para usar rate limiting
- [x] Testar rate limiting com múltiplos acessos do mesmo IP

## Dashboard de Trending Topics
- [x] Adicionar função getTrendingPosts em server/db.ts (últimos 7 dias)
- [x] Adicionar router analytics.getTrendingPosts em server/routers.ts
- [x] Criar componente TrendingTopics.tsx na página Home
- [x] Implementar gráfico de tendência temporal (Chart.js/Recharts)
- [x] Exibir top 5 notícias mais visualizadas da semana
- [x] Adicionar filtro de período (7 dias, 30 dias, 90 dias)

## Compartilhamento Social com Rastreamento
- [x] Adicionar tabela socialShares no schema (postId, platform, sharedAt, ipAddress)
- [x] Implementar função recordSocialShare em server/db.ts
- [x] Adicionar router recordSocialShare em server/routers.ts
- [x] Criar componente SocialShareButtons.tsx com WhatsApp, Facebook, Twitter
- [x] Integrar SocialShareButtons em NewsDetail.tsx
- [x] Implementar rastreamento de cliques em compartilhamento
- [ ] Adicionar métricas de compartilhamento ao AdminAnalytics
- [ ] Testar compartilhamento em cada plataforma


## Dashboard de Analytics Avançado
- [x] Implementar função getSharesByPlatform em server/db.ts
- [x] Implementar função getConversionRate em server/db.ts
- [x] Implementar função getPerformanceComparison em server/db.ts
- [x] Implementar função getTopPostsByEngagement em server/db.ts
- [x] Criar routers tRPC para analytics avançadas
- [x] Expandir AdminAnalytics com gráfico de compartilhamentos por plataforma
- [x] Adicionar gráfico de taxa de conversão (views → shares)
- [x] Adicionar comparação de desempenho entre períodos
- [x] Implementar filtros de data avançados
- [x] Testar dashboard com dados reais
