# Researka VPS Deployment Guide

This guide provides instructions for deploying the Researka platform on an Ubuntu-based VPS with performance optimizations for hosting multiple websites.

## VPS Specifications

- **OS**: Ubuntu 22.04 LTS
- **RAM**: 8GB
- **vCPUs**: 2
- **Storage**: 25GB SSD
- **Plan**: $63/month

## Initial Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Essential Packages

```bash
sudo apt install -y nginx certbot python3-certbot-nginx ufw git curl build-essential
```

### 3. Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Node.js Setup

### 1. Install Node.js and npm

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Install PM2 for Process Management

```bash
sudo npm install -g pm2
```

## Nginx Configuration for Multiple Websites

### 1. Create Directory Structure

```bash
sudo mkdir -p /var/www/researka
sudo mkdir -p /var/www/other-site  # For additional websites
```

### 2. Set Permissions

```bash
sudo chown -R $USER:$USER /var/www/researka
sudo chown -R $USER:$USER /var/www/other-site
```

### 3. Configure Nginx for Researka

Copy the Nginx configuration file from your project:

```bash
sudo cp /path/to/researka.conf /etc/nginx/sites-available/researka.conf
sudo ln -s /etc/nginx/sites-available/researka.conf /etc/nginx/sites-enabled/
```

### 4. Configure Nginx for Additional Websites

Create a similar configuration for each additional website:

```bash
sudo nano /etc/nginx/sites-available/other-site.conf
```

Use a similar configuration to the Researka one, changing the domain name and root directory.

### 5. Test and Restart Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Certificates

### 1. Obtain SSL Certificates

```bash
sudo certbot --nginx -d researka.org -d www.researka.org
```

Repeat for other domains:

```bash
sudo certbot --nginx -d other-site.com -d www.other-site.com
```

### 2. Auto-renewal Setup

Certbot creates a timer by default. Verify with:

```bash
sudo systemctl status certbot.timer
```

## Deploying Researka

### 1. Clone Repository

```bash
git clone https://github.com/your-username/researka.git /var/www/researka/repo
cd /var/www/researka/repo
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Build the Application

```bash
npm run build
```

### 4. Copy Build Files

```bash
cp -r dist/* /var/www/researka/
```

## Performance Optimizations

### 1. Nginx Performance Tuning

Edit the main Nginx configuration:

```bash
sudo nano /etc/nginx/nginx.conf
```

Add the following inside the `http` block:

```nginx
# Optimize worker connections
worker_processes auto;
worker_rlimit_nofile 65535;
events {
    worker_connections 65535;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Buffer Size
    client_body_buffer_size 10K;
    client_header_buffer_size 1k;
    client_max_body_size 8m;
    large_client_header_buffers 4 4k;
    
    # File Cache
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### 2. Enable Brotli Compression

Install the Brotli module:

```bash
sudo apt install -y nginx-module-brotli
```

Add to `/etc/nginx/nginx.conf` in the `http` block:

```nginx
load_module modules/ngx_http_brotli_filter_module.so;
load_module modules/ngx_http_brotli_static_module.so;
```

### 3. Set Up CDN for Static Assets

1. Sign up for a CDN service like Cloudflare, AWS CloudFront, or BunnyCDN
2. Configure your domain to use the CDN
3. Update your Nginx configuration to set proper cache headers

### 4. Memory Optimization

Create a swap file for additional memory:

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 5. System Tuning

Edit system limits:

```bash
sudo nano /etc/sysctl.conf
```

Add the following:

```
# Increase system file descriptor limit
fs.file-max = 65535

# Increase TCP max buffer size
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216

# Increase Linux autotuning TCP buffer limits
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# Increase TCP max connections
net.core.somaxconn = 65535
```

Apply changes:

```bash
sudo sysctl -p
```

## Monitoring and Maintenance

### 1. Set Up Monitoring with PM2

```bash
pm2 install pm2-server-monit
```

### 2. Automated Backups

Install and configure backup tool:

```bash
sudo apt install -y restic
```

Set up a cron job for regular backups:

```bash
sudo crontab -e
```

Add:

```
0 2 * * * restic backup /var/www/researka /etc/nginx/sites-available
```

### 3. Log Rotation

Ensure log rotation is configured:

```bash
sudo nano /etc/logrotate.d/nginx
```

## Multiple Website Management

### 1. Create a Deployment Script

Create a script to simplify deployments:

```bash
nano /home/ubuntu/deploy.sh
```

Add:

```bash
#!/bin/bash
# Usage: ./deploy.sh researka

SITE=$1
REPO_DIR="/var/www/$SITE/repo"
WEB_DIR="/var/www/$SITE"

cd $REPO_DIR
git pull
npm install --legacy-peer-deps
npm run build
cp -r dist/* $WEB_DIR/
```

Make it executable:

```bash
chmod +x /home/ubuntu/deploy.sh
```

### 2. Set Up GitHub Actions for Automated Deployment

Create a workflow file in your repository:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.PRIVATE_KEY }}
          script: |
            cd /var/www/researka/repo
            git pull
            npm install --legacy-peer-deps
            npm run build
            cp -r dist/* /var/www/researka/
```

## Troubleshooting

### Common Issues

1. **Nginx 502 Bad Gateway**: Check if your application is running and accessible
2. **SSL Certificate Issues**: Verify certificate paths and permissions
3. **Performance Problems**: Check server load, memory usage, and Nginx error logs

### Useful Commands

- Check Nginx status: `sudo systemctl status nginx`
- View Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Test Nginx configuration: `sudo nginx -t`
- Restart Nginx: `sudo systemctl restart nginx`
- Check system resources: `htop`

## Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
