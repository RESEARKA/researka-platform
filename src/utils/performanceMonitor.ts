/**
 * Performance Monitoring Utility for Researka
 * 
 * This utility provides functions to measure and report various performance metrics
 * including page load time, resource timing, and custom performance marks.
 */

declare global {
  interface Window {
    gtag?: (command: string, action: string, params: any) => void;
  }
}

interface PerformanceMetrics {
  timeToFirstByte?: number;
  domContentLoaded?: number;
  windowLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  resourceLoadTimes?: {
    [key: string]: number;
  };
  customMarks?: {
    [key: string]: number;
  };
  // Mobile-specific metrics
  isMobile?: boolean;
  connectionType?: string;
  effectiveConnectionType?: string;
  saveData?: boolean;
  batteryLevel?: number;
  memoryUsage?: number;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

/**
 * Detects if the current device is mobile
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth <= 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Gets network information if available
 */
export const getNetworkInfo = () => {
  if (typeof navigator === 'undefined' || !(navigator as any).connection) {
    return {
      connectionType: 'unknown',
      effectiveConnectionType: 'unknown',
      saveData: false
    };
  }

  const connection = (navigator as any).connection;
  return {
    connectionType: connection.type || 'unknown',
    effectiveConnectionType: connection.effectiveType || 'unknown',
    saveData: !!connection.saveData
  };
};

/**
 * Gets battery information if available
 */
export const getBatteryInfo = async (): Promise<{ level: number | null }> => {
  if (typeof navigator === 'undefined' || !(navigator as any).getBattery) {
    return { level: null };
  }

  try {
    const battery = await (navigator as any).getBattery();
    return { level: battery.level };
  } catch (e) {
    console.error('Error getting battery info:', e);
    return { level: null };
  }
};

/**
 * Gets memory usage information if available
 */
export const getMemoryInfo = (): number | null => {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return null;
  }

  try {
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
  } catch (e) {
    console.error('Error getting memory info:', e);
    return null;
  }
};

/**
 * Collects core web vitals and other performance metrics
 */
export const collectPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }

  const metrics: PerformanceMetrics = {
    resourceLoadTimes: {},
    customMarks: {},
  };

  // Navigation timing
  const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigationTiming) {
    metrics.timeToFirstByte = navigationTiming.responseStart - navigationTiming.requestStart;
    metrics.domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
    metrics.windowLoaded = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
  }

  // Paint timing
  const paintMetrics = performance.getEntriesByType('paint');
  paintMetrics.forEach((entry) => {
    if (entry.name === 'first-paint') {
      metrics.firstPaint = entry.startTime;
    }
    if (entry.name === 'first-contentful-paint') {
      metrics.firstContentfulPaint = entry.startTime;
    }
  });

  // Resource timing
  const resourceEntries = performance.getEntriesByType('resource');
  resourceEntries.forEach((entry) => {
    const url = entry.name.split('/').pop() || entry.name;
    metrics.resourceLoadTimes![url] = entry.duration;
  });

  // Custom marks
  const markEntries = performance.getEntriesByType('mark');
  markEntries.forEach((entry) => {
    metrics.customMarks![entry.name] = entry.startTime;
  });

  // Mobile-specific metrics
  metrics.isMobile = isMobileDevice();
  const networkInfo = getNetworkInfo();
  metrics.connectionType = networkInfo.connectionType;
  metrics.effectiveConnectionType = networkInfo.effectiveConnectionType;
  metrics.saveData = networkInfo.saveData;
  
  // Battery info (async)
  const batteryInfo = await getBatteryInfo();
  metrics.batteryLevel = batteryInfo.level !== null ? batteryInfo.level : undefined;
  
  // Memory usage
  metrics.memoryUsage = getMemoryInfo() || undefined;

  return metrics;
};

/**
 * Creates a performance mark
 */
export const markPerformance = (markName: string): void => {
  if (typeof window !== 'undefined' && window.performance && performance.mark) {
    performance.mark(markName);
  }
};

/**
 * Measures time between two marks
 */
export const measurePerformance = (measureName: string, startMark: string, endMark: string): PerformanceEntry | undefined => {
  if (typeof window !== 'undefined' && window.performance && performance.measure) {
    try {
      performance.measure(measureName, startMark, endMark);
      return performance.getEntriesByName(measureName)[0];
    } catch (error) {
      console.error('Error measuring performance:', error);
    }
  }
  return undefined;
};

/**
 * Reports metrics to console or analytics service
 */
