#!/usr/bin/env node

/**
 * Bundle Analysis Script for Researka
 * 
 * This script builds the application with bundle analysis enabled
 * and opens the visualization in your browser.
 * 
 * Usage: npm run analyze-bundle
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the script is executable
try {
  fs.chmodSync(__filename, '755');
} catch (error) {
  console.error('Failed to make script executable:', error);
}

console.log('🔍 Starting bundle analysis...');

// Set environment variables
process.env.ANALYZE = 'true';
process.env.NODE_ENV = 'production';

try {
  // Build the application with bundle analysis enabled
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Bundle analysis complete!');
  console.log('📊 The bundle analysis report is available at: dist/stats.html');
  
  // Try to open the report in the default browser
  const statsPath = path.resolve(process.cwd(), 'dist/stats.html');
  if (fs.existsSync(statsPath)) {
    console.log('🌐 Opening report in browser...');
    
    // Determine the open command based on platform
    let openCommand;
    switch (process.platform) {
      case 'darwin': // macOS
        openCommand = 'open';
        break;
      case 'win32': // Windows
        openCommand = 'start';
        break;
      default: // Linux and others
        openCommand = 'xdg-open';
        break;
    }
    
    try {
      execSync(`${openCommand} "${statsPath}"`, { stdio: 'ignore' });
    } catch (error) {
      console.log(`Could not automatically open the report. Please open it manually at: ${statsPath}`);
    }
  } else {
    console.error('❌ Stats file not found. There might have been an error during the build process.');
  }
} catch (error) {
  console.error('❌ Bundle analysis failed:', error);
  process.exit(1);
}
