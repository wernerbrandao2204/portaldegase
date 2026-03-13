
## Correções Críticas e Estabilização (Março 2026)
- [x] Restaurar ambiente (Repositório sincronizado e dependências instaladas)
- [x] Corrigir erro de schema tRPC (Routers atualizados para tratar inputs opcionais)
- [x] Corrigir erro de 'length' ao editar posts no AdminPosts.tsx (Adicionado null-checks)
- [x] Implementar/Corrigir filtros de visibilidade nas queries SQL (db.ts atualizado para suportar visibilidade em Banners, Vídeos e Documentos)
- [ ] Validar conexão com banco de dados em ambiente de produção (Pendente host 'db' ou 'localhost')
- [ ] Iniciar servidor via PM2 e testar fluxos de usuário
