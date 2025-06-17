#!/bin/bash

# Mail Checker Update Script
set -e

APP_DIR="/root/mail-checker"
cd $APP_DIR

echo "🔄 Starting application update..."

# Backup before update
echo "💾 Creating backup before update..."
./scripts/backup.sh

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Stop services
echo "🛑 Stopping services..."
docker-compose -f docker-compose.prod.yml down

# Rebuild images
echo "🔨 Rebuilding Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Health check
echo "🏥 Performing health check..."
sleep 5

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Update completed successfully!"
else
    echo "❌ Health check failed. Check logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=20
    exit 1
fi 