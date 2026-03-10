# DEGASE CMS - Project TODO

## Instalação e Configuração (Manus)
- [x] Clonar repositório do GitHub
- [x] Instalar dependências (pnpm)
- [x] Configurar banco de dados MySQL local
- [x] Executar migrações do Drizzle
- [x] Configurar variáveis de ambiente (.env)
- [x] Iniciar servidor de desenvolvimento
- [x] Expor porta para acesso público
- [x] Build de produção do frontend e backend
- [x] Configuração de persistência do MySQL
- [x] Implementação do PM2 para gerenciamento de processos
- [x] Configuração de inicialização automática (startup script)
- [x] Monitoramento de logs configurado
- [x] Implementação de login próprio (email/senha)
- [x] Criação de usuário administrador inicial (admin/admin)
- [x] Atualização da interface de login (/admin/login)

## Implementações de Intranet e Visibilidade (Solicitadas em 09/03/2026)
- [x] Inserir barra de rolagem no menu Admin para melhor acesso
- [x] Corrigir erro ao editar notícias em admin/posts
- [x] Corrigir erro ao inserir itens do menu
- [x] Validar formulário de criação de usuário antes de exibir erros
- [x] Corrigir preenchimento de categoria ao inserir novo usuário (Admin/Usuários)
- [x] Evoluir Backup do Banco de Dados:
  - [x] Opções de DUMP / Backup completo ou parcial
  - [x] Seleção de tabelas a serem copiadas
  - [x] Opções de exportação em SQL (CSV e XLSX estruturados)
- [x] Implementação da INTRANET:
  - [x] Página inicial `/intranet` com identidade visual Verde Musgo (#2d5a4a)
  - [x] Card de dados do usuário logado (Nome, Hora do Login)
  - [x] Menu próprio da Intranet
  - [x] Filtro de conteúdo (Intranet / Ambos)
  - [x] Redirecionamento de segurança para usuários não logados
- [x] Gerenciamento da Intranet no Admin:
  - [x] Novo item "Intranet" no menu lateral
  - [x] Configurações de cores, seções e conteúdo da Intranet
- [x] Controle de Visibilidade em Módulos:
  - [x] Campo de disponibilidade (Site, Intranet, Ambos) em:
    - Posts (Notícias)
    - Banners
    - Vídeos
    - Páginas
    - Documentos
    - Serviços
  - [x] Implementação de filtros na API para respeitar a escolha
- [x] Card de Login na Home Pública:
  - [x] Componente de login integrado à página inicial
  - [x] Redirecionamento inteligente por perfil:
    - Perfil **Administrador**: Redireciona para `/admin` (acesso total)
    - Perfil **Contribuidor**: Redireciona para `/admin` (acesso restrito)
    - Perfil **Usuário**: Redireciona para `/intranet`

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

## Melhoria de Sistema de Busca
- [x] Implementar busca case-insensitive
- [x] Permitir busca por palavras parciais
- [x] Atualizar query de busca no banco de dados
- [x] Testar busca com diferentes termos

## Cadastro de Usuários
- [x] Criar página AdminUsers.tsx no painel admin
- [x] Adicionar campos: Nome Completo, ID Funcional, Categoria, Nível de Acesso
- [x] Implementar CRUD de usuários (editar, deletar)
- [x] Adicionar validações de campo
- [x] Integrar no menu do CMS
- [x] Adicionar campo functionalId ao schema de usuários

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
