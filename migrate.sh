#!/bin/bash

################################################################################
# Script de Migração Automatizada - CMS DEGASE
# 
# Descrição: Automatiza completamente a migração do CMS DEGASE para servidor
#            RedHat/CentOS sem certificado SSL
#
# Uso: bash migrate.sh
# 
# Pré-requisitos:
#   - Arquivo migration.env com todas as configurações
#   - Acesso SSH ao servidor
#   - Chave privada SSH configurada
#
# Autor: DEGASE
# Data: 25 de Fevereiro de 2026
# Versão: 1.0
################################################################################

set -e  # Sair se houver erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Função para executar comando remoto
run_remote() {
    local cmd="$1"
    ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
}

# Função para copiar arquivo para servidor
copy_to_server() {
    local local_file="$1"
    local remote_path="$2"
    scp -i "$SSH_KEY_PATH" -P "$SSH_PORT" "$local_file" "$SSH_USER@$SSH_HOST:$remote_path"
}

# Função para validar variáveis
validate_config() {
    local missing_vars=()
    
    local required_vars=(
        "SSH_USER" "SSH_HOST" "SSH_PORT" "SSH_KEY_PATH"
        "GITHUB_REPO" "GITHUB_BRANCH"
        "APP_DIR" "APP_USER" "APP_GROUP" "APP_PORT"
        "DB_HOST" "DB_PORT" "DB_NAME" "DB_USER" "DB_PASSWORD"
        "DOMAIN_NAME"
        "VITE_APP_ID" "BUILT_IN_FORGE_API_KEY" "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Variáveis obrigatórias faltando:"
        printf '%s\n' "${missing_vars[@]}" | sed 's/^/  - /'
        return 1
    fi
    
    return 0
}

# Função para testar conectividade
test_connectivity() {
    log_info "Testando conectividade SSH..."
    if run_remote "echo 'Conectado com sucesso'" > /dev/null 2>&1; then
        log_success "Conectividade SSH OK"
    else
        log_error "Falha ao conectar via SSH"
        return 1
    fi
    
    log_info "Testando acesso ao GitHub..."
    if git ls-remote "$GITHUB_REPO" > /dev/null 2>&1; then
        log_success "Acesso ao GitHub OK"
    else
        log_error "Falha ao acessar GitHub"
        return 1
    fi
}

# Fase 1: Preparação do Servidor
phase_prepare_server() {
    log_section "FASE 1: Preparação do Servidor"
    
    log_info "Atualizando sistema..."
    run_remote "sudo yum update -y" || log_warning "Falha ao atualizar sistema"
    
    log_info "Instalando dependências..."
    run_remote "sudo yum install -y git curl wget nano" || log_warning "Algumas dependências podem já estar instaladas"
    
    log_success "Servidor preparado"
}

# Fase 2: Instalação de Node.js
phase_install_nodejs() {
    log_section "FASE 2: Instalação de Node.js"
    
    log_info "Verificando se Node.js já está instalado..."
    if run_remote "which node" > /dev/null 2>&1; then
        log_success "Node.js já instalado"
        run_remote "node --version"
    else
        log_info "Instalando Node.js $NODE_VERSION..."
        run_remote "curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -"
        run_remote "sudo yum install -y nodejs"
        log_success "Node.js instalado"
    fi
    
    if [ "$PNPM_ENABLED" = "true" ]; then
        log_info "Instalando pnpm..."
        run_remote "npm install -g pnpm"
        log_success "pnpm instalado"
    fi
}

# Fase 3: Instalação de MySQL
phase_install_mysql() {
    log_section "FASE 3: Instalação de MySQL"
    
    log_info "Verificando se MySQL já está instalado..."
    if run_remote "which mysql" > /dev/null 2>&1; then
        log_success "MySQL já instalado"
    else
        log_info "Instalando MySQL Server..."
        run_remote "sudo yum install -y mysql-server"
        run_remote "sudo systemctl start mysqld"
        run_remote "sudo systemctl enable mysqld"
        log_success "MySQL instalado"
    fi
}

# Fase 4: Configuração de Banco de Dados
phase_setup_database() {
    log_section "FASE 4: Configuração de Banco de Dados"
    
    log_info "Criando banco de dados '$DB_NAME'..."
    run_remote "mysql -u root -p'$DB_ROOT_PASSWORD' -e \"CREATE DATABASE IF NOT EXISTS $DB_NAME;\""
    
    log_info "Criando usuário do banco de dados..."
    run_remote "mysql -u root -p'$DB_ROOT_PASSWORD' -e \"CREATE USER IF NOT EXISTS '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASSWORD';\""
    
    log_info "Concedendo permissões..."
    run_remote "mysql -u root -p'$DB_ROOT_PASSWORD' -e \"GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'$DB_HOST'; FLUSH PRIVILEGES;\""
    
    log_success "Banco de dados configurado"
}

# Fase 5: Instalação de Nginx
phase_install_nginx() {
    log_section "FASE 5: Instalação de Proxy Reverso"
    
    if [ "$NGINX_ENABLED" = "true" ]; then
        log_info "Instalando Nginx..."
        run_remote "sudo yum install -y nginx"
        run_remote "sudo systemctl start nginx"
        run_remote "sudo systemctl enable nginx"
        log_success "Nginx instalado"
    elif [ "$APACHE_ENABLED" = "true" ]; then
        log_info "Instalando Apache..."
        run_remote "sudo yum install -y httpd mod_proxy mod_proxy_http"
        run_remote "sudo systemctl start httpd"
        run_remote "sudo systemctl enable httpd"
        log_success "Apache instalado"
    fi
}

# Fase 6: Configuração de SELinux
phase_configure_selinux() {
    log_section "FASE 6: Configuração de SELinux"
    
    if [ "$SELINUX_ENABLED" = "true" ]; then
        log_info "Configurando SELinux para permitir conexões ao Node.js..."
        run_remote "sudo setsebool -P httpd_can_network_connect on"
        log_success "SELinux configurado"
    fi
}

# Fase 7: Configuração de Firewall
phase_configure_firewall() {
    log_section "FASE 7: Configuração de Firewall"
    
    if [ "$FIREWALL_TYPE" = "firewalld" ]; then
        if [ "$FIREWALL_HTTP_ENABLED" = "true" ]; then
            log_info "Abrindo porta 80 (HTTP)..."
            run_remote "sudo firewall-cmd --permanent --add-service=http"
        fi
        
        if [ "$FIREWALL_HTTPS_ENABLED" = "true" ]; then
            log_info "Abrindo porta 443 (HTTPS)..."
            run_remote "sudo firewall-cmd --permanent --add-service=https"
        fi
        
        log_info "Abrindo porta $APP_PORT..."
        run_remote "sudo firewall-cmd --permanent --add-port=$APP_PORT/tcp"
        
        log_info "Recarregando firewall..."
        run_remote "sudo firewall-cmd --reload"
        log_success "Firewall configurado"
    fi
}

# Fase 8: Clonagem do Repositório
phase_clone_repository() {
    log_section "FASE 8: Clonagem do Repositório"
    
    log_info "Criando diretório da aplicação..."
    run_remote "sudo mkdir -p $APP_DIR"
    run_remote "sudo chown -R $SSH_USER:$SSH_USER $APP_DIR"
    
    log_info "Clonando repositório..."
    run_remote "cd $APP_DIR && git clone -b $GITHUB_BRANCH $GITHUB_REPO ."
    
    log_success "Repositório clonado"
}

# Fase 9: Instalação de Dependências
phase_install_dependencies() {
    log_section "FASE 9: Instalação de Dependências"
    
    log_info "Instalando dependências do projeto..."
    if [ "$PNPM_ENABLED" = "true" ]; then
        run_remote "cd $APP_DIR && pnpm install"
    else
        run_remote "cd $APP_DIR && npm install"
    fi
    
    log_success "Dependências instaladas"
}

# Fase 10: Configuração de Variáveis de Ambiente
phase_setup_environment() {
    log_section "FASE 10: Configuração de Variáveis de Ambiente"
    
    log_info "Criando arquivo .env.production..."
    
    local env_content="NODE_ENV=production
DATABASE_URL=mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
VITE_APP_ID=$VITE_APP_ID
BUILT_IN_FORGE_API_KEY=$BUILT_IN_FORGE_API_KEY
VITE_FRONTEND_FORGE_API_KEY=$VITE_FRONTEND_FORGE_API_KEY
JWT_SECRET=$JWT_SECRET
OAUTH_SERVER_URL=${OAUTH_SERVER_URL:-https://api.manus.im}
VITE_OAUTH_PORTAL_URL=${VITE_OAUTH_PORTAL_URL:-https://portal.manus.im}
BUILT_IN_FORGE_API_URL=${BUILT_IN_FORGE_API_URL:-https://api.manus.im}
VITE_FRONTEND_FORGE_API_URL=${VITE_FRONTEND_FORGE_API_URL:-https://api.manus.im}
OWNER_NAME=${OWNER_NAME:-DEGASE}
OWNER_OPEN_ID=${OWNER_OPEN_ID:-}
VITE_ANALYTICS_ENDPOINT=${VITE_ANALYTICS_ENDPOINT:-}
VITE_ANALYTICS_WEBSITE_ID=${VITE_ANALYTICS_WEBSITE_ID:-}
VITE_APP_TITLE=${VITE_APP_TITLE:-CMS DEGASE}
VITE_APP_LOGO=${VITE_APP_LOGO:-}"
    
    run_remote "cat > $APP_DIR/.env.production << 'EOF'
$env_content
EOF"
    
    run_remote "chmod 600 $APP_DIR/.env.production"
    log_success "Variáveis de ambiente configuradas"
}

# Fase 11: Build da Aplicação
phase_build_application() {
    log_section "FASE 11: Build da Aplicação"
    
    log_info "Compilando aplicação..."
    if [ "$PNPM_ENABLED" = "true" ]; then
        run_remote "cd $APP_DIR && pnpm build"
    else
        run_remote "cd $APP_DIR && npm run build"
    fi
    
    log_success "Aplicação compilada"
}

# Fase 12: Configuração de PM2
phase_setup_pm2() {
    log_section "FASE 12: Configuração de PM2"
    
    if [ "$PM2_ENABLED" = "true" ]; then
        log_info "Instalando PM2..."
        run_remote "sudo npm install -g pm2"
        
        log_info "Criando arquivo ecosystem.config.js..."
        local pm2_config="module.exports = {
  apps: [{
    name: '$PM2_APP_NAME',
    script: './server.js',
    cwd: '$APP_DIR',
    instances: '$PM2_INSTANCES',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    },
    error_file: '$LOG_DIR/pm2-error.log',
    out_file: '$LOG_DIR/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    watch: $PM2_WATCH,
    ignore_watch: ['node_modules', 'logs'],
    max_memory_restart: '1G'
  }]
};"
        
        run_remote "cat > $APP_DIR/ecosystem.config.js << 'EOF'
$pm2_config
EOF"
        
        log_info "Iniciando aplicação com PM2..."
        run_remote "cd $APP_DIR && pm2 start ecosystem.config.js"
        run_remote "pm2 save"
        run_remote "sudo pm2 startup"
        
        log_success "PM2 configurado"
    fi
}

# Fase 13: Configuração de Nginx
phase_configure_nginx() {
    log_section "FASE 13: Configuração de Proxy Reverso"
    
    if [ "$NGINX_ENABLED" = "true" ]; then
        log_info "Criando configuração Nginx..."
        
        local nginx_config="server {
    listen 80;
    server_name $DOMAIN_NAME $DOMAIN_ALIAS;
    
    access_log $LOG_DIR/nginx-access.log;
    error_log $LOG_DIR/nginx-error.log;
    
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /health {
        access_log off;
        proxy_pass http://localhost:$APP_PORT/health;
    }
}"
        
        run_remote "sudo tee /etc/nginx/conf.d/portaldegase.conf > /dev/null << 'EOF'
$nginx_config
EOF"
        
        log_info "Testando configuração Nginx..."
        run_remote "sudo nginx -t"
        
        log_info "Reiniciando Nginx..."
        run_remote "sudo systemctl restart nginx"
        
        log_success "Nginx configurado"
    fi
}

# Fase 14: Criação de Diretórios de Logs
phase_setup_logs() {
    log_section "FASE 14: Configuração de Logs"
    
    log_info "Criando diretórios de logs..."
    run_remote "sudo mkdir -p $LOG_DIR"
    run_remote "sudo chown -R $APP_USER:$APP_GROUP $LOG_DIR"
    run_remote "sudo chmod 755 $LOG_DIR"
    
    log_success "Diretórios de logs criados"
}

# Fase 15: Verificação de Saúde
phase_health_check() {
    log_section "FASE 15: Verificação de Saúde"
    
    log_info "Aguardando aplicação iniciar..."
    sleep 5
    
    log_info "Testando conectividade..."
    if run_remote "curl -s http://localhost:$APP_PORT/health" > /dev/null 2>&1; then
        log_success "Aplicação respondendo"
    else
        log_warning "Aplicação pode estar ainda iniciando"
    fi
    
    log_info "Testando acesso via domínio..."
    if run_remote "curl -s -H 'Host: $DOMAIN_NAME' http://localhost/ > /dev/null 2>&1"; then
        log_success "Acesso via domínio OK"
    else
        log_warning "Verifique a configuração de DNS"
    fi
}

# Fase 16: Configuração de Backup
phase_setup_backup() {
    log_section "FASE 16: Configuração de Backup"
    
    if [ "$BACKUP_ENABLED" = "true" ]; then
        log_info "Criando diretório de backup..."
        run_remote "sudo mkdir -p $BACKUP_DIR"
        run_remote "sudo chown -R $APP_USER:$APP_GROUP $BACKUP_DIR"
        
        log_info "Criando script de backup..."
        local backup_script="#!/bin/bash
BACKUP_DIR=$BACKUP_DIR
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
RETENTION_DAYS=$BACKUP_RETENTION_DAYS

BACKUP_FILE=\$BACKUP_DIR/\${DB_NAME}_\$(date +%Y%m%d_%H%M%S).sql

mysqldump -u \$DB_USER -p\$DB_PASSWORD \$DB_NAME > \$BACKUP_FILE

if [ \"$BACKUP_COMPRESS\" = \"true\" ]; then
    gzip \$BACKUP_FILE
fi

find \$BACKUP_DIR -type f -mtime +\$RETENTION_DAYS -delete
"
        
        run_remote "sudo tee /usr/local/bin/backup-degase.sh > /dev/null << 'EOF'
$backup_script
EOF"
        
        run_remote "sudo chmod +x /usr/local/bin/backup-degase.sh"
        
        log_info "Agendando backup com cron..."
        run_remote "echo '0 2 * * * /usr/local/bin/backup-degase.sh' | sudo tee /etc/cron.d/degase-backup"
        
        log_success "Backup configurado"
    fi
}

# Função principal
main() {
    log_section "CMS DEGASE - MIGRAÇÃO AUTOMATIZADA"
    
    # Verificar se arquivo de configuração existe
    if [ ! -f "migration.env" ]; then
        log_error "Arquivo 'migration.env' não encontrado!"
        log_info "Crie o arquivo usando o template: migration.env.example"
        exit 1
    fi
    
    # Carregar variáveis de configuração
    log_info "Carregando configurações..."
    source migration.env
    
    # Validar configuração
    log_info "Validando configuração..."
    if ! validate_config; then
        exit 1
    fi
    log_success "Configuração validada"
    
    # Testar conectividade
    log_info "Testando conectividade..."
    if ! test_connectivity; then
        exit 1
    fi
    
    # Executar fases de migração
    phase_prepare_server
    phase_install_nodejs
    phase_install_mysql
    phase_setup_database
    phase_install_nginx
    phase_configure_selinux
    phase_configure_firewall
    phase_clone_repository
    phase_install_dependencies
    phase_setup_environment
    phase_build_application
    phase_setup_pm2
    phase_configure_nginx
    phase_setup_logs
    phase_setup_backup
    phase_health_check
    
    # Resumo final
    log_section "MIGRAÇÃO CONCLUÍDA COM SUCESSO!"
    
    echo -e "${GREEN}Resumo da Migração:${NC}"
    echo "  Servidor: $SSH_HOST"
    echo "  Aplicação: $APP_DIR"
    echo "  Domínio: $DOMAIN_NAME"
    echo "  Banco de Dados: $DB_NAME"
    echo "  URL: http://$DOMAIN_NAME"
    echo ""
    echo -e "${YELLOW}Próximos Passos:${NC}"
    echo "  1. Verifique se o site está acessível em http://$DOMAIN_NAME"
    echo "  2. Configure seu DNS para apontar para $DOMAIN_IP"
    echo "  3. Quando tiver certificado SSL, execute: bash migrate-https.sh"
    echo "  4. Monitore os logs em: $LOG_DIR"
    echo ""
    log_success "Migração finalizada!"
}

# Executar função principal
main "$@"
