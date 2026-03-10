# Dados Necessários para Script de Migração Automatizada - CMS DEGASE

## Visão Geral

Este documento lista todos os dados necessários para criar um script bash/shell que automatize completamente a migração do CMS DEGASE para seu servidor RedHat/CentOS.

---

## 1. Dados de Acesso ao Servidor

### 1.1 Credenciais SSH

```bash
# Informações necessárias:
SSH_USER="seu-usuario"              # Usuário SSH (ex: root, ubuntu, degase)
SSH_HOST="seu-ip-ou-dominio"        # IP ou domínio do servidor (ex: 192.168.1.100)
SSH_PORT="22"                       # Porta SSH (padrão: 22)
SSH_KEY_PATH="/caminho/para/chave"  # Caminho da chave privada (ex: ~/.ssh/id_rsa)
```

### 1.2 Verificação

```bash
# Testar conectividade SSH
ssh -i $SSH_KEY_PATH -p $SSH_PORT $SSH_USER@$SSH_HOST "echo 'Conectado com sucesso'"
```

---

## 2. Dados do GitHub

### 2.1 Repositório

```bash
# Informações necessárias:
GITHUB_REPO="https://github.com/portaldegase/portaldegase.git"
GITHUB_BRANCH="main"                # Branch a clonar (main, develop, etc)
GITHUB_TOKEN=""                     # Token pessoal (se repositório privado)
```

### 2.2 Verificação

```bash
# Testar acesso ao repositório
git ls-remote $GITHUB_REPO | head -1
```

---

## 3. Dados do Servidor RedHat/CentOS

### 3.1 Configuração do Sistema

```bash
# Informações necessárias:
OS_VERSION="8"                      # Versão do RedHat/CentOS (7, 8, 9)
SELINUX_ENABLED="true"              # SELinux habilitado? (true/false)
FIREWALL_TYPE="firewalld"           # Tipo de firewall (firewalld, ufw, none)
```

### 3.2 Verificação

```bash
# Verificar versão do SO
cat /etc/os-release | grep VERSION_ID

# Verificar SELinux
getenforce

# Verificar firewall
systemctl status firewalld
```

---

## 4. Dados de Diretórios

### 4.1 Caminhos do Projeto

```bash
# Informações necessárias:
APP_DIR="/var/www/portaldegase"     # Diretório da aplicação
APP_USER="portaldegase"             # Usuário que executará a app
APP_GROUP="portaldegase"            # Grupo do usuário
APP_PORT="3000"                     # Porta da aplicação
```

### 4.2 Caminhos de Logs

```bash
# Informações necessárias:
LOG_DIR="/var/log/portaldegase"     # Diretório de logs
NGINX_LOG_DIR="/var/log/nginx"      # Logs do Nginx
BACKUP_DIR="/var/backups/portaldegase" # Diretório de backups
```

---

## 5. Dados de Banco de Dados

### 5.1 MySQL/MariaDB

```bash
# Informações necessárias:
DB_HOST="localhost"                 # Host do banco (localhost ou IP)
DB_PORT="3306"                      # Porta MySQL (padrão: 3306)
DB_NAME="portaldegase"              # Nome do banco de dados
DB_USER="portaldegase_user"         # Usuário do banco
DB_PASSWORD="senha_segura_aqui"     # Senha do banco (MUDE ISTO!)
DB_ROOT_PASSWORD="senha_root"       # Senha root MySQL (para setup)
```

### 5.2 Verificação

```bash
# Testar conexão MySQL
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1"
```

---

## 6. Dados de Proxy Reverso

### 6.1 Nginx

```bash
# Informações necessárias:
NGINX_ENABLED="true"                # Usar Nginx? (true/false)
NGINX_CONF_DIR="/etc/nginx/conf.d"  # Diretório de configuração
NGINX_USER="nginx"                  # Usuário do Nginx
```

### 6.2 Apache (Alternativa)

```bash
# Informações necessárias:
APACHE_ENABLED="false"              # Usar Apache? (true/false)
APACHE_CONF_DIR="/etc/httpd/conf.d" # Diretório de configuração
APACHE_USER="apache"                # Usuário do Apache
```

