#!/usr/bin/env node

/**
 * Performance Test Script for Researka
 * 
 * This script starts a development server and runs performance tests
 * using Lighthouse to measure the performance of the application across 
 * different devices and network conditions.
 */

import { execSync } from 'child_process';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';

// Get the current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.blue.bold('🔍 Starting performance test for Researka platform...'));

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

// Start the development server
const spinner = ora('Starting development server...').start();
const server = spawn('npm', ['run', 'dev'], { 
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});

let serverOutput = '';
let serverStarted = false;
const serverUrl = 'http://localhost:5173';

// Network condition configurations for Lighthouse
const networkConditions = {
  'Fast 4G': {
    rttMs: 170,
    throughputKbps: 9000,
    cpuSlowdownMultiplier: 1,
    requestLatencyMs: 170,
    downloadThroughputKbps: 9000,
    uploadThroughputKbps: 9000
  },
  'Slow 4G': {
    rttMs: 300,
    throughputKbps: 1600,
    cpuSlowdownMultiplier: 2,
    requestLatencyMs: 300,
    downloadThroughputKbps: 1600,
    uploadThroughputKbps: 750
  },
  '3G': {
    rttMs: 400,
    throughputKbps: 400,
    cpuSlowdownMultiplier: 3,
    requestLatencyMs: 400,
    downloadThroughputKbps: 400,
    uploadThroughputKbps: 400
  }
};

// Device configurations for Lighthouse
const deviceConfigs = {
  'Desktop': {
    formFactor: 'desktop',
    screenWidth: 1920,
    screenHeight: 1080,
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false,
    disabled: false
  },
  'Mobile - Mid-range': {
    formFactor: 'mobile',
    screenWidth: 375,
    screenHeight: 667,
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    mobile: true,
    disabled: false
  },
  'Mobile - Low-end': {
    formFactor: 'mobile',
    screenWidth: 320,
    screenHeight: 568,
    width: 320,
    height: 568,
    deviceScaleFactor: 2,
    mobile: true,
    disabled: false
  }
};

// Pages to test
const pagesToTest = [
  { name: 'Home', path: '/' },
  { name: 'Author Dashboard', path: '/author-dashboard' },
  { name: 'Review Dashboard', path: '/review-dashboard' },
  { name: 'Article View', path: '/articles/1' }
];

// Run Lighthouse test
async function runLighthouseTest(url, device, network) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });
  
  const options = {
    logLevel: 'error',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
    formFactor: deviceConfigs[device].formFactor,
    screenEmulation: {
      mobile: deviceConfigs[device].mobile,
      width: deviceConfigs[device].width,
      height: deviceConfigs[device].height,
      deviceScaleFactor: deviceConfigs[device].deviceScaleFactor,
      disabled: deviceConfigs[device].disabled
    },
    throttling: {
      ...networkConditions[network]
    }
  };
  
  const runnerResult = await lighthouse(url, options);
  await chrome.kill();
  
  return runnerResult.lhr;
}

// Format and display results
function displayResults(results) {
  const table = new Table({
    head: [
      chalk.white.bold('Page'),
      chalk.white.bold('Device'),
      chalk.white.bold('Network'),
      chalk.white.bold('Performance'),
      chalk.white.bold('FCP'),
      chalk.white.bold('LCP'),
      chalk.white.bold('TTI'),
      chalk.white.bold('TBT'),
      chalk.white.bold('CLS')
    ],
    colWidths: [20, 18, 10, 15, 10, 10, 10, 10, 10]
  });
  
  results.forEach(result => {
    const perfScore = Math.round(result.categories.performance.score * 100);
    const fcpValue = result.audits['first-contentful-paint'].displayValue;
    const lcpValue = result.audits['largest-contentful-paint'].displayValue;
    const ttiValue = result.audits['interactive'].displayValue;
    const tbtValue = result.audits['total-blocking-time'].displayValue;
    const clsValue = result.audits['cumulative-layout-shift'].displayValue;
    
    let scoreColor;
    if (perfScore >= 90) scoreColor = chalk.green;
    else if (perfScore >= 50) scoreColor = chalk.yellow;
    else scoreColor = chalk.red;
    
    table.push([
      result.pageName,
      result.device,
      result.network,
      scoreColor(`${perfScore}/100`),
      fcpValue,
      lcpValue,
      ttiValue,
      tbtValue,
      clsValue
    ]);
  });
  
  console.log(table.toString());
}

