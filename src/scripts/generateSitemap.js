/**
 * Sitemap Generator for Researka
 * 
 * This script generates a dynamic sitemap.xml file that includes:
 * 1. All static pages
 * 2. All published articles
 * 
 * Run this script during the build process to ensure Google Scholar and other search engines
 * can properly discover and index all content.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Get current directory (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL for the site
const SITE_URL = 'https://researka.io';

// API endpoint to fetch all published articles
const ARTICLES_API = `${process.env.REACT_APP_API_URL || 'https://api.researka.io'}/articles?status=published`;

/**
 * Generate sitemap XML content
 * @param {Array} pages - Array of page objects with url, changefreq, and priority
 * @returns {string} - XML content for the sitemap
 */
function generateSitemapXml(pages) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';
  
  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${page.url}</loc>\n`;
    xml += `    <lastmod>${page.lastmod || new Date().toISOString()}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq || 'weekly'}</changefreq>\n`;
    xml += `    <priority>${page.priority || '0.5'}</priority>\n`;
    xml += '  </url>\n';
  });
  
  xml += '</urlset>';
  return xml;
}

/**
 * Fetch all published articles and generate sitemap
 */
async function generateSitemap() {
  try {
    console.log('Generating sitemap.xml...');
    
    // Define static pages
    const staticPages = [
      { url: SITE_URL, changefreq: 'daily', priority: '1.0' },
      { url: `${SITE_URL}/about`, changefreq: 'monthly', priority: '0.8' },
      { url: `${SITE_URL}/articles`, changefreq: 'daily', priority: '0.9' },
      { url: `${SITE_URL}/governance`, changefreq: 'monthly', priority: '0.7' },
      { url: `${SITE_URL}/privacy-policy`, changefreq: 'monthly', priority: '0.5' },
      { url: `${SITE_URL}/cookie-policy`, changefreq: 'monthly', priority: '0.5' },
      { url: `${SITE_URL}/privacy-center`, changefreq: 'monthly', priority: '0.5' },
      { url: `${SITE_URL}/legal`, changefreq: 'monthly', priority: '0.5' },
      { url: `${SITE_URL}/contact`, changefreq: 'monthly', priority: '0.6' },
    ];
    
    let allPages = [...staticPages];
    
    try {
      // Fetch all published articles
      const response = await axios.get(ARTICLES_API);
      const articles = response.data;
      
      // Add article pages to the sitemap
      articles.forEach(article => {
        allPages.push({
          url: `${SITE_URL}/article/${article.id}`,
          lastmod: article.updatedAt || article.publishedDate,
          changefreq: 'weekly',
          priority: '0.8'
        });
      });
    } catch (error) {
      console.warn('Failed to fetch articles, proceeding with static pages only:', error.message);
    }
    
    // Generate sitemap XML
    const sitemapXml = generateSitemapXml(allPages);
    
    // Write to file
    const publicDir = path.resolve(__dirname, '../../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
    console.log(`Sitemap generated with ${allPages.length} URLs`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the generator
generateSitemap();