---

## 7. Dados de Domínio

### 7.1 Configuração de Domínio

```bash
# Informações necessárias:
DOMAIN_NAME="portaldegase.com.br"   # Domínio principal
DOMAIN_ALIAS="www.portaldegase.com.br" # Alias do domínio
DOMAIN_IP="seu-ip-servidor"         # IP do servidor
```

### 7.2 DNS (Opcional)

```bash
# Informações necessárias (para automação futura):
DNS_PROVIDER="cloudflare"           # Provedor DNS (cloudflare, route53, etc)
DNS_API_KEY="sua-chave-api"         # Chave API do DNS
DNS_API_SECRET="seu-secret"         # Secret do DNS
```

---

## 8. Dados de SSL/TLS (Futuro)

### 8.1 Certificado SSL

```bash
# Informações necessárias (quando tiver certificado):
SSL_ENABLED="false"                 # SSL habilitado? (true/false)
SSL_CERT_PATH="/etc/ssl/certs/portaldegase.com.br.crt"
SSL_KEY_PATH="/etc/ssl/private/portaldegase.com.br.key"
LETSENCRYPT_EMAIL="admin@portaldegase.com.br"
```

---

## 9. Dados de Node.js e Dependências

### 9.1 Versões

```bash
# Informações necessárias:
NODE_VERSION="18.0.0"               # Versão do Node.js
NPM_VERSION="9.0.0"                 # Versão do npm
PNPM_ENABLED="true"                 # Usar pnpm? (true/false)
```

### 9.2 Verificação

```bash
# Verificar versões instaladas
node --version
npm --version
pnpm --version
```

---

## 10. Dados de Variáveis de Ambiente

### 10.1 API Keys Manus

```bash
# Informações necessárias (do painel Manus):
VITE_APP_ID="seu-app-id"
BUILT_IN_FORGE_API_KEY="sua-chave-servidor"
VITE_FRONTEND_FORGE_API_KEY="sua-chave-frontend"
JWT_SECRET="sua-chave-secreta"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
BUILT_IN_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
```

### 10.2 Variáveis de Aplicação

```bash
# Informações necessárias:
NODE_ENV="production"               # Ambiente (development/production)
DATABASE_URL="mysql://user:pass@host:port/db"
APP_NAME="CMS DEGASE"
APP_DESCRIPTION="Portal DEGASE"
OWNER_NAME="Seu Nome"
OWNER_OPEN_ID="seu-open-id"
```

---

## 11. Dados de PM2 (Gerenciador de Processos)

### 11.1 Configuração PM2

```bash
# Informações necessárias:
PM2_ENABLED="true"                  # Usar PM2? (true/false)
PM2_ECOSYSTEM_FILE="ecosystem.config.js"
PM2_APP_NAME="portaldegase"
PM2_INSTANCES="max"                 # Instâncias (max, 1, 2, etc)
PM2_WATCH="false"                   # Monitorar mudanças? (true/false)
```

---

## 12. Dados de Firewall

### 12.1 Firewalld (RedHat/CentOS)

```bash
# Informações necessárias:
FIREWALL_ENABLED="true"
FIREWALL_HTTP_ENABLED="true"        # Abrir porta 80?
FIREWALL_HTTPS_ENABLED="false"      # Abrir porta 443? (true quando tiver SSL)
FIREWALL_SSH_ENABLED="true"         # Abrir porta SSH?
FIREWALL_CUSTOM_PORTS="3000"        # Portas customizadas
```

### 12.2 UFW (Ubuntu/Debian)

```bash
# Informações necessárias (se usar UFW):
UFW_ENABLED="false"
UFW_RULES="22/tcp,80/tcp,443/tcp,3000/tcp"
```

---

## 13. Dados de Backup

### 13.1 Configuração de Backup

