# Researka Platform Deployment Guide

This guide provides instructions for deploying the Researka platform on an Ubuntu-based VPS with performance optimizations.

## VPS Specifications

The recommended VPS specifications for hosting the Researka platform:
- Ubuntu 22.04 LTS
- 8GB RAM
- 2 vCPUs
- 25GB SSD storage

## Initial Server Setup

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Required Dependencies

```bash
sudo apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx
```

### 3. Install Node.js and npm

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. Install PM2 for Process Management

```bash
sudo npm install -g pm2
```

## Deploying the Researka Platform

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/researka-frontend.git
cd researka-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Application

```bash
# Build with production optimizations
npm run build:prod

# Analyze the bundle (optional)
npm run analyze-bundle

# Optimize images
npm run optimize-images
```

### 4. Configure Nginx

1. Copy the Nginx configuration files:

```bash
sudo mkdir -p /etc/nginx/sites-available
sudo cp nginx/researka.conf /etc/nginx/sites-available/researka.conf
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
```

2. Create symbolic links:

```bash
sudo ln -s /etc/nginx/sites-available/researka.conf /etc/nginx/sites-enabled/
```

3. Create required directories:

```bash
sudo mkdir -p /var/www/researka
sudo mkdir -p /var/cache/nginx/researka
```

4. Copy the built files:

```bash
sudo cp -r dist/* /var/www/researka/
```

5. Set proper permissions:

```bash
sudo chown -R www-data:www-data /var/www/researka
sudo chmod -R 755 /var/www/researka
```

### 5. Set Up SSL with Let's Encrypt

```bash
sudo certbot --nginx -d researka.org -d www.researka.org
```

### 6. Test and Restart Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Performance Optimizations

### 1. CDN Integration with Cloudflare

1. Sign up for a Cloudflare account at [cloudflare.com](https://www.cloudflare.com)
2. Add your domain to Cloudflare and update nameservers
3. Enable the following Cloudflare features:
   - Auto Minify (JS, CSS, HTML)
   - Brotli Compression
   - Rocket Loader
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours
   - Always Use HTTPS

### 2. Service Worker Caching

The Vite PWA plugin is already configured in the application. To verify it's working:

1. Open Chrome DevTools
2. Go to Application tab
3. Check Service Workers and Cache Storage

### 3. Image Optimization

Run the image optimization script to convert images to WebP and AVIF formats:

```bash
npm run optimize-images
```

### 4. Server Tuning

For optimal performance on a VPS with 8GB RAM and 2 vCPUs:

1. Adjust Nginx worker processes:

```bash
# In /etc/nginx/nginx.conf
worker_processes 2;  # Match CPU cores
```

2. Optimize kernel parameters by adding to `/etc/sysctl.conf`:

```
# Network tuning
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 4096
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15

# File system tuning
fs.file-max = 100000
```

Apply changes:

```bash
sudo sysctl -p
```

## Hosting Multiple Websites

The Nginx configuration is set up to support multiple websites on the same VPS:

1. Create a new site configuration in `/etc/nginx/sites-available/`
2. Create the appropriate directory in `/var/www/`
3. Set up SSL certificates for the new domain
4. Create a symbolic link to enable the site
5. Restart Nginx

## Monitoring and Maintenance

### 1. Set Up Monitoring with PM2

```bash
pm2 start npm --name "researka" -- run serve
pm2 save
pm2 startup
```

### 2. Regular Maintenance

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Renew SSL certificates
sudo certbot renew

# Restart services
sudo systemctl restart nginx
```

### 3. Performance Testing

Run the performance test script:

```bash
npm run performance-test
```

## Troubleshooting

### 1. Nginx Issues

Check Nginx error logs:

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/researka.error.log
```

### 2. Application Issues

Check PM2 logs:

```bash
pm2 logs researka
```

### 3. SSL Certificate Issues

```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

## Contact Support

For additional support, please use the contact form on the Researka platform.