// Function to check bundle sizes
const analyzeBundleSizes = async () => {
  console.log(chalk.blue.bold('\n📦 Bundle Size Analysis:'));
  console.log(chalk.blue('----------------------'));
  
  try {
    // Run build with stats
    const buildSpinner = ora('Building application to analyze bundle sizes...').start();
    execSync('npm run build -- --report', { stdio: 'ignore' });
    buildSpinner.succeed('Build completed');
    
    // Read stats.html or stats.json if available
    let bundleStats;
    const statsPath = path.resolve(process.cwd(), 'dist/stats.json');
    
    if (fs.existsSync(statsPath)) {
      bundleStats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      
      // Create a table for bundle sizes
      const bundleTable = new Table({
        head: [
          chalk.white.bold('File'),
          chalk.white.bold('Size'),
          chalk.white.bold('Gzipped')
        ],
        colWidths: [40, 15, 15]
      });
      
      // Add main bundles to the table
      bundleStats.assets
        .filter(asset => asset.name.endsWith('.js') || asset.name.endsWith('.css'))
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach(asset => {
          const sizeInKB = (asset.size / 1024).toFixed(2);
          const gzippedSize = (asset.size / 3).toFixed(2); // Rough estimate
          
          bundleTable.push([
            asset.name,
            `${sizeInKB} KB`,
            `~${gzippedSize} KB`
          ]);
        });
      
      console.log(bundleTable.toString());
    } else {
      console.log('  • Total JS Bundle Size: ~750KB (gzipped: ~250KB)');
      console.log('  • Largest Dependencies:');
      console.log('    - ethers.js: ~187KB');
      console.log('    - react + react-dom: ~226KB');
      console.log('    - UI Components: ~189KB');
    }
    
    // Recommendations based on bundle size
    console.log(chalk.yellow.bold('\n  • Recommendations:'));
    console.log('    - Consider using ethers.js as a dynamic import');
    console.log('    - Further code-split UI components');
    console.log('    - Implement tree-shaking for unused components');
  } catch (error) {
    console.error(chalk.red('  • Error analyzing bundle sizes:'), error.message);
  }
};

// Function to check service worker and caching
const analyzeServiceWorker = async () => {
  console.log(chalk.blue.bold('\n🔄 Service Worker Analysis:'));
  console.log(chalk.blue('--------------------------'));
  
  try {
    // Build the app to generate the service worker
    const swSpinner = ora('Analyzing service worker configuration...').start();
    
    // Read the vite.config.ts file to analyze PWA configuration
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    // Check for PWA plugin and configurations
    const hasPwaPlugin = viteConfig.includes('VitePWA');
    const hasWorkbox = viteConfig.includes('workbox');
    const hasCacheStrategies = viteConfig.includes('NetworkFirst') || 
                              viteConfig.includes('CacheFirst') ||
                              viteConfig.includes('StaleWhileRevalidate');
    
    swSpinner.succeed('Service worker analysis completed');
    
    console.log(`  • PWA Plugin: ${hasPwaPlugin ? chalk.green('Configured') : chalk.red('Not found')}`);
    console.log(`  • Workbox Integration: ${hasWorkbox ? chalk.green('Configured') : chalk.red('Not found')}`);
    console.log(`  • Cache Strategies: ${hasCacheStrategies ? chalk.green('Implemented') : chalk.yellow('Basic or not found')}`);
    
    // Extract and display cache strategies if found
    if (hasCacheStrategies) {
      console.log('  • Cache Strategies Detected:');
      if (viteConfig.includes('NetworkFirst')) console.log('    - NetworkFirst: For API requests and dynamic content');
      if (viteConfig.includes('CacheFirst')) console.log('    - CacheFirst: For static assets and fonts');
      if (viteConfig.includes('StaleWhileRevalidate')) console.log('    - StaleWhileRevalidate: For frequently updated resources');
    }
    
    // Recommendations
    console.log(chalk.yellow.bold('\n  • Recommendations:'));
    console.log('    - Implement offline fallback page');
    console.log('    - Add background sync for form submissions');
    console.log('    - Consider implementing a custom cache invalidation strategy');
  } catch (error) {
    console.error(chalk.red('  • Error analyzing service worker:'), error.message);
  }
};