```bash
# Informações necessárias:
BACKUP_ENABLED="true"               # Fazer backups?
BACKUP_FREQUENCY="daily"            # Frequência (hourly, daily, weekly)
BACKUP_RETENTION_DAYS="30"          # Manter backups por N dias
BACKUP_COMPRESS="true"              # Comprimir backups?
BACKUP_REMOTE_ENABLED="false"       # Backup remoto? (S3, etc)
BACKUP_REMOTE_BUCKET="seu-bucket-s3"
BACKUP_REMOTE_REGION="us-east-1"
```

---

## 14. Dados de Monitoramento

### 14.1 Monitoramento de Saúde

```bash
# Informações necessárias:
MONITORING_ENABLED="false"          # Monitorar aplicação?
MONITORING_TOOL="prometheus"        # Ferramenta (prometheus, newrelic, etc)
MONITORING_API_KEY="sua-chave"
HEALTH_CHECK_URL="http://localhost:3000/health"
HEALTH_CHECK_INTERVAL="60"          # Segundos
```

---

## 15. Dados de Email (Notificações)

### 15.1 SMTP para Notificações

```bash
# Informações necessárias:
SMTP_ENABLED="false"                # Enviar emails?
SMTP_HOST="smtp.gmail.com"          # Host SMTP
SMTP_PORT="587"                     # Porta SMTP
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-app"
SMTP_FROM="noreply@portaldegase.com.br"
ADMIN_EMAIL="admin@portaldegase.com.br"
```

---

## 16. Dados de Segurança

### 16.1 Configurações de Segurança

```bash
# Informações necessárias:
SECURITY_HEADERS_ENABLED="true"
CORS_ENABLED="true"
CORS_ORIGINS="https://portaldegase.com.br"
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_REQUESTS="100"           # Requisições por minuto
RATE_LIMIT_WINDOW="60"              # Janela em segundos
```

---

## 17. Dados de Agendamento

### 17.1 Cron Jobs

```bash
# Informações necessárias:
CRON_ENABLED="true"                 # Ativar cron jobs?
CRON_BACKUP_TIME="02:00"            # Horário do backup (HH:MM)
CRON_CLEANUP_TIME="03:00"           # Limpeza de logs (HH:MM)
CRON_HEALTH_CHECK="*/5 * * * *"     # Health check a cada 5 min
```

---

## Checklist de Dados Necessários

Antes de executar o script de migração, certifique-se de ter:

### Informações de Acesso
- [ ] Usuário SSH
- [ ] Host/IP do servidor
- [ ] Porta SSH
- [ ] Chave privada SSH
- [ ] Senha root (se necessário)

### Repositório GitHub
- [ ] URL do repositório
- [ ] Branch a usar
- [ ] Token GitHub (se privado)

### Banco de Dados
- [ ] Host MySQL
- [ ] Porta MySQL
- [ ] Nome do banco
- [ ] Usuário do banco
- [ ] Senha do banco
- [ ] Senha root MySQL

### Domínio e Rede
- [ ] Nome do domínio
- [ ] Alias do domínio
- [ ] IP do servidor
- [ ] Tipo de firewall

### API Keys Manus
- [ ] VITE_APP_ID
- [ ] BUILT_IN_FORGE_API_KEY
- [ ] VITE_FRONTEND_FORGE_API_KEY
- [ ] JWT_SECRET

### Configuração de Servidor
- [ ] Versão do RedHat/CentOS
- [ ] Proxy reverso (Nginx ou Apache)
- [ ] Versão do Node.js
- [ ] Usuário da aplicação

### Opcional
- [ ] Certificado SSL (quando tiver)
- [ ] Credenciais SMTP
- [ ] Chaves de monitoramento
- [ ] Credenciais de backup remoto

---

## Exemplo de Arquivo de Configuração

Crie um arquivo `migration.env` com todos os dados:

