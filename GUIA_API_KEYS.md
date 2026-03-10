# Guia de Acesso às API KEYs - Manus

## Onde Encontrar Suas API KEYs

Suas API KEYs estão disponíveis em vários locais dependendo de como você quer acessá-las:

---

## 1. No Painel de Controle Manus (Recomendado)

### Passo 1: Acessar o Painel
1. Acesse: https://manus.im
2. Faça login com suas credenciais
3. Clique em **"Configurações"** ou **"Settings"** no menu superior

### Passo 2: Localizar as API KEYs
1. No painel, procure por **"API Keys"** ou **"Chaves de API"**
2. Você verá uma lista com suas chaves:
   - `VITE_APP_ID` - ID da aplicação
   - `BUILT_IN_FORGE_API_KEY` - Chave de API do servidor
   - `VITE_FRONTEND_FORGE_API_KEY` - Chave de API do frontend
   - `JWT_SECRET` - Chave secreta para sessões

### Passo 3: Copiar as Chaves
- Clique no ícone de **cópia** ao lado de cada chave
- Ou clique na chave para revelar o valor completo

---

## 2. No Arquivo de Configuração do Projeto

As suas API KEYs também estão armazenadas no arquivo `.env.production`:

```bash
# Localização do arquivo
/var/www/portaldegase/.env.production

# Conteúdo (exemplo)
VITE_APP_ID=seu_app_id_aqui
BUILT_IN_FORGE_API_KEY=sua_chave_servidor_aqui
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend_aqui
JWT_SECRET=sua_chave_secreta_aqui
```

### Como Acessar via SSH

```bash
# Conectar ao servidor RedHat
ssh seu-usuario@seu-servidor.com

# Navegar até o diretório do projeto
cd /var/www/portaldegase

# Visualizar as chaves (cuidado: não compartilhe este arquivo!)
cat .env.production

# Ou usar grep para encontrar uma chave específica
grep "VITE_APP_ID" .env.production
grep "BUILT_IN_FORGE_API_KEY" .env.production
```

---

## 3. No Painel de Administração do CMS DEGASE

Se você estiver logado como admin no CMS:

1. Acesse: `http://portaldegase.com.br/admin`
2. Vá para **Configurações** → **API Keys**
3. Suas chaves estarão listadas (algumas podem estar mascaradas por segurança)

---

## 4. Variáveis de Ambiente Disponíveis

Seu projeto usa as seguintes variáveis de ambiente com API KEYs:

| Variável | Descrição | Uso |
|----------|-----------|-----|
| `VITE_APP_ID` | ID único da aplicação Manus | Autenticação OAuth |
| `BUILT_IN_FORGE_API_KEY` | Chave de API do servidor | Chamadas de API backend |
| `VITE_FRONTEND_FORGE_API_KEY` | Chave de API do frontend | Chamadas de API do navegador |
| `JWT_SECRET` | Chave secreta para tokens JWT | Geração de sessões |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | Autenticação |
| `VITE_OAUTH_PORTAL_URL` | URL do portal OAuth | Login de usuários |
| `BUILT_IN_FORGE_API_URL` | URL base da API Manus | Endpoints de API |
| `VITE_FRONTEND_FORGE_API_URL` | URL base da API para frontend | Endpoints de API |

---

## 5. Como Usar as API KEYs

### No Backend (Node.js/Express)

```typescript
// Usar a chave de API do servidor
const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
const apiUrl = process.env.BUILT_IN_FORGE_API_URL;

// Fazer requisição para API Manus
const response = await fetch(`${apiUrl}/api/endpoint`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* dados */ })
});
```

### No Frontend (React)