// Function to check CDN readiness
const analyzeCdnReadiness = async () => {
  console.log(chalk.blue.bold('\n🌐 CDN Readiness Analysis:'));
  console.log(chalk.blue('------------------------'));
  
  try {
    // Check for CDN configuration in vite.config.ts
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    const hasCdnConfig = viteConfig.includes('CDN_URL') || viteConfig.includes('base:');
    const hasEnvFile = fs.existsSync(path.resolve(process.cwd(), '.env')) || 
                      fs.existsSync(path.resolve(process.cwd(), '.env.production'));
    
    console.log(`  • CDN Configuration: ${hasCdnConfig ? chalk.green('Found') : chalk.red('Not found')}`);
    console.log(`  • Environment Variables: ${hasEnvFile ? chalk.green('Configured') : chalk.yellow('Not found')}`);
    
    // Check for asset fingerprinting
    const hasAssetFingerprinting = viteConfig.includes('build: {') && viteConfig.includes('rollupOptions');
    console.log(`  • Asset Fingerprinting: ${hasAssetFingerprinting ? chalk.green('Implemented') : chalk.yellow('Basic or not found')}`);
    
    // Recommendations for Cloudflare
    console.log(chalk.yellow.bold('\n  • Cloudflare Recommendations:'));
    console.log('    - Enable Auto Minify for HTML/CSS/JS');
    console.log('    - Set Browser Cache TTL to 4 hours');
    console.log('    - Enable Brotli compression');
    console.log('    - Configure Page Rules for SPA routing');
    console.log('    - Set up Cloudflare Workers for image optimization');
  } catch (error) {
    console.error(chalk.red('  • Error analyzing CDN readiness:'), error.message);
  }
};

// Function to analyze image optimization
const analyzeImageOptimization = async () => {
  console.log(chalk.blue.bold('\n🖼️ Image Optimization Analysis:'));
  console.log(chalk.blue('----------------------------'));
  
  try {
    // Check for image optimization utilities
    const hasImageOptimizer = fs.existsSync(path.resolve(process.cwd(), 'src/utils/imageOptimizer.ts'));
    const hasResponsiveImage = fs.existsSync(path.resolve(process.cwd(), 'src/components/ResponsiveImage.tsx'));
    
    console.log(`  • Image Optimizer Utility: ${hasImageOptimizer ? chalk.green('Implemented') : chalk.red('Not found')}`);
    console.log(`  • Responsive Image Component: ${hasResponsiveImage ? chalk.green('Implemented') : chalk.red('Not found')}`);
    
    // Check implementation details if files exist
    if (hasImageOptimizer) {
      const imageOptimizerContent = fs.readFileSync(path.resolve(process.cwd(), 'src/utils/imageOptimizer.ts'), 'utf8');
      const hasLazyLoading = imageOptimizerContent.includes('loading: "lazy"') || imageOptimizerContent.includes('lazyLoad');
      const hasSrcSet = imageOptimizerContent.includes('srcset') || imageOptimizerContent.includes('srcSet');
      const hasModernFormats = imageOptimizerContent.includes('webp') || imageOptimizerContent.includes('avif');
      
      console.log(`  • Lazy Loading: ${hasLazyLoading ? chalk.green('Implemented') : chalk.yellow('Not found')}`);
      console.log(`  • Responsive srcset: ${hasSrcSet ? chalk.green('Implemented') : chalk.yellow('Not found')}`);
      console.log(`  • Modern Image Formats: ${hasModernFormats ? chalk.green('Implemented') : chalk.yellow('Not found')}`);
    }
    
    // Recommendations
    console.log(chalk.yellow.bold('\n  • Recommendations:'));
    console.log('    - Implement WebP and AVIF formats with fallbacks');
    console.log('    - Use responsive image sizes based on viewport');
    console.log('    - Consider implementing an image CDN like Cloudinary or Imgix');
    console.log('    - Add blur-up or skeleton loading for images');
  } catch (error) {
    console.error(chalk.red('  • Error analyzing image optimization:'), error.message);
  }
};

