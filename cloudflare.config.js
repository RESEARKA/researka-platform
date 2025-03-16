/**
 * Cloudflare CDN Configuration for Researka Platform
 * 
 * This file contains settings for Cloudflare CDN integration.
 * It defines cache rules, security headers, and performance optimizations.
 */

module.exports = {
  // Zone settings
  zone: {
    // Cache settings
    cache: {
      // Browser TTL settings (in seconds)
      browser_ttl: {
        // Static assets cache for 1 year
        'static/*': 31536000,
        // Images cache for 1 week
        'images/*': 604800,
        // API responses cache for 5 minutes
        'api/*': 300,
        // Default cache for 1 day
        default: 86400
      },
      // Edge cache settings
      edge_ttl: {
        'static/*': 2592000, // 30 days
        'images/*': 1209600,  // 2 weeks
        'api/*': 60,         // 1 minute
        default: 43200       // 12 hours
      }
    },
    // Security headers
    security_headers: {
      // Content Security Policy
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.researka.com https://api.researka.com wss://*.researka.com;",
      // XSS Protection
      'X-XSS-Protection': '1; mode=block',
      // Frame options
      'X-Frame-Options': 'SAMEORIGIN',
      // Content Type options
      'X-Content-Type-Options': 'nosniff',
      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Permissions Policy
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    },
    // Page rules
    page_rules: [
      {
        // SPA routing - always serve index.html for non-file URLs
        target: '*.researka.com/*',
        actions: {
          always_use_https: true,
          cache_level: 'aggressive',
          edge_cache_ttl: 43200,
          forwarding_url: {
            url: 'https://researka.com/index.html',
            status_code: 200
          }
        }
      },
      {
        // API caching rules
        target: '*.researka.com/api/*',
        actions: {
          cache_level: 'standard',
          edge_cache_ttl: 60,
          cache_key_fields: {
            header: {
              include: ['Accept', 'Accept-Language']
            },
            query_string: {
              include: ['*']
            },
            user: {
              lang: true
            },
            cookie: {
              include: ['none']
            }
          }
        }
      }
    ],
    // Workers
    workers: [
      {
        name: 'image-optimizer',
        routes: ['*.researka.com/images/*'],
        script_path: './workers/image-optimizer.js'
      }
    ]
  }
};
