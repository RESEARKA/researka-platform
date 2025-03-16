# Researka Platform Deployment Guide

This guide provides step-by-step instructions for deploying the Researka platform on an Ubuntu-based VPS. The deployment is optimized for performance and configured to support multiple websites on the same server.

## Server Specifications

- **OS**: Ubuntu 20.04 LTS or newer
- **RAM**: 8GB
- **CPU**: 2 vCPUs
- **Storage**: 25GB SSD
- **Monthly Cost**: $63/month

## Prerequisites

- A registered domain name (e.g., researka.org)
- SSH access to your VPS
- Basic knowledge of Linux command line
- DNS records pointing to your VPS IP address

## Step 1: Initial Server Setup

### Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### Set Up a Firewall

```bash
sudo apt install ufw
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### Create a Non-Root User with Sudo Privileges

```bash
sudo adduser deployer
sudo usermod -aG sudo deployer
```

## Step 2: Install Required Software

### Install Node.js and npm

```bash
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install Nginx

```bash
sudo apt install -y nginx
```

### Install Certbot for SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
```

## Step 3: Set Up the Web Server

### Configure Nginx

1. Create a directory for your site:

```bash
sudo mkdir -p /var/www/researka.org
sudo chown -R $USER:$USER /var/www/researka.org
```

2. Copy the Nginx configuration file:

```bash
sudo cp /path/to/researka.conf /etc/nginx/sites-available/researka.org
sudo ln -s /etc/nginx/sites-available/researka.org /etc/nginx/sites-enabled/
```

3. Test and restart Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Obtain SSL Certificate

```bash
sudo certbot --nginx -d researka.org -d www.researka.org
```

## Step 4: Deploy the Application

### Build the Application

On your local development machine:

1. Set up environment variables:

```bash
cp .env.sample .env.production
# Edit .env.production with your production values
```

2. Build the application:

```bash
npm ci
npm run build
```

3. Transfer the build files to your server:

```bash
rsync -avz --delete dist/ deployer@your-server-ip:/var/www/researka.org/
```

### Set Up Continuous Deployment (Optional)

1. Install PM2 for process management:

```bash
sudo npm install -g pm2
```

2. Create a deployment script:

```bash
# deploy.sh
#!/bin/bash
cd /path/to/your/repo
git pull
npm ci
npm run build
rsync -avz --delete dist/ /var/www/researka.org/
pm2 restart all
```

3. Make it executable:

```bash
chmod +x deploy.sh
```

## Step 5: Performance Optimizations

### Enable Brotli Compression

```bash
sudo apt install -y nginx-module-brotli
```

Add to your Nginx configuration:

```nginx
load_module modules/ngx_http_brotli_filter_module.so;
load_module modules/ngx_http_brotli_static_module.so;
```

### Set Up Caching Headers

Already configured in the provided Nginx configuration.

### Configure CDN (Optional)

1. Sign up for a CDN service (e.g., Cloudflare, BunnyCDN)
2. Update your DNS to point to the CDN
3. Configure the CDN to cache static assets

## Step 6: Monitoring and Maintenance

### Set Up Monitoring

```bash
sudo apt install -y prometheus node-exporter
```

### Configure Automatic Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Set Up Log Rotation

```bash
sudo nano /etc/logrotate.d/nginx
```

Add:

```
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
```

## Step 7: Hosting Multiple Websites

To host multiple websites on the same VPS:

1. Create a new Nginx configuration file for each site:

```bash
sudo nano /etc/nginx/sites-available/another-site.com
```

2. Use the same structure as the researka.org configuration, changing domain names and paths.

3. Create the directory structure:

```bash
sudo mkdir -p /var/www/another-site.com
sudo chown -R $USER:$USER /var/www/another-site.com
```

4. Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/another-site.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. Obtain SSL certificate:

```bash
sudo certbot --nginx -d another-site.com -d www.another-site.com
```

## Troubleshooting

### Check Nginx Status

```bash
sudo systemctl status nginx
```

### View Nginx Error Logs

```bash
sudo tail -f /var/log/nginx/error.log
```

### Test Nginx Configuration

```bash
sudo nginx -t
```

### Restart Nginx

```bash
sudo systemctl restart nginx
```

## Security Best Practices

1. **Keep Software Updated**: Regularly update your system and installed packages.
2. **Use Strong Passwords**: Set strong passwords for all accounts.
3. **Implement Fail2Ban**: Protect against brute force attacks.
4. **Regular Backups**: Set up automated backups of your website and database.
5. **Monitor Logs**: Regularly check logs for suspicious activity.

## Performance Optimization Tips

1. **Enable HTTP/2**: Already configured in the provided Nginx configuration.
2. **Use Browser Caching**: Already configured in the provided Nginx configuration.
3. **Optimize Images**: Use the ResponsiveImage component for optimized image loading.
4. **Minify Assets**: The build process already handles this.
5. **Use a CDN**: Configure as described in Step 5.

## Conclusion

Your Researka platform should now be successfully deployed on your VPS with optimizations for performance and security. The configuration allows for hosting multiple websites on the same server, making efficient use of your resources.

For any issues or questions, refer to the troubleshooting section or contact the development team.
