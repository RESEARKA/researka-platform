import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '')
  // CDN URL for production assets
  const cdnUrl = env.CDN_URL || ''

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Researka',
          short_name: 'Researka',
          description: 'Decentralized academic publishing platform',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-files',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            {
              urlPattern: /\.(?:js|css)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
              },
            },
            // Add API caching for improved performance
            {
              urlPattern: /^https:\/\/api\.researka\.org\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 5, // 5 minutes
                },
                networkTimeoutSeconds: 10,
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // Cache CDN resources
            {
              urlPattern: new RegExp(cdnUrl.replace(/\./g, '\\.') + '.*'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdn-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
          // Skip waiting for service worker installation
          skipWaiting: true,
          // Claim clients immediately
          clientsClaim: true,
          // Clean outdated caches
          cleanupOutdatedCaches: true,
        },
      }),
      // Add compression for production builds
      compression({
        algorithm: 'gzip',
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 10240, // only compress files larger than 10kb
      }),
      compression({
        algorithm: 'brotliCompress',
        exclude: [/\.(br)$/, /\.(gz)$/],
        threshold: 10240,
      }),
      // Add bundle visualization for production builds
      process.env.ANALYZE === 'true' && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
    ].filter(Boolean),
    base: mode === 'production' && cdnUrl ? cdnUrl : '/',
    build: {
      sourcemap: process.env.NODE_ENV !== 'production',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Create separate chunks for large dependencies
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'react-vendor';
              if (id.includes('react-router')) return 'router-vendor';
              if (id.includes('ethers') || id.includes('@web3-react')) return 'web3-vendor';
              if (id.includes('@headlessui') || id.includes('@heroicons')) return 'ui-vendor';
              return 'vendor'; // all other dependencies
            }
            // Split app code by feature
            if (id.includes('/pages/')) return 'pages';
            if (id.includes('/components/')) return 'components';
            return null;
          },
          // Optimize chunk size
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name || 'chunk';
            return `assets/js/${name}-[hash].js`;
          },
          // Optimize asset filenames
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
            
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/\.(css)$/.test(assetInfo.name)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
        },
      },
      // Optimize build settings
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
          drop_debugger: process.env.NODE_ENV === 'production',
        },
      },
      cssCodeSplit: true,
      assetsInlineLimit: 4096, // 4kb
    },
    server: {
      // Optimize development server
      hmr: {
        overlay: true,
      },
    },
    // Add environment variables
    define: {
      'process.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
      'process.env.CDN_URL': JSON.stringify(cdnUrl),
    },
  }
})