```bash
#!/bin/bash
# Arquivo: migration.env
# Configuração para migração automatizada do CMS DEGASE

# ===== ACESSO AO SERVIDOR =====
SSH_USER="root"
SSH_HOST="192.168.1.100"
SSH_PORT="22"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"

# ===== GITHUB =====
GITHUB_REPO="https://github.com/portaldegase/portaldegase.git"
GITHUB_BRANCH="main"
GITHUB_TOKEN=""

# ===== DIRETÓRIOS =====
APP_DIR="/var/www/portaldegase"
APP_USER="portaldegase"
APP_GROUP="portaldegase"
APP_PORT="3000"
LOG_DIR="/var/log/portaldegase"
BACKUP_DIR="/var/backups/portaldegase"

# ===== BANCO DE DADOS =====
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="portaldegase"
DB_USER="portaldegase_user"
DB_PASSWORD="senha_super_segura_123"
DB_ROOT_PASSWORD="senha_root_123"

# ===== DOMÍNIO =====
DOMAIN_NAME="portaldegase.com.br"
DOMAIN_ALIAS="www.portaldegase.com.br"
DOMAIN_IP="seu-ip-aqui"

# ===== PROXY REVERSO =====
NGINX_ENABLED="true"
APACHE_ENABLED="false"

# ===== API KEYS MANUS =====
VITE_APP_ID="seu-app-id"
BUILT_IN_FORGE_API_KEY="sua-chave-servidor"
VITE_FRONTEND_FORGE_API_KEY="sua-chave-frontend"
JWT_SECRET="sua-chave-secreta"

# ===== NODE.JS =====
NODE_VERSION="18.0.0"
PNPM_ENABLED="true"

# ===== PM2 =====
PM2_ENABLED="true"
PM2_INSTANCES="max"

# ===== FIREWALL =====
FIREWALL_ENABLED="true"
FIREWALL_HTTP_ENABLED="true"
FIREWALL_HTTPS_ENABLED="false"

# ===== BACKUP =====
BACKUP_ENABLED="true"
BACKUP_FREQUENCY="daily"
BACKUP_RETENTION_DAYS="30"

# ===== MONITORAMENTO =====
MONITORING_ENABLED="false"
HEALTH_CHECK_INTERVAL="60"

# ===== EMAIL =====
SMTP_ENABLED="false"
ADMIN_EMAIL="admin@portaldegase.com.br"
```

---

## Como Usar os Dados

### Passo 1: Coletar Todos os Dados

Use este documento como checklist para coletar todos os dados necessários.

### Passo 2: Criar Arquivo de Configuração

```bash
# Copiar o arquivo de exemplo
cp migration.env.example migration.env

# Editar com seus dados
nano migration.env

# Proteger o arquivo (contém senhas!)
chmod 600 migration.env
```

### Passo 3: Validar Dados

```bash
# Testar conectividade SSH
ssh -i $SSH_KEY_PATH -p $SSH_PORT $SSH_USER@$SSH_HOST "echo 'OK'"

# Testar acesso GitHub
git ls-remote $GITHUB_REPO | head -1

# Testar banco de dados
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1"
```

### Passo 4: Executar Script de Migração

```bash
# Carregar variáveis
source migration.env

# Executar script (será criado em breve)
bash migrate.sh
```

---

## Próximos Passos

1. **Coletar todos os dados** usando este documento
2. **Criar arquivo migration.env** com suas informações
3. **Validar conectividade** antes de executar o script
4. **Criar script de migração** (bash/shell) que use esses dados
5. **Testar em ambiente de staging** antes de produção

---

## Contato e Suporte

Se tiver dúvidas sobre quais dados coletar:

1. Consulte o manual de migração: `MANUAL_MIGRACAO.md`
2. Consulte o guia de API Keys: `GUIA_API_KEYS.md`
3. Acesse o painel Manus: https://manus.im
4. Contate o suporte: https://help.manus.im

---

**Última Atualização**: 25 de Fevereiro de 2026

**Versão do Documento**: 1.0

---

## Segurança

⚠️ **IMPORTANTE**: 

- Nunca compartilhe o arquivo `migration.env`
- Nunca commite o arquivo no GitHub
- Proteja com `chmod 600 migration.env`
- Use um gerenciador de senhas para armazenar dados sensíveis
- Mude as senhas padrão após a migração
