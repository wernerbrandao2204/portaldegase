#!/bin/bash
# Script de inicialização automática do Portal DEGASE no Manus

# 1. Iniciar o serviço MySQL
sudo /usr/sbin/mysqld --daemonize
sleep 5

# 2. Restaurar ou garantir banco de dados
/bin/bash /home/ubuntu/portaldegase/scripts/restore-db.sh

# 3. Iniciar servidor via PM2
cd /home/ubuntu/portaldegase
export DATABASE_URL="mysql://degase:Degase@2026@localhost:3306/portal_db"
pnpm pm2 start dist/index.js --name degase-portal --env production || pnpm pm2 restart degase-portal

# 4. Manter logs monitorados
pnpm pm2 save
echo "[Startup] Portal DEGASE iniciado com sucesso."
