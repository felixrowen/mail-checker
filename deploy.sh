#!/bin/bash

# Mail Checker Deployment Script - Separate Containers
set -e

echo "🚀 Starting Mail Checker deployment with separate containers..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please create .env file with required variables:"
    print_error "  POSTGRES_DB=mailchecker"
    print_error "  POSTGRES_USER=postgres"
    print_error "  POSTGRES_PASSWORD=your-secure-password"
    print_error "  JWT_SECRET=your-jwt-secret"
    exit 1
fi

# Check for required environment variables
print_step "Validating environment variables..."
source .env

required_vars=("POSTGRES_DB" "POSTGRES_USER" "POSTGRES_PASSWORD" "JWT_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        print_error "  $var"
    done
    exit 1
fi

# Security check - warn about weak credentials
if [ "$POSTGRES_PASSWORD" = "password" ] || [ "$JWT_SECRET" = "secret" ] || [ ${#JWT_SECRET} -lt 32 ]; then
    print_warning "Security Warning: Please use strong passwords and JWT secrets!"
    print_warning "JWT_SECRET should be at least 32 characters long."
fi

# Stop and remove existing containers
print_step "Stopping existing containers..."
docker-compose down || true

# Remove old images to ensure fresh build
print_step "Removing old images..."
docker-compose down --rmi all --volumes --remove-orphans || true

# Build all services
print_step "Building Docker images..."
docker-compose build --no-cache

# Start the database first
print_step "Starting database..."
docker-compose up -d db

# Wait for database to be ready
print_status "Waiting for database to be ready..."
until docker-compose exec db pg_isready -U $POSTGRES_USER; do
    echo "Waiting for postgres..."
    sleep 2
done

# Start backend service
print_step "Starting backend service..."
docker-compose up -d backend

# Wait for backend to be ready
print_status "Waiting for backend to be ready..."
sleep 10

# Run database migrations
print_step "Running database migrations..."
docker-compose exec backend npx prisma migrate deploy

# Start frontend service
print_step "Starting frontend service..."
docker-compose up -d frontend

# Wait for all services to be ready
print_status "Waiting for all services to start..."
sleep 5

# Check if all services are running
print_step "Checking service status..."
if docker-compose ps | grep -q "Up.*frontend" && docker-compose ps | grep -q "Up.*backend" && docker-compose ps | grep -q "Up.*db"; then
    print_status "✅ Deployment successful!"
    echo ""
    print_status "🌐 Frontend: http://localhost (nginx serving React app)"
    print_status "🔧 Backend API: http://localhost:3000"
    print_status "📊 Database: localhost:5432"
    echo ""
    print_status "Service Status:"
    docker-compose ps
    echo ""
    print_status "Useful commands:"
    print_status "  View logs: docker-compose logs -f [service_name]"
    print_status "  Stop all: docker-compose down"
    print_status "  Restart: docker-compose restart [service_name]"
else
    print_error "❌ Deployment failed!"
    print_status "Service status:"
    docker-compose ps
    print_status "Check logs with: docker-compose logs [service_name]"
    exit 1
fi 