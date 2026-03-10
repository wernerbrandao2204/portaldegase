# Funcionalidades Concluídas Pendentes de Aplicação

## Resumo
Identificadas **5 funcionalidades principais** que foram implementadas em alguns componentes mas ainda não foram aplicadas em todas as páginas administrativas. Este documento lista as prioridades para aplicação em fases.

---

## FASE 1: Salvamento Automático de Rascunho com Controle de Versão

**Status:** Implementado em AdminPosts.tsx e AdminPages.tsx

**Pendente de aplicação:**
- [ ] AdminBanners.tsx - Adicionar salvamento automático de rascunho
- [ ] AdminServices.tsx - Adicionar salvamento automático de rascunho
- [ ] AdminVideos.tsx - Adicionar salvamento automático de rascunho
- [ ] AdminCategories.tsx - Adicionar salvamento automático de rascunho
- [ ] AdminTags.tsx - Adicionar salvamento automático de rascunho

**Componentes necessários:**
- Hook `useAutosave` (já existe em `/client/src/hooks/useAutosave.ts`)
- Procedimentos tRPC `saveDraft*` e `get*History` no backend
- Indicador visual de salvamento com Clock icon
- Seção de histórico de versões

**Estimativa:** 2-3 horas por componente

---

## FASE 2: Preview e Compressão de Imagem

**Status:** Implementado em AdminBanners.tsx, AdminServices.tsx e AdminPosts.tsx

**Pendente de aplicação:**
- [ ] AdminVideos.tsx - Adicionar preview de thumbnail
- [ ] AdminMediaGallery.tsx - Adicionar preview e compressão
- [ ] AdminSettings.tsx - Adicionar preview para logo e favicon

**Componentes necessários:**
- Biblioteca `browser-image-compression` (já instalada)
- Função `handleImageUpload` com validação
- Preview em tempo real antes de upload
- Compressão automática (máximo 1MB, 1920px)

**Estimativa:** 1-2 horas por componente

---

## FASE 3: Indicador de Salvamento Automático

**Status:** Implementado em AdminPosts.tsx e AdminPages.tsx

**Pendente de aplicação:**
- [ ] AdminBanners.tsx - Adicionar indicador com Clock icon
- [ ] AdminServices.tsx - Adicionar indicador com Clock icon
- [ ] AdminVideos.tsx - Adicionar indicador com Clock icon
- [ ] AdminCategories.tsx - Adicionar indicador com Clock icon
- [ ] AdminTags.tsx - Adicionar indicador com Clock icon

**Componentes necessários:**
- Icon `Clock` do lucide-react
- Estados: `isSaving`, `lastSavedTime`
- Mensagens de feedback visual

**Estimativa:** 30 minutos por componente

---

## FASE 4: Filtro por Responsável na Busca Pública

**Status:** Implementado no backend, pendente no frontend

**Pendente de aplicação:**
- [ ] SearchPage.tsx - Adicionar filtro por responsável/autor
- [ ] Atualizar query de busca para incluir filtro
- [ ] Adicionar componente de seleção de responsável

**Componentes necessários:**
- Dropdown/Select com lista de responsáveis
- Integração com `trpc.posts.search` query
- Filtro opcional (não obrigatório)

**Estimativa:** 1 hora

---

## FASE 5: Upload de Logo e Favicon

**Status:** Schema preparado, pendente implementação

**Pendente de aplicação:**
- [ ] AdminSettings.tsx - Adicionar campo de upload de logo
- [ ] AdminSettings.tsx - Adicionar campo de upload de favicon
- [ ] SiteHeader.tsx - Exibir logo dinamicamente
- [ ] Integração com S3 para armazenamento
- [ ] Validação de tipo de arquivo (PNG, SVG, ICO)

**Componentes necessários:**
- Componente de upload com preview
- Validação de tipo e tamanho
- Função `storagePut` para S3
- Atualização de `siteConfig` no banco

**Estimativa:** 2 horas

---

## FASE 6: Painel de Análise de Rascunhos (AdminDrafts.tsx)

**Status:** Planejado, não iniciado

**Funcionalidades:**
- [ ] Listar todos os rascunhos (posts e páginas)
- [ ] Filtro por autor
- [ ] Filtro por categoria
- [ ] Filtro por data de última edição
- [ ] Estatísticas de rascunhos
- [ ] Ações em lote (publicar, deletar, arquivar)

**Componentes necessários:**
- Nova página AdminDrafts.tsx
- Query tRPC para listar rascunhos
- Tabela com filtros
- Modal de ações em lote

**Estimativa:** 3-4 horas

---

## FASE 7: Notificações de Conflito de Edição

**Status:** Planejado, não iniciado

**Funcionalidades:**
- [ ] Tabela `active_editors` no banco de dados
- [ ] Procedimento para registrar editor ativo
- [ ] Procedimento para verificar conflito
- [ ] Notificação visual de conflito
- [ ] Sistema de lock/unlock de edição

**Componentes necessários:**
- Tabela no banco de dados
- Procedimentos tRPC
- Componente de notificação
- Lógica de lock/unlock

**Estimativa:** 4-5 horas

---

## Ordem Recomendada de Implementação

1. **FASE 1** - Salvamento automático em todos os componentes (base para outras funcionalidades)
2. **FASE 3** - Indicadores visuais (rápido e melhora UX)
3. **FASE 2** - Preview e compressão em componentes restantes
4. **FASE 4** - Filtro por responsável na busca pública
5. **FASE 5** - Upload de logo e favicon
6. **FASE 6** - Painel de análise de rascunhos
7. **FASE 7** - Notificações de conflito de edição (mais complexo)

---

## Tempo Total Estimado

- Fase 1: 10-15 horas
- Fase 2: 3-4 horas
- Fase 3: 2.5-3 horas
- Fase 4: 1 hora
- Fase 5: 2 horas
- Fase 6: 3-4 horas
- Fase 7: 4-5 horas

**Total: 25-34 horas de desenvolvimento**

---

## Notas Importantes

- Todas as funcionalidades já têm padrões estabelecidos em AdminPosts.tsx e AdminPages.tsx
- Reutilizar hooks e componentes existentes ao máximo
- Manter consistência visual e de comportamento entre todos os componentes
- Adicionar testes unitários para cada nova funcionalidade
