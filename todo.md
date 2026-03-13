# DEGASE CMS - Project TODO

## Correções Críticas e Estabilização (Março 2026)
- [x] Restaurar ambiente (Repositório sincronizado e dependências instaladas)
- [x] Corrigir erro de schema tRPC (Routers atualizados para tratar inputs opcionais)
- [x] Corrigir erro de 'length' ao editar posts no AdminPosts.tsx (Adicionado null-checks)
- [x] Implementar/Corrigir filtros de visibilidade nas queries SQL (db.ts atualizado para suportar visibilidade em Banners, Vídeos e Documentos)
- [x] Configurar banco de dados MySQL local no sandbox Manus
- [x] Popular banco com usuário administrador inicial (admin@degase.local / admin)
- [x] Iniciar servidor via PM2 e expor porta 3000
- [x] Sincronizar todas as alterações com o repositório GitHub

## Histórico de Implementações Anteriores
- [x] Implementação da INTRANET com identidade visual Verde Musgo (#2d5a4a)
- [x] Controle de Visibilidade em Módulos (Site, Intranet, Ambos)
- [x] Card de Login na Home Pública com redirecionamento por perfil
- [x] Sistema de Backup de Banco de Dados (SQL, CSV, XLSX)
- [x] Editor de Cores do Portal e Temas dinâmicos
- [x] Agendamento de Publicação e Histórico de Versões
- [x] Upload e Edição de Imagens com Crop
