#!/bin/bash

echo "🚀 Starting Reloop Local Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if reloop.local is in hosts file
if ! grep -q "reloop.local" /etc/hosts; then
    echo "⚠️  reloop.local not found in /etc/hosts. Adding it now..."
    echo "127.0.0.1 reloop.local" | sudo tee -a /etc/hosts
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ../docker-data/caddy
mkdir -p ../docker-data/rspamd
mkdir -p ../docker-data/ssl
mkdir -p ../docker-data/vmail
mkdir -p ../docker-data/postfix

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait a moment for services to start
sleep 5

# Check service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Reloop Local Development Environment is starting up!"
echo ""
echo "🌐 Access your applications at:"
echo "   Main App: http://reloop.local"
echo "   Dashboard: http://reloop.local/dashboard"
echo "   Dev: http://reloop.local/dev"
echo "   Docs: http://reloop.local/docs"
echo "   Admin: http://reloop.local/admin"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
