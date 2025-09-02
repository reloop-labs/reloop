#!/bin/bash

set -e

echo "^-^ Setting up Reloop Complete Application Stack..."
echo "=================================================="
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "X-X This script should not be run as root X-X"
   echo "Please run as a regular user with sudo privileges"
   exit 1
fi

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "X-X Docker is not installed. Please install Docker first. X-X"
    curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
    exit 1
fi

# Check for Docker Compose V2 (preferred) or V1
if docker compose version &> /dev/null; then
    echo " :) Docker Compose V2 detected"
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    echo " :) Docker Compose V1 detected"
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo "X-X Docker Compose is not installed. Please install Docker Compose first. X-X"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "X-X Docker is not running or not accessible X-X"
    echo "Please start Docker and ensure your user is in the docker group"
    sudo usermod -aG docker \$USER && newgrp docker
    exit 1
fi

echo ">>> Prerequisites check passed"
echo ""


REPO_URL="https://raw.githubusercontent.com/reloop-labs/reloop/main"


echo ">>> Downloading configuration files..."

if [ ! -f docker-compose.setup.yml ]; then
    echo "Downloading docker-compose.setup.yml..."
    curl -fsSL "$REPO_URL/docker-compose.setup.yml" -o docker-compose.setup.yml
    if [ $? -ne 0 ]; then
        echo "X-X Failed to download docker-compose.setup.yml X-X"
        exit 1
    fi
    echo ":) docker-compose.setup.yml downloaded"
else
    echo ":) docker-compose.setup.yml already exists"
fi

if [ ! -f env.example.mail ]; then
    echo "Downloading env.example.mail..."
    curl -fsSL "$REPO_URL/env.example.mail" -o env.example.mail
    if [ $? -ne 0 ]; then
        echo "X-X Failed to download env.example.mail X-X"
        exit 1
    fi
    echo ":) env.example.mail downloaded"
else
    echo ":) env.example.mail already exists"
fi

# Create necessary directories
echo ">>> Creating directories..."
mkdir -p docker-data/{postgres,redis,rspamd,vmail,postfix,dovecot,caddy}
mkdir -p docker-data/rspamd/dkim
mkdir -p docker-data/{postfix,dovecot,rspamd}/logs
mkdir -p docker-data/ssl

# Set proper permissions for Rspamd DKIM directory
echo "!! Setting Rspamd permissions..."
sudo chown -R 11333:11333 docker-data/rspamd/dkim
echo ":) Directories created and permissions set"
echo ""

if [ ! -f docker-data/ssl/cert.pem ] || [ ! -f docker-data/ssl/key.pem ]; then
    echo "!! Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout docker-data/ssl/key.pem \
        -out docker-data/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Reloop/CN=reloop.localhost"
    
    # Set proper permissions
    chmod 600 docker-data/ssl/key.pem
    chmod 644 docker-data/ssl/cert.pem
    echo ":) Self-signed certificates generated"
    echo " !! For production, replace with proper certificates"
else
    echo ":) SSL certificates already exist"
fi

if [ ! -f .env ]; then
    echo ""
    echo ">>> Domain Configuration"
    echo "======================"
    echo "Enter your domain name (e.g., yourdomain.com):"
    read -p "Domain: " DOMAIN
    if [ -z "$DOMAIN" ]; then
        echo "Using default domain: localhost"
        DOMAIN="localhost"
    fi
    echo ""
    echo ">>> Creating .env file..."
    curl -fsSL "$REPO_URL/env.example.mail" -o .env
    if [ $? -ne 0 ]; then
        echo "X-X Failed to download .env X-X"
        exit 1
    fi
    echo ">>> .env file created with domain: $DOMAIN"
    sed -i "s/DOMAIN=$DOMAIN/DOMAIN=$DOMAIN/g" .env
    echo "   Using domain: $DOMAIN"
else
    DOMAIN=$(grep "^DOMAIN=" .env | cut -d'=' -f2)
    echo ":) .env file already exists, using existing configuration (DOMAIN=$DOMAIN)"
fi