export const reportPerformanceMetrics = (
  metrics: PerformanceMetrics, 
  destination: 'console' | 'analytics' = 'console'
): void => {
  if (destination === 'console') {
    console.group('Performance Metrics');
    console.log('Time to First Byte:', metrics.timeToFirstByte?.toFixed(2), 'ms');
    console.log('DOM Content Loaded:', metrics.domContentLoaded?.toFixed(2), 'ms');
    console.log('Window Loaded:', metrics.windowLoaded?.toFixed(2), 'ms');
    console.log('First Paint:', metrics.firstPaint?.toFixed(2), 'ms');
    console.log('First Contentful Paint:', metrics.firstContentfulPaint?.toFixed(2), 'ms');
    console.log('Largest Contentful Paint:', metrics.largestContentfulPaint?.toFixed(2), 'ms');
    console.log('First Input Delay:', metrics.firstInputDelay?.toFixed(2), 'ms');
    console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift?.toFixed(4));
    
    // Mobile-specific metrics
    if (metrics.isMobile) {
      console.group('Mobile Metrics');
      console.log('Device Type: Mobile');
      console.log('Connection Type:', metrics.connectionType);
      console.log('Effective Connection Type:', metrics.effectiveConnectionType);
      console.log('Save Data Mode:', metrics.saveData ? 'Enabled' : 'Disabled');
      if (metrics.batteryLevel !== undefined) {
        console.log('Battery Level:', (metrics.batteryLevel * 100).toFixed(0), '%');
      }
      if (metrics.memoryUsage !== undefined) {
        console.log('Memory Usage:', (metrics.memoryUsage * 100).toFixed(0), '%');
      }
      console.groupEnd();
    }
    
    console.groupEnd();
  } else if (destination === 'analytics') {
    // Send to analytics service
    // This would be implemented with your specific analytics provider
    if (window.gtag) {
      window.gtag('event', 'performance_metrics', {
        ...metrics,
        event_category: 'Performance',
        event_label: 'Core Web Vitals',
        non_interaction: true
      });
    }
  }
};

/**
 * Monitors route changes for SPA performance
 */
export const monitorRouteChange = (routeName: string): void => {
  markPerformance(`route-start-${routeName}`);
  
  // Use requestAnimationFrame to measure when the route is visually complete
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      markPerformance(`route-end-${routeName}`);
      const measurement = measurePerformance(
        `route-change-${routeName}`,
        `route-start-${routeName}`,
        `route-end-${routeName}`
      );
      
      if (measurement) {
        console.log(`Route change to ${routeName} took ${measurement.duration.toFixed(2)}ms`);
      }
    });
  });
};

/**
 * Initializes performance monitoring
 */
export const initPerformanceMonitoring = (): void => {
  if (typeof window === 'undefined') return;

  // Listen for LCP
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    const metrics = { largestContentfulPaint: lastEntry.startTime };
    reportPerformanceMetrics(metrics);
  });
  
  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP observation not supported', e);
  }

  // Listen for FID
  const fidObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const firstInput = entries[0] as FirstInputEntry;
    const metrics = { firstInputDelay: firstInput.processingStart - firstInput.startTime };
    reportPerformanceMetrics(metrics);
  });
  
  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('FID observation not supported', e);
  }

  // Listen for CLS
  let clsValue = 0;
  let clsEntries: PerformanceEntry[] = [];
  
  const clsObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries() as PerformanceEntry[];
    
    entries.forEach((entry) => {
      // Only count layout shifts without recent user input
      if (!(entry as any).hadRecentInput) {
        const firstSessionEntry = clsEntries.length === 0;
        const entrySameSession = firstSessionEntry || 
          (entry.startTime - clsEntries[clsEntries.length - 1].startTime) < 1000;
          
        if (!entrySameSession) {
          clsValue = 0;
          clsEntries = [];
        }
        
        clsEntries.push(entry);
        clsValue += (entry as any).value;
      }
    });
    
    reportPerformanceMetrics({ cumulativeLayoutShift: clsValue });
  });
  
  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.warn('CLS observation not supported', e);
  }

  // Monitor network changes for mobile
  if (typeof navigator !== 'undefined' && (navigator as any).connection) {
    const connection = (navigator as any).connection;
    connection.addEventListener('change', () => {
      const networkInfo = getNetworkInfo();
      reportPerformanceMetrics({
        connectionType: networkInfo.connectionType,
        effectiveConnectionType: networkInfo.effectiveConnectionType,
        saveData: networkInfo.saveData
      });
    });
  }

  // Record initial page load metrics
  window.addEventListener('load', async () => {
    setTimeout(async () => {
      const metrics = await collectPerformanceMetrics();
      reportPerformanceMetrics(metrics);
    }, 0);
  });
};

export default {
  collectPerformanceMetrics,
  markPerformance,
  measurePerformance,
  reportPerformanceMetrics,
  monitorRouteChange,
  initPerformanceMonitoring,
};
