#!/bin/bash

# Mail Checker Backup Script
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/root/mail-checker"

echo "🔄 Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "📊 Backing up database..."
docker-compose -f $APP_DIR/docker-compose.prod.yml exec -T db pg_dump -U postgres mailchecker > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
echo "📁 Backing up application files..."
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Backup environment and config
echo "⚙️ Backing up configuration..."
cp $APP_DIR/.env $BACKUP_DIR/env_backup_$DATE
cp /etc/nginx/sites-available/mail-checker $BACKUP_DIR/nginx_backup_$DATE.conf

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*backup*" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR"
ls -la $BACKUP_DIR 