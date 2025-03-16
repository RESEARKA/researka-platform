import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/accessibility.css'
import App from './App.tsx'
import { initPerformanceOptimizations } from './utils/performanceOptimizations'
import { markPerformance } from './utils/performanceMonitor'
import { AccessibilityProvider } from './components/a11y/AccessibilityEnhancements'

// Mark the application start time
markPerformance('app-init-start')

// Initialize performance optimizations
initPerformanceOptimizations()

// Register service worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered:', registration)
    }).catch(error => {
      console.log('SW registration failed:', error)
    })
  })
}

// Mark React initialization
markPerformance('react-init-start')

// Create the root element
const rootElement = document.getElementById('root');

// Render the app with accessibility provider
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AccessibilityProvider>
        <App />
      </AccessibilityProvider>
    </StrictMode>,
  )
}

// Mark React initialization complete
markPerformance('react-init-complete')
