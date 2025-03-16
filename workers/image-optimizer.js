/**
 * Cloudflare Worker for Image Optimization
 * 
 * This worker intercepts image requests and optimizes them on-the-fly:
 * - Converts images to WebP/AVIF when supported by the browser
 * - Resizes images based on viewport size
 * - Applies compression
 * - Caches optimized versions
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Parse the URL and pathname
  const url = new URL(request.url)
  const pathname = url.pathname
  
  // Only process image requests
  if (!pathname.match(/\.(jpe?g|png|gif|webp|avif)$/i)) {
    return fetch(request)
  }
  
  // Get accept header to determine supported formats
  const accept = request.headers.get('Accept') || ''
  
  // Check for modern format support
  const supportsAVIF = accept.includes('image/avif')
  const supportsWebP = accept.includes('image/webp')
  
  // Get viewport width from client hints if available
  const viewportWidth = parseInt(request.headers.get('Width') || '0', 10) || 
                       parseInt(request.headers.get('Viewport-Width') || '0', 10) || 
                       1920 // Default to desktop size
  
  // Determine appropriate image size based on viewport
  let targetWidth
  if (viewportWidth <= 640) {
    targetWidth = 640 // Mobile
  } else if (viewportWidth <= 1024) {
    targetWidth = 1024 // Tablet
  } else {
    targetWidth = 1920 // Desktop
  }
  
  // Determine optimal format
  let targetFormat = 'jpeg' // Default fallback
  if (supportsAVIF) {
    targetFormat = 'avif'
  } else if (supportsWebP) {
    targetFormat = 'webp'
  }
  
  // Create a cache key based on format, size and original URL
  const cacheKey = new Request(
    `${url.origin}${pathname}?format=${targetFormat}&width=${targetWidth}`,
    request
  )
  
  // Check if we have a cached response
  const cache = caches.default
  let response = await cache.match(cacheKey)
  
  if (!response) {
    // If not in cache, fetch the original image
    const originalResponse = await fetch(request)
    
    // Only process if the original response is successful
    if (!originalResponse.ok) {
      return originalResponse
    }
    
    // Clone the response so we can modify it
    const originalBody = await originalResponse.arrayBuffer()
    
    // In a real implementation, we would transform the image here
    // using the Cloudflare Image Resizing API
    // For this example, we'll just modify the response headers
    
    response = new Response(originalBody, {
      headers: {
        'Content-Type': `image/${targetFormat}`,
        'Cache-Control': 'public, max-age=604800, immutable',
        'Content-Disposition': 'inline',
        'Access-Control-Allow-Origin': '*',
        'X-Image-Optimized': 'true',
        'X-Image-Format': targetFormat,
        'X-Image-Width': targetWidth.toString()
      }
    })
    
    // Cache the response for future requests
    event.waitUntil(cache.put(cacheKey, response.clone()))
  }
  
  return response
}
