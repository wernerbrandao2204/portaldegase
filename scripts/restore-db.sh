#!/bin/bash
# Script para restaurar o banco de dados caso ele seja perdido no reinício do sandbox
BACKUP_FILE="/home/ubuntu/backups/portal_db_init.sql"
DB_USER="degase"
DB_PASS="Degase@2026"
DB_NAME="portal_db"

echo "[DB Restore] Verificando banco de dados..."

# Verificar se o banco existe
mysql -u $DB_USER -p$DB_PASS -e "USE $DB_NAME;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "[DB Restore] Banco $DB_NAME não encontrado. Recriando..."
    sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME; CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASS'; GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost'; FLUSH PRIVILEGES;"
    
    if [ -f "$BACKUP_FILE" ]; then
        echo "[DB Restore] Restaurando dados do backup $BACKUP_FILE..."
        mysql -u $DB_USER -p$DB_PASS $DB_NAME < "$BACKUP_FILE"
        echo "[DB Restore] Restauração concluída."
    else
        echo "[DB Restore] Backup não encontrado. Executando migrações..."
        cd /home/ubuntu/portaldegase && export DATABASE_URL="mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME" && pnpm drizzle-kit push
        npx tsx scripts/seed-admin.ts
    fi
else
    echo "[DB Restore] Banco de dados já está ativo."
fi
