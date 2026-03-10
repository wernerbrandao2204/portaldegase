# Manual de Migração - CMS DEGASE

## Visão Geral

Este manual fornece instruções passo a passo para migrar o CMS DEGASE (Departamento Geral de Ações Socioeducativas) para seu servidor. O documento cobre migração **sem certificado SSL** (HTTP) e preparação para **com certificado SSL** (HTTPS) no futuro.

---

## Pré-requisitos

Antes de iniciar a migração, certifique-se de que seu servidor possui:

- **Node.js 18+** instalado
- **npm** ou **pnpm** (gerenciador de pacotes)
- **MySQL 8.0+** ou **MariaDB 10.5+** para banco de dados
- **Git** instalado (opcional, mas recomendado)
- Acesso SSH ao servidor
- Porta 3000 (ou outra de sua escolha) disponível

### Verificar Versões

```bash
node --version    # Deve ser v18.0.0 ou superior
npm --version     # Deve ser 9.0.0 ou superior
mysql --version   # Deve ser 8.0.0 ou superior
```

---

## Fase 1: Preparação do Ambiente

### 1.1 Clonar o Repositório

```bash
# Navegar para o diretório de aplicações
cd /var/www

# Clonar o repositório
git clone https://github.com/portaldegase/portaldegase.git portaldegase
cd /var/www/portaldegase
```

### 1.2 Instalar Dependências

```bash
# Instalar dependências do projeto
npm install
# ou
pnpm install
```

### 1.3 Configurar Variáveis de Ambiente

Crie um arquivo `.env.production` na raiz do projeto:

```bash
cp .env.example .env.production
```

Edite o arquivo `.env.production` com as configurações do seu servidor:

```env
# Database Configuration
DATABASE_URL="mysql://usuario:senha@localhost:3306/degase_cms"

# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# OAuth Configuration (Manus)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# JWT Secret (gere uma string aleatória segura)
JWT_SECRET=sua_chave_secreta_aleatoria_muito_longa_e_segura

# Owner Information
OWNER_NAME="DEGASE"
OWNER_OPEN_ID=seu_owner_id

# API Keys
BUILT_IN_FORGE_API_KEY=sua_chave_api
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=https://seu-analytics.com
VITE_ANALYTICS_WEBSITE_ID=seu_website_id
```

### 1.4 Criar Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root -p

# Criar banco de dados
CREATE DATABASE degase_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'degase_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON degase_cms.* TO 'degase_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 1.5 Executar Migrações

```bash
# Executar migrações do banco de dados
npm run db:push
# ou
pnpm db:push
```

---

## Fase 2: Build e Deployment (HTTP - Sem SSL)

### 2.1 Compilar Projeto

```bash
# Fazer build do projeto
npm run build
# ou
pnpm build
```

### 2.2 Iniciar Servidor em Produção

```bash
# Opção 1: Iniciar manualmente
npm run start
# ou
pnpm start

# Opção 2: Usar PM2 (recomendado para produção)
npm install -g pm2
pm2 start "npm run start" --name "degase-cms"
pm2 save
pm2 startup
```

### 2.3 Verificar Acesso HTTP

```bash
# Testar acesso local
curl http://localhost:3000

# Testar acesso remoto (substitua IP)
curl http://seu-ip-servidor:3000
```

O site deve estar acessível em: `http://portaldegase.com.br:3000`

---

## Fase 3: Configuração de Proxy Reverso (Nginx/Apache)

### 3.0 Configuração RedHat/CentOS com SELinux

Antes de configurar o proxy reverso, configure o SELinux para permitir conexões:

```bash
# Permitir que Nginx se conecte ao localhost:3000
sudo setsebool -P httpd_can_network_connect on

# Verificar se a configuração foi aplicada
getsebool httpd_can_network_connect

# Se usar firewalld (RedHat/CentOS)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3.1 Configurar Nginx (Recomendado)

Crie um arquivo de configuração Nginx:

```bash
# No RedHat/CentOS, usar /etc/nginx/conf.d/ em vez de /etc/nginx/sites-available/
sudo nano /etc/nginx/conf.d/portaldegase.conf
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name portaldegase.com.br www.portaldegase.com.br;

    # Logs
    access_log /var/log/nginx/degase-cms-access.log;
    error_log /var/log/nginx/degase-cms-error.log;

    # Limite de tamanho de upload
    client_max_body_size 50M;

    # Proxy reverso para a aplicação Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Servir arquivos estáticos com cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Ativar configuração:

```bash
# No RedHat/CentOS, o arquivo em /etc/nginx/conf.d/ é automaticamente incluído
# Apenas teste e reinicie o Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### 3.2 Configurar Apache (Alternativa)

Se preferir Apache, crie um arquivo VirtualHost:

```bash
# No RedHat/CentOS, usar /etc/httpd/conf.d/ em vez de /etc/apache2/sites-available/
sudo nano /etc/httpd/conf.d/portaldegase.conf
```

```apache
<VirtualHost *:80>
    ServerName portaldegase.com.br
    ServerAlias www.portaldegase.com.br

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/degase-cms-error.log
    CustomLog ${APACHE_LOG_DIR}/degase-cms-access.log combined
