import React, { useEffect, useState } from 'react';

interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

// Default preferences
const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
};

// Create context for accessibility preferences
const AccessibilityContext = React.createContext<{
  preferences: AccessibilityPreferences;
  setPreference: (key: keyof AccessibilityPreferences, value: boolean) => void;
  resetPreferences: () => void;
}>({
  preferences: defaultPreferences,
  setPreference: () => {},
  resetPreferences: () => {},
});

// Local storage key for saving preferences
const STORAGE_KEY = 'researka-accessibility-preferences';

/**
 * Provider component for accessibility preferences
 */
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage or defaults
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    if (typeof window === 'undefined') return defaultPreferences;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultPreferences;
    } catch (e) {
      console.error('Error loading accessibility preferences:', e);
      return defaultPreferences;
    }
  });

  // Update a single preference
  const setPreference = (key: keyof AccessibilityPreferences, value: boolean) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [key]: value };
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      }
      
      return newPrefs;
    });
  };

  // Reset all preferences to defaults
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPreferences));
    }
  };

  // Check for user's system preferences on initial load
  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      setPreference('reducedMotion', true);
    }

    // Check for prefers-contrast
    const prefersContrast = window.matchMedia('(prefers-contrast: more)');
    if (prefersContrast.matches) {
      setPreference('highContrast', true);
    }
  }, []);

  // Apply preferences to the document
  useEffect(() => {
    // Apply high contrast
    document.documentElement.classList.toggle('high-contrast', preferences.highContrast);
    
    // Apply large text
    document.documentElement.classList.toggle('large-text', preferences.largeText);
    
    // Apply reduced motion
    document.documentElement.classList.toggle('reduced-motion', preferences.reducedMotion);
    
    // Apply screen reader optimizations
    document.documentElement.classList.toggle('screen-reader', preferences.screenReader);
    
    // Set ARIA attributes for screen readers
    if (preferences.screenReader) {
      document.documentElement.setAttribute('aria-live', 'polite');
    } else {
      document.documentElement.removeAttribute('aria-live');
    }
  }, [preferences]);

  return (
    <AccessibilityContext.Provider value={{ preferences, setPreference, resetPreferences }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

/**
 * Hook to access accessibility preferences
 */
export const useAccessibility = () => {
  return React.useContext(AccessibilityContext);
};

/**
 * Skip to content link component
 */
export const SkipToContent: React.FC<{ contentId: string }> = ({ contentId }) => {
  return (
    <a 
      href={`#${contentId}`}
      className="skip-to-content"
      aria-label="Skip to main content"
    >
      Skip to content
    </a>
  );
};

/**
 * Accessibility control panel component
 */
export const AccessibilityControlPanel: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { preferences, setPreference, resetPreferences } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`accessibility-panel ${className} ${isOpen ? 'open' : 'closed'}`}>
      <button 
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close accessibility settings" : "Open accessibility settings"}
      >
        <span className="sr-only">Accessibility</span>
        <svg 
          aria-hidden="true" 
          focusable="false" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-10h2v5h-2zm0-5h2v2h-2z" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="accessibility-controls" role="dialog" aria-label="Accessibility settings">
          <h2>Accessibility Settings</h2>
          
          <div className="accessibility-option">
            <input 
              type="checkbox" 
              id="high-contrast" 
              checked={preferences.highContrast}
              onChange={(e) => setPreference('highContrast', e.target.checked)}
            />
            <label htmlFor="high-contrast">High Contrast</label>
          </div>
          
          <div className="accessibility-option">
            <input 
              type="checkbox" 
              id="large-text" 
              checked={preferences.largeText}
              onChange={(e) => setPreference('largeText', e.target.checked)}
            />
            <label htmlFor="large-text">Large Text</label>
          </div>
          
          <div className="accessibility-option">
            <input 
              type="checkbox" 
              id="reduced-motion" 
              checked={preferences.reducedMotion}
              onChange={(e) => setPreference('reducedMotion', e.target.checked)}
            />
            <label htmlFor="reduced-motion">Reduced Motion</label>
          </div>
          
          <div className="accessibility-option">
            <input 
              type="checkbox" 
              id="screen-reader" 
              checked={preferences.screenReader}
              onChange={(e) => setPreference('screenReader', e.target.checked)}
            />
            <label htmlFor="screen-reader">Screen Reader Optimizations</label>
          </div>
          
          <button 
            className="reset-button"
            onClick={resetPreferences}
            aria-label="Reset all accessibility settings to default"
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Focus trap component for modals and dialogs
 */
export const FocusTrap: React.FC<{ 
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}> = ({ children, active = true, className = '' }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };
    
    // Focus the first element when the trap is activated
    firstElement.focus();
    
    // Add event listener for tab key
    document.addEventListener('keydown', handleTabKey);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [active]);
  
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

/**
 * Accessible image component with proper alt text
 */
export const AccessibleImage: React.FC<{
  src: string;
  alt: string;
  decorative?: boolean;
  className?: string;
  width?: number;
  height?: number;
}> = ({ src, alt, decorative = false, className = '', width, height }) => {
  return (
    <img 
      src={src}
      alt={decorative ? '' : alt}
      aria-hidden={decorative}
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  );
};

/**
 * Announce changes to screen readers
 */
export const ScreenReaderAnnouncement: React.FC<{
  message: string;
  assertive?: boolean;
}> = ({ message, assertive = false }) => {
  return (
    <div 
      className="sr-only" 
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {message}
    </div>
  );
};