```typescript
// Usar a chave de API do frontend
const apiKey = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const apiUrl = import.meta.env.VITE_FRONTEND_FORGE_API_URL;

// Fazer requisição
const response = await fetch(`${apiUrl}/api/endpoint`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 6. Segurança das API KEYs

### ⚠️ IMPORTANTE - Boas Práticas de Segurança

1. **Nunca compartilhe suas chaves publicamente**
   - Não coloque em repositórios públicos do GitHub
   - Não envie por email ou chat
   - Não exponha em logs ou mensagens de erro

2. **Proteja o arquivo `.env.production`**
   ```bash
   # Definir permissões restritivas
   chmod 600 /var/www/portaldegase/.env.production
   
   # Verificar permissões
   ls -la /var/www/portaldegase/.env.production
   # Deve mostrar: -rw------- (600)
   ```

3. **Rotação de Chaves**
   - Se uma chave foi comprometida, gere uma nova imediatamente
   - Atualize o arquivo `.env.production`
   - Reinicie a aplicação

4. **Backup Seguro**
   - Faça backup das chaves em local seguro (cofre de senhas)
   - Use ferramentas como 1Password, LastPass ou Vault
   - Nunca armazene em arquivos de texto simples

---

## 7. Regenerar API KEYs (Se Necessário)

Se você precisar gerar novas chaves:

### Via Painel Manus

1. Acesse https://manus.im
2. Vá para **Configurações** → **API Keys**
3. Clique em **"Regenerar"** ou **"Gerar Nova Chave"**
4. Confirme a ação (isso invalidará a chave anterior)
5. Copie a nova chave
6. Atualize o arquivo `.env.production`
7. Reinicie a aplicação

### Via Linha de Comando

```bash
# Atualizar a chave no arquivo .env.production
sed -i 's/BUILT_IN_FORGE_API_KEY=.*/BUILT_IN_FORGE_API_KEY=nova_chave_aqui/' /var/www/portaldegase/.env.production

# Reiniciar a aplicação
pm2 restart portaldegase
```

---

## 8. Testando as API KEYs

### Testar Conectividade

```bash
# Testar se a chave é válida
curl -X GET https://api.manus.im/api/health \
  -H "Authorization: Bearer SEU_VITE_FRONTEND_FORGE_API_KEY"

# Resposta esperada: 200 OK
```

### Testar no Projeto

```bash
# Navegar até o diretório do projeto
cd /var/www/portaldegase

# Executar teste de conexão
npm run test:api
# ou
pnpm test:api
```

---

## 9. Troubleshooting - Problemas Comuns

### Erro: "Invalid API Key"

```
Solução:
1. Verifique se a chave está correta no .env.production
2. Verifique se não há espaços em branco extras
3. Regenere a chave se necessário
4. Reinicie a aplicação
```

### Erro: "API Key Expired"

```
Solução:
1. Gere uma nova chave no painel Manus
2. Atualize o .env.production
3. Reinicie a aplicação
```

### Erro: "Unauthorized"

```
Solução:
1. Verifique se está usando a chave correta (servidor vs frontend)
2. Verifique se a chave está no header Authorization correto
3. Verifique se o token JWT não expirou
```

---

## 10. Documentação Oficial Manus

Para mais informações, consulte:

- **Documentação Oficial**: https://docs.manus.im
- **API Reference**: https://api.manus.im/docs
- **Suporte**: https://help.manus.im
- **Status da API**: https://status.manus.im

---

## Resumo Rápido

| Tarefa | Onde Encontrar |
|--------|----------------|
| Ver todas as chaves | Painel Manus → Configurações → API Keys |
| Copiar uma chave | Painel Manus → Clique no ícone de cópia |
| Usar no projeto | Arquivo `.env.production` |
| Regenerar chave | Painel Manus → Clique em "Regenerar" |
| Suporte | https://help.manus.im |

---

**Última Atualização**: 25 de Fevereiro de 2026

**Versão do Documento**: 1.0

---

## Contato e Suporte

Se tiver dúvidas sobre suas API KEYs:

1. Consulte a documentação: https://docs.manus.im
2. Acesse o painel de suporte: https://help.manus.im
3. Entre em contato com o suporte técnico Manus

**Lembre-se**: Suas API KEYs são confidenciais. Nunca as compartilhe ou exponha em repositórios públicos!