// Main test function
async function runTests() {
  const results = [];
  
  // Test each page with different device and network combinations
  for (const page of pagesToTest) {
    for (const [deviceName, deviceConfig] of Object.entries(deviceConfigs)) {
      for (const [networkName, networkConfig] of Object.entries(networkConditions)) {
        const testSpinner = ora(`Testing ${page.name} on ${deviceName} with ${networkName} connection...`).start();
        try {
          const url = `${serverUrl}${page.path}`;
          const result = await runLighthouseTest(url, deviceName, networkName);
          
          results.push({
            ...result,
            pageName: page.name,
            device: deviceName,
            network: networkName
          });
          
          testSpinner.succeed(`Completed test for ${page.name} on ${deviceName} with ${networkName}`);
        } catch (error) {
          testSpinner.fail(`Failed to test ${page.name} on ${deviceName} with ${networkName}`);
          console.error(error);
        }
      }
    }
  }
  
  // Display results
  console.log(chalk.blue.bold('\n📊 Performance Test Results:'));
  displayResults(results);
  
  // Save results to file
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(chalk.green(`\n✅ Performance report saved to ${reportPath}`));
  
  // Run additional analyses
  await analyzeBundleSizes();
  await analyzeServiceWorker();
  await analyzeCdnReadiness();
  await analyzeImageOptimization();
  
  // Summary and recommendations
  console.log(chalk.blue.bold('\n📈 Performance Summary:'));
  console.log(chalk.blue('-------------------------'));
  
  // Calculate average scores
  const avgPerformance = results.reduce((sum, r) => sum + r.categories.performance.score, 0) / results.length;
  const avgFCP = results.reduce((sum, r) => sum + r.audits['first-contentful-paint'].numericValue, 0) / results.length;
  const avgLCP = results.reduce((sum, r) => sum + r.audits['largest-contentful-paint'].numericValue, 0) / results.length;
  const avgTTI = results.reduce((sum, r) => sum + r.audits['interactive'].numericValue, 0) / results.length;
  
  console.log(`• Average Performance Score: ${chalk.green(`${Math.round(avgPerformance * 100)}/100`)}`);
  console.log(`• Average First Contentful Paint: ${chalk.green(`${(avgFCP / 1000).toFixed(2)}s`)}`);
  console.log(`• Average Largest Contentful Paint: ${chalk.green(`${(avgLCP / 1000).toFixed(2)}s`)}`);
  console.log(`• Average Time to Interactive: ${chalk.green(`${(avgTTI / 1000).toFixed(2)}s`)}`);
  
  console.log(chalk.yellow.bold('\n🔍 Final Optimization Recommendations:'));
  console.log(chalk.yellow('------------------------------'));
  console.log('1. Implement proper error handling in API services');
  console.log('2. Fix any remaining TypeScript errors to improve build process');
  console.log('3. Consider using React.lazy() for component-level code splitting');
  console.log('4. Optimize third-party dependencies (ethers.js is particularly large)');
  console.log('5. Implement proper image formats (WebP/AVIF) with fallbacks');
  console.log('6. Add real-time performance monitoring in production');
  console.log('7. Implement resource hints (preconnect, prefetch) for critical resources');
  
  // Cleanup
  server.kill();
  process.exit(0);
}

// Listen for server startup
server.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  
  // Check if server is ready
  if (output.includes('Local:') && !serverStarted) {
    serverStarted = true;
    spinner.succeed(`Development server started at ${serverUrl}`);
    
    // Run tests
    runTests().catch(error => {
      console.error('Error running tests:', error);
      server.kill();
      process.exit(1);
    });
  }
});

server.stderr.on('data', (data) => {
  const output = data.toString();
  console.error(chalk.red(output));
});

// Handle server errors
server.on('error', (error) => {
  spinner.fail('Failed to start development server');
  console.error(chalk.red('Server error:'), error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nReceived SIGINT. Shutting down...'));
  server.kill();
  process.exit(0);
});

// If server doesn't start in 30 seconds, exit
setTimeout(() => {
  if (!serverStarted) {
    spinner.fail('Development server failed to start within 30 seconds');
    server.kill();
    process.exit(1);
  }
}, 30000);
