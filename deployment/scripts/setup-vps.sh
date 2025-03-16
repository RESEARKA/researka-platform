#!/bin/bash

# Setup script for Researka platform on Ubuntu VPS
# This script automates the initial server setup described in the deployment guide

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
  print_error "This script must be run as root"
  exit 1
fi

# Update system packages
print_message "Updating system packages..."
apt update
apt upgrade -y

# Install essential packages
print_message "Installing essential packages..."
apt install -y curl wget git ufw software-properties-common gnupg2

# Set up firewall
print_message "Setting up firewall..."
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Install Node.js
print_message "Installing Node.js..."
curl -sL https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs
node -v
npm -v

# Install Nginx
print_message "Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# Install Certbot
print_message "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Install Brotli module for Nginx
print_message "Installing Brotli module for Nginx..."
apt install -y nginx-module-brotli

# Create web directories
print_message "Creating web directories..."
mkdir -p /var/www/researka.org
chown -R www-data:www-data /var/www/researka.org
chmod -R 755 /var/www/researka.org

# Install PM2 for process management
print_message "Installing PM2..."
npm install -g pm2

# Set up automatic updates
print_message "Setting up automatic updates..."
apt install -y unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

# Set up log rotation
print_message "Setting up log rotation..."
cat > /etc/logrotate.d/nginx << 'EOL'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -s /run/nginx.pid ] && kill -USR1 `cat /run/nginx.pid`
    endscript
}
EOL

# Install Docker and Docker Compose (optional)
print_message "Installing Docker and Docker Compose..."
apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt update
apt install -y docker-ce docker-ce-cli containerd.io
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create non-root user with sudo privileges
print_message "Creating non-root user 'deployer'..."
adduser --gecos "" --disabled-password deployer
usermod -aG sudo deployer
usermod -aG docker deployer

# Set up SSH key authentication for the new user
print_message "Setting up SSH key authentication..."
mkdir -p /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
touch /home/deployer/.ssh/authorized_keys
chmod 600 /home/deployer/.ssh/authorized_keys
chown -R deployer:deployer /home/deployer/.ssh

print_message "Please add your SSH public key to /home/deployer/.ssh/authorized_keys"
print_message "After that, you can disable password authentication for SSH"

# Final message
print_message "Server setup completed successfully!"
print_message "Next steps:"
print_message "1. Add your SSH public key to /home/deployer/.ssh/authorized_keys"
print_message "2. Configure Nginx for your domain using the provided configuration"
print_message "3. Obtain SSL certificates using Certbot"
print_message "4. Deploy your application"