</VirtualHost>
```

Ativar:

```bash
# No RedHat/CentOS, usar httpd em vez de apache2
# Os módulos proxy já estão habilitados por padrão
sudo httpd -t
sudo systemctl restart httpd
```

---

## Fase 4: Configuração de Firewall

### 4.1 UFW (Ubuntu/Debian)

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS (preparação para SSL)
sudo ufw allow 443/tcp

# Ativar firewall
sudo ufw enable
```

### 4.2 Firewalld (CentOS/RHEL)

```bash
# Permitir HTTP
sudo firewall-cmd --permanent --add-service=http

# Permitir HTTPS
sudo firewall-cmd --permanent --add-service=https

# Recarregar
sudo firewall-cmd --reload
```

---

## Fase 5: Monitoramento e Manutenção

### 5.1 Verificar Status da Aplicação

```bash
# Com PM2
pm2 status
pm2 logs degase-cms

# Sem PM2
ps aux | grep "npm run start"
```

### 5.2 Backup do Banco de Dados

```bash
# Backup manual
mysqldump -u degase_user -p degase_cms > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
mysql -u degase_user -p degase_cms < backup_20240225_120000.sql
```

### 5.3 Logs da Aplicação

```bash
# Com PM2
pm2 logs degase-cms --lines 100

# Nginx
tail -f /var/log/nginx/degase-cms-access.log
tail -f /var/log/nginx/degase-cms-error.log

# Apache
tail -f /var/log/apache2/degase-cms-error.log
```

---

## Fase 6: Migração para HTTPS (SSL/TLS) - Futuro

Quando você adquirir um certificado SSL, siga estas instruções:

### 6.1 Obter Certificado SSL

**Opção 1: Let's Encrypt (Gratuito)**

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot certonly --nginx -d portaldegase.com.br -d www.portaldegase.com.br

# Renovação automática
sudo systemctl enable certbot.timer
```

**Opção 2: Certificado Pago**

Obtenha o certificado do seu provedor e coloque os arquivos em:
- `/etc/ssl/certs/seu-dominio.crt`
- `/etc/ssl/private/seu-dominio.key`

### 6.2 Atualizar Configuração Nginx para HTTPS

```nginx
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name portaldegase.com.br www.portaldegase.com.br;
    return 301 https://$server_name$request_uri;
}

# Configuração HTTPS
server {
    listen 443 ssl http2;
    server_name portaldegase.com.br www.portaldegase.com.br;

    # Certificados SSL
    ssl_certificate /etc/ssl/certs/seu-dominio.crt;
    ssl_certificate_key /etc/ssl/private/seu-dominio.key;

    # Configurações SSL seguras
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Resto da configuração igual ao HTTP
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.3 Atualizar Variáveis de Ambiente para HTTPS

```env
# Alterar URLs para HTTPS
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Adicionar header de segurança
SECURE_COOKIES=true
```

### 6.4 Reiniciar Serviços

```bash
# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar aplicação
pm2 restart degase-cms
```

---

## Troubleshooting

### Problema: Porta 3000 já em uso

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 npm run start
```

### Problema: Erro de conexão com banco de dados

```bash
# Verificar conexão MySQL
mysql -u degase_user -p -h localhost -e "SELECT 1;"

# Verificar variável DATABASE_URL
echo $DATABASE_URL

# Testar conexão
npm run db:push -- --verbose
```

### Problema: Certificado SSL inválido (após migração HTTPS)

```bash
# Verificar certificado
openssl x509 -in /etc/ssl/certs/seu-dominio.crt -text -noout

# Testar SSL
openssl s_client -connect portaldegase.com.br:443
```

### Problema: Aplicação lenta ou travando

```bash
# Verificar uso de memória
free -h

# Verificar uso de CPU
top

# Aumentar limite de memória do Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run start
```

---

## Checklist de Migração

- [ ] Servidor preparado com Node.js e MySQL
- [ ] Repositório clonado
- [ ] Dependências instaladas
- [ ] Arquivo `.env.production` configurado
- [ ] Banco de dados criado
- [ ] Migrações executadas
- [ ] Projeto compilado (build)
- [ ] Aplicação iniciada com PM2
- [ ] Proxy reverso (Nginx/Apache) configurado
- [ ] Firewall configurado
- [ ] Acesso HTTP funcionando
- [ ] Backups automatizados configurados
- [ ] Monitoramento ativo
- [ ] Documentação atualizada
- [ ] Testes de carga realizados
- [ ] Plano de SSL futuro definido

---

## Suporte e Contato

Para dúvidas ou problemas durante a migração:

1. Consulte os logs: `pm2 logs degase-cms`
2. Verifique a documentação do Manus: https://docs.manus.im
3. Contate o suporte técnico do seu provedor de hospedagem

---

## Versão do Documento

- **Versão**: 1.0
- **Data**: 25 de Fevereiro de 2026
- **Status**: Produção
- **Última Atualização**: 25 de Fevereiro de 2026

---

## Notas Importantes

1. **Segurança**: Sempre use senhas fortes e altere as chaves padrão
2. **Backups**: Realize backups regulares do banco de dados
3. **Atualizações**: Mantenha Node.js, npm e dependências atualizadas
4. **SSL**: Planeje migrar para HTTPS assim que possível
5. **Monitoramento**: Configure alertas para downtime e erros críticos
6. **Performance**: Monitore métricas de CPU, memória e tempo de resposta

---

**Fim do Manual de Migração**