echo ""
echo ">>> Updating Caddyfile..."
curl -fsSL "$REPO_URL/Caddyfile" -o Caddyfile
if [ $? -ne 0 ]; then
    echo "X-X Failed to download Caddyfile X-X"
    exit 1
fi
echo "Enter your email for SSL Certificate:"
read -p "Email: " SSL_EMAIL
sed -i "s/EMAIL/$SSL_EMAIL/g" Caddyfile
sed -i "s/localhost/$DOMAIN/g" Caddyfile
echo " Caddyfile updated for domain: $DOMAIN"

echo ""
echo ">>> Firewall applying "
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 25/tcp    # SMTP
sudo ufw allow 465/tcp    # SMTPS
sudo ufw allow 587/tcp    # SMTP Submission
sudo ufw allow 143/tcp    # IMAP
sudo ufw allow 993/tcp    # IMAPS
sudo ufw allow 110/tcp    # POP3
sudo ufw allow 995/tcp    # POP3S
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw allow 3001/tcp   # fe-main (dashboard)
sudo ufw allow 3002/tcp   # fe-dev
sudo ufw allow 3003/tcp   # fe-docs
sudo ufw allow 3004/tcp   # fe-admin
sudo ufw allow 3005/tcp   # fe-
echo "Do you want postgres and redis externally available??(y/n)"
read -p "Enter your choice: " POSTGRES_REDIS
if [ "$POSTGRES_REDIS" == "y" ]; then
    sudo ufw allow 5432/tcp   # PostgreSQL
    sudo ufw allow 6379/tcp   # Redis
fi
sudo ufw enable
echo ":) Firewall applied"
echo ""

echo ""
echo "~~Starting containers..."
$DOCKER_COMPOSE_CMD -f docker-compose.setup.yml up -d

echo ""
echo "...Waiting for services to start..."
sleep 15

echo ""
echo "#Service Status:"
$DOCKER_COMPOSE_CMD -f docker-compose.setup.yml ps

echo ""
echo " :) Reloop Complete Application Stack setup complete!"
echo ""
echo " Application URLs:"
echo "   Main Dashboard: http://$DOMAIN/dashboard"
echo "   Development: http://$DOMAIN/dev"
echo "   Documentation: http://$DOMAIN/docs"
echo "   Admin Panel: http://$DOMAIN/admin"
echo "   Web App: http://$DOMAIN/"
echo ""
echo " Mail Server Information:"
echo "   SMTP: $DOMAIN:25"
echo "   SMTPS: $DOMAIN:465"
echo "   Submission: $DOMAIN:587"
echo "   IMAP: $DOMAIN:143"
echo "   IMAPS: $DOMAIN:993"
echo "   POP3: $DOMAIN:110"
echo "   POP3S: $DOMAIN:995"
echo ""
echo "  @ Next steps:"
echo "   1. Configure your DNS records (A, MX, SPF, DKIM, DMARC)"
echo "   2. Set up your database with initial data"
echo "   3. Add users to your database"
echo "   4. Test application access"
echo "   5. Monitor logs: docker-compose -f docker-compose.setup.yml logs -f"
echo ""
echo "  @ Useful commands:"
echo "   View logs: $DOCKER_COMPOSE_CMD -f docker-compose.setup.yml logs -f"
echo "   Stop services: $DOCKER_COMPOSE_CMD -f docker-compose.setup.yml down"
echo "   Restart services: $DOCKER_COMPOSE_CMD -f docker-compose.setup.yml restart"
echo "   Check status: $DOCKER_COMPOSE_CMD -f docker-compose.setup.yml ps"
echo ""
echo "  @ DKIM Key Management:"
echo "   Generate DKIM key: sudo rspamadm dkim_keygen -s mail -d $DOMAIN -k docker-data/rspamd/dkim/$DOMAIN/mail.private > docker-data/rspamd/dkim/$DOMAIN/mail.txt"
echo "   Set permissions: sudo chown -R 11333:11333 docker-data/rspamd/dkim/$DOMAIN/"
echo "   Restart Rspamd: $DOCKER_COMPOSE_CMD -f docker-compose.setup.yml restart reloop-rspamd"
echo ""
echo " For detailed setup instructions, check the README.md file"
