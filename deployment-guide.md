# Researka Deployment Guide

This guide outlines how to deploy the Researka platform with optimized caching and CDN integration.

## Caching Implementation

The Vite PWA plugin has been configured in `vite.config.ts` to provide:

1. **Service Worker Caching**:
   - Images cached for 30 days
   - CSS/JS files cached with stale-while-revalidate strategy for 7 days
   - Google Fonts cached for 1 year

2. **Chunk Optimization**:
   - React core libraries in separate chunk
   - Router in separate chunk
   - Web3/blockchain libraries in vendor chunk

## CDN Integration

For production deployment, integrate with a CDN as follows:

### Option 1: Cloudflare (Recommended)

1. Sign up for a Cloudflare account
2. Add your domain (e.g., researka.io)
3. Update your domain's nameservers to Cloudflare's
4. In Cloudflare dashboard:
   - Enable Auto Minify for HTML, CSS, and JavaScript
   - Set Cache Level to "Standard"
   - Enable Brotli compression
   - Set Browser Cache TTL to "1 month"

### Option 2: AWS CloudFront

1. Create an S3 bucket for your static assets
2. Create a CloudFront distribution pointing to:
   - S3 bucket for static assets
   - Your origin server for API requests
3. Configure cache behaviors:
   - `/assets/*`: Cache TTL of 1 year
   - `/images/*`: Cache TTL of 30 days
   - Default: Cache TTL of 1 day with stale-while-revalidate

## Nginx Configuration for VPS

Add this to your Nginx server block:

```nginx
server {
    listen 80;
    server_name researka.io;
    
    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name researka.io;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/researka.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/researka.io/privkey.pem;
    
    # Enable HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Cache control for static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }
    
    location /images/ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }
    
    # For the service worker
    location /sw.js {
        add_header Cache-Control "no-cache";
        expires off;
    }
    
    # Everything else
    location / {
        expires 1d;
        add_header Cache-Control "public, max-age=86400, stale-while-revalidate=604800";
        try_files $uri $uri/ /index.html;
    }
    
    # API requests proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Build for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output will be in the dist/ directory
# Upload this to your web server or S3 bucket
```

## Multiple Sites on Same VPS

To host multiple sites on the same VPS:

1. Create separate Nginx server blocks for each domain
2. Use Docker containers for isolation (optional)
3. Set up separate SSL certificates for each domain
4. Monitor resource usage to ensure balanced performance

## Performance Monitoring

Once deployed, monitor performance with:

1. Google PageSpeed Insights
2. Lighthouse audits
3. Web Vitals in Google Analytics
4. Server monitoring tools (e.g., New Relic, Datadog)
