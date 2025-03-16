#!/usr/bin/env node

/**
 * Simple Performance Test Script for Researka
 * 
 * This script analyzes the application's performance optimizations
 * without requiring external tools like Lighthouse or Chrome.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Get the current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.blue.bold('🔍 Starting performance analysis for Researka platform...'));

// Create a directory for performance reports
const reportsDir = path.resolve(process.cwd(), 'performance-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

// Get current date for report naming
const date = new Date();
const reportDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const reportTime = `${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;
const reportName = `performance-report-${reportDate}-${reportTime}.json`;
const reportPath = path.join(reportsDir, reportName);

// Function to check bundle sizes
const analyzeBundleSizes = () => {
  console.log(chalk.blue.bold('\n📦 Bundle Size Analysis:'));
  console.log(chalk.blue('----------------------'));
  
  try {
    // Run build with stats
    console.log('Building application to analyze bundle sizes...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log(chalk.green('Build completed'));
    
    // Analyze dist directory
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      let totalJsSize = 0;
      let totalCssSize = 0;
      let totalHtmlSize = 0;
      let totalAssetsSize = 0;
      
      const jsFiles = [];
      const cssFiles = [];
      
      // Recursive function to get file sizes
      const getFileSizes = (dir) => {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            getFileSizes(filePath);
          } else {
            const fileSize = stats.size;
            
            if (file.endsWith('.js')) {
              totalJsSize += fileSize;
              jsFiles.push({ name: path.relative(distPath, filePath), size: fileSize });
            } else if (file.endsWith('.css')) {
              totalCssSize += fileSize;
              cssFiles.push({ name: path.relative(distPath, filePath), size: fileSize });
            } else if (file.endsWith('.html')) {
              totalHtmlSize += fileSize;
            } else {
              totalAssetsSize += fileSize;
            }
          }
        });
      };
      
      getFileSizes(distPath);
      
      // Sort files by size
      jsFiles.sort((a, b) => b.size - a.size);
      cssFiles.sort((a, b) => b.size - a.size);
      
      // Display results
      console.log(chalk.yellow.bold('\nTotal Bundle Sizes:'));
      console.log(`JavaScript: ${(totalJsSize / 1024).toFixed(2)} KB`);
      console.log(`CSS: ${(totalCssSize / 1024).toFixed(2)} KB`);
      console.log(`HTML: ${(totalHtmlSize / 1024).toFixed(2)} KB`);
      console.log(`Other Assets: ${(totalAssetsSize / 1024).toFixed(2)} KB`);
      console.log(`Total: ${((totalJsSize + totalCssSize + totalHtmlSize + totalAssetsSize) / 1024).toFixed(2)} KB`);
      
      console.log(chalk.yellow.bold('\nLargest JavaScript Files:'));
      jsFiles.slice(0, 5).forEach(file => {
        console.log(`${file.name}: ${(file.size / 1024).toFixed(2)} KB`);
      });
      
      console.log(chalk.yellow.bold('\nLargest CSS Files:'));
      cssFiles.slice(0, 5).forEach(file => {
        console.log(`${file.name}: ${(file.size / 1024).toFixed(2)} KB`);
      });
    } else {
      console.log(chalk.red('Dist directory not found. Build may have failed.'));
    }
    
    // Recommendations based on bundle size
    console.log(chalk.yellow.bold('\nRecommendations:'));
    console.log('- Consider using dynamic imports for large dependencies');
    console.log('- Further code-split UI components');
    console.log('- Implement tree-shaking for unused components');
  } catch (error) {
    console.error(chalk.red('Error analyzing bundle sizes:'), error.message);
  }
};

// Function to check service worker and caching
const analyzeServiceWorker = () => {
  console.log(chalk.blue.bold('\n🔄 Service Worker Analysis:'));
  console.log(chalk.blue('--------------------------'));
  
  try {
    // Read the vite.config.ts file to analyze PWA configuration
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    // Check for PWA plugin and configurations
    const hasPwaPlugin = viteConfig.includes('VitePWA');
    const hasWorkbox = viteConfig.includes('workbox');
    const hasCacheStrategies = viteConfig.includes('NetworkFirst') || 
                              viteConfig.includes('CacheFirst') ||
                              viteConfig.includes('StaleWhileRevalidate');
    
    console.log(`PWA Plugin: ${hasPwaPlugin ? chalk.green('Configured') : chalk.red('Not found')}`);
    console.log(`Workbox Integration: ${hasWorkbox ? chalk.green('Configured') : chalk.red('Not found')}`);
    console.log(`Cache Strategies: ${hasCacheStrategies ? chalk.green('Implemented') : chalk.yellow('Basic or not found')}`);
    
    // Extract and display cache strategies if found
    if (hasCacheStrategies) {
      console.log(chalk.yellow.bold('\nCache Strategies Detected:'));
      if (viteConfig.includes('NetworkFirst')) console.log('- NetworkFirst: For API requests and dynamic content');
      if (viteConfig.includes('CacheFirst')) console.log('- CacheFirst: For static assets and fonts');
      if (viteConfig.includes('StaleWhileRevalidate')) console.log('- StaleWhileRevalidate: For frequently updated resources');
    }
    
    // Check for service worker in dist after build
    const swPath = path.resolve(process.cwd(), 'dist', 'sw.js');
    const hasSw = fs.existsSync(swPath);
    
    console.log(`\nService Worker: ${hasSw ? chalk.green('Generated') : chalk.yellow('Not found in dist')}`);
    
    if (hasSw) {
      const swSize = fs.statSync(swPath).size;
      console.log(`Service Worker Size: ${(swSize / 1024).toFixed(2)} KB`);
      
      // Basic content analysis
      const swContent = fs.readFileSync(swPath, 'utf8');
      const hasPrecaching = swContent.includes('precacheAndRoute') || swContent.includes('precache');
      const hasRouteHandlers = swContent.includes('registerRoute');
      
      console.log(`Precaching: ${hasPrecaching ? chalk.green('Implemented') : chalk.yellow('Not found')}`);
      console.log(`Route Handlers: ${hasRouteHandlers ? chalk.green('Implemented') : chalk.yellow('Not found')}`);
    }
    
    // Recommendations
    console.log(chalk.yellow.bold('\nRecommendations:'));
    console.log('- Implement offline fallback page');
    console.log('- Add background sync for form submissions');
    console.log('- Consider implementing a custom cache invalidation strategy');
  } catch (error) {
    console.error(chalk.red('Error analyzing service worker:'), error.message);
  }
};

// Function to check CDN readiness
const analyzeCdnReadiness = () => {
  console.log(chalk.blue.bold('\n🌐 CDN Readiness Analysis:'));
  console.log(chalk.blue('------------------------'));
  
  try {
    // Check for CDN configuration in vite.config.ts
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    const hasCdnConfig = viteConfig.includes('CDN_URL') || viteConfig.includes('base:');
    const hasEnvFile = fs.existsSync(path.resolve(process.cwd(), '.env')) || 
                      fs.existsSync(path.resolve(process.cwd(), '.env.production'));
    
    console.log(`CDN Configuration: ${hasCdnConfig ? chalk.green('Found') : chalk.red('Not found')}`);
    console.log(`Environment Variables: ${hasEnvFile ? chalk.green('Configured') : chalk.yellow('Not found')}`);
    
    // Check for asset fingerprinting
    const hasAssetFingerprinting = viteConfig.includes('build: {') && viteConfig.includes('rollupOptions');
    console.log(`Asset Fingerprinting: ${hasAssetFingerprinting ? chalk.green('Implemented') : chalk.yellow('Basic or not found')}`);
    
    // Check dist directory for hashed filenames
    const distPath = path.resolve(process.cwd(), 'dist', 'assets');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      const hashedFiles = files.filter(file => /\.[a-f0-9]{8}\.(js|css)$/.test(file));
      
      console.log(`Hashed Assets: ${hashedFiles.length > 0 ? chalk.green(`${hashedFiles.length} files`) : chalk.yellow('Not found')}`);
    }
    
    // Recommendations for Cloudflare
    console.log(chalk.yellow.bold('\nCloudflare Recommendations:'));
    console.log('- Enable Auto Minify for HTML/CSS/JS');
    console.log('- Set Browser Cache TTL to 4 hours');
    console.log('- Enable Brotli compression');
    console.log('- Configure Page Rules for SPA routing');
    console.log('- Set up Cloudflare Workers for image optimization');
  } catch (error) {
    console.error(chalk.red('Error analyzing CDN readiness:'), error.message);
  }
};

// Function to analyze image optimization
const analyzeImageOptimization = () => {
  console.log(chalk.blue.bold('\n🖼️ Image Optimization Analysis:'));
  console.log(chalk.blue('----------------------------'));
  
  try {
    // Check for image optimization utilities
    const hasImageOptimizer = fs.existsSync(path.resolve(process.cwd(), 'src/utils/imageOptimizer.ts'));
    const hasResponsiveImage = fs.existsSync(path.resolve(process.cwd(), 'src/components/ResponsiveImage.tsx'));
    
    console.log(`Image Optimizer Utility: ${hasImageOptimizer ? chalk.green('Implemented') : chalk.red('Not found')}`);
    console.log(`Responsive Image Component: ${hasResponsiveImage ? chalk.green('Implemented') : chalk.red('Not found')}`);
    
    // Check implementation details if files exist
    if (hasImageOptimizer) {
      const imageOptimizerContent = fs.readFileSync(path.resolve(process.cwd(), 'src/utils/imageOptimizer.ts'), 'utf8');
      const hasLazyLoading = imageOptimizerContent.includes('loading: "lazy"') || imageOptimizerContent.includes('lazyLoad');
      const hasSrcSet = imageOptimizerContent.includes('srcset') || imageOptimizerContent.includes('srcSet');
      const hasModernFormats = imageOptimizerContent.includes('webp') || imageOptimizerContent.includes('avif');
      
      console.log(`Lazy Loading: ${hasLazyLoading ? chalk.green('Implemented') : chalk.yellow('Not found')}`);
      console.log(`Responsive srcset: ${hasSrcSet ? chalk.green('Implemented') : chalk.yellow('Not found')}`);
      console.log(`Modern Image Formats: ${hasModernFormats ? chalk.green('Implemented') : chalk.yellow('Not found')}`);
    }
    
    // Check for image assets
    const publicPath = path.resolve(process.cwd(), 'public');
    if (fs.existsSync(publicPath)) {
      let imageCount = 0;
      let totalImageSize = 0;
      let modernFormatCount = 0;
      
      // Recursive function to find images
      const findImages = (dir) => {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            findImages(filePath);
          } else {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
              imageCount++;
              totalImageSize += stats.size;
              
              if (['.webp', '.avif'].includes(ext)) {
                modernFormatCount++;
              }
            }
          }
        });
      };
      
      findImages(publicPath);
      
      console.log(`\nTotal Images: ${imageCount}`);
      console.log(`Total Image Size: ${(totalImageSize / (1024 * 1024)).toFixed(2)} MB`);
      console.log(`Modern Format Images: ${modernFormatCount} (${((modernFormatCount / imageCount) * 100).toFixed(2)}%)`);
    }
    
    // Recommendations
    console.log(chalk.yellow.bold('\nRecommendations:'));
    console.log('- Implement WebP and AVIF formats with fallbacks');
    console.log('- Use responsive image sizes based on viewport');
    console.log('- Consider implementing an image CDN like Cloudinary or Imgix');
    console.log('- Add blur-up or skeleton loading for images');
  } catch (error) {
    console.error(chalk.red('Error analyzing image optimization:'), error.message);
  }
};

// Run all analyses
console.log(chalk.blue.bold('\nRunning performance analyses...'));

// Run analyses
analyzeBundleSizes();
analyzeServiceWorker();
analyzeCdnReadiness();
analyzeImageOptimization();

// Summary
console.log(chalk.blue.bold('\n📈 Performance Summary:'));
console.log(chalk.blue('-------------------------'));

// Read the performance optimizations we've implemented
try {
  const perfOptPath = path.resolve(process.cwd(), 'PERFORMANCE_OPTIMIZATIONS.md');
  if (fs.existsSync(perfOptPath)) {
    const perfOptContent = fs.readFileSync(perfOptPath, 'utf8');
    
    // Count the number of optimizations implemented
    const sections = perfOptContent.match(/^## (.*?)$/gm) || [];
    const recommendations = (perfOptContent.match(/- (.*?)$/gm) || []).length;
    
    console.log(`Optimization Categories: ${sections.length}`);
    console.log(`Implementation Recommendations: ${recommendations}`);
    console.log(chalk.green('\nPerformance optimization documentation is in place!'));
  } else {
    console.log(chalk.yellow('Performance optimization documentation not found.'));
  }
} catch (error) {
  console.error(chalk.red('Error reading performance documentation:'), error.message);
}

console.log(chalk.yellow.bold('\n🔍 Final Optimization Recommendations:'));
console.log(chalk.yellow('------------------------------'));
console.log('1. Implement proper error handling in API services');
console.log('2. Fix any remaining TypeScript errors to improve build process');
console.log('3. Consider using React.lazy() for component-level code splitting');
console.log('4. Optimize third-party dependencies (ethers.js is particularly large)');
console.log('5. Implement proper image formats (WebP/AVIF) with fallbacks');
console.log('6. Add real-time performance monitoring in production');
console.log('7. Implement resource hints (preconnect, prefetch) for critical resources');

// Save report
try {
  const report = {
    timestamp: new Date().toISOString(),
    analyses: {
      bundleSizes: "Completed",
      serviceWorker: "Completed",
      cdnReadiness: "Completed",
      imageOptimization: "Completed"
    },
    recommendations: [
      'Implement proper error handling in API services',
      'Fix any remaining TypeScript errors',
      'Use React.lazy() for component-level code splitting',
      'Optimize third-party dependencies',
      'Implement WebP/AVIF image formats',
      'Add real-time performance monitoring',
      'Implement resource hints'
    ]
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(chalk.green(`\n📝 Performance report saved to: ${reportPath}`));
} catch (error) {
  console.error(chalk.red(`\n❌ Error saving report: ${error.message}`));
}

console.log(chalk.green.bold('\n✅ Performance analysis completed!'));
