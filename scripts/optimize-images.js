/**
 * Image Optimization Script for Researka Platform
 * 
 * This script converts images to modern formats (WebP, AVIF) and optimizes them
 * for better performance and smaller file sizes.
 * 
 * Usage: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

// Configuration
const config = {
  inputDir: 'public/images',
  outputDir: 'public/images/optimized',
  formats: ['webp', 'avif'],
  quality: {
    webp: 80,
    avif: 65,
    jpeg: 85
  },
  sizes: [
    { width: 320, suffix: 'sm' },
    { width: 640, suffix: 'md' },
    { width: 1280, suffix: 'lg' }
  ]
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Get all image files
const imageFiles = glob.sync(`${config.inputDir}/**/*.{jpg,jpeg,png}`, { nodir: true });

console.log(`Found ${imageFiles.length} images to optimize`);

// Process each image
(async () => {
  for (const imagePath of imageFiles) {
    const filename = path.basename(imagePath, path.extname(imagePath));
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    console.log(`Processing: ${filename}`);
    
    // Create optimized versions in different sizes and formats
    for (const size of config.sizes) {
      // Skip if the original image is smaller than the target size
      if (metadata.width <= size.width) continue;
      
      const resizedImage = image.resize(size.width);
      
      // Generate in each format
      for (const format of config.formats) {
        const outputPath = path.join(
          config.outputDir, 
          `${filename}-${size.suffix}.${format}`
        );
        
        try {
          await resizedImage[format]({ quality: config.quality[format] })
            .toFile(outputPath);
          console.log(`Created: ${outputPath}`);
        } catch (error) {
          console.error(`Error creating ${outputPath}:`, error);
        }
      }
      
      // Also create an optimized JPEG as fallback
      const jpegOutputPath = path.join(
        config.outputDir,
        `${filename}-${size.suffix}.jpg`
      );
      
      try {
        await resizedImage.jpeg({ quality: config.quality.jpeg })
          .toFile(jpegOutputPath);
        console.log(`Created: ${jpegOutputPath}`);
      } catch (error) {
        console.error(`Error creating ${jpegOutputPath}:`, error);
      }
    }
  }
  
  console.log('Image optimization complete!');
})();
