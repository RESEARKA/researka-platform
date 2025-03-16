import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { Link } from 'react-router-dom';

interface CookieConsentBannerProps {
  privacyPolicyUrl?: string;
  cookiePolicyUrl?: string;
  buttonText?: string;
  declineButtonText?: string;
  cookieTimeout?: number; // in days
  position?: 'top' | 'bottom';
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  declineButtonStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

/**
 * GDPR-compliant cookie consent banner component
 * This component shows a cookie consent banner to users and stores their preference
 */
export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  privacyPolicyUrl = '/privacy-policy',
  cookiePolicyUrl = '/cookie-policy',
  buttonText = 'I understand',
  declineButtonText = 'Decline',
  cookieTimeout = 365, // 1 year
  position = 'bottom',
  style,
  buttonStyle,
  declineButtonStyle,
  contentStyle,
}) => {
  return (
    <CookieConsent
      location={position}
      buttonText={buttonText}
      declineButtonText={declineButtonText}
      cookieName="researka-gdpr-consent"
      style={{
        background: '#2B373B',
        fontSize: '14px',
        padding: '16px',
        alignItems: 'center',
        ...style,
      }}
      buttonStyle={{
        background: '#0077cc',
        color: 'white',
        fontSize: '14px',
        padding: '8px 16px',
        borderRadius: '4px',
        ...buttonStyle,
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: 'white',
        fontSize: '14px',
        padding: '8px 16px',
        borderRadius: '4px',
        border: '1px solid white',
        marginRight: '10px',
        ...declineButtonStyle,
      }}
      contentStyle={{
        flex: '1 0 300px',
        margin: '0 16px',
        ...contentStyle,
      }}
      expires={cookieTimeout}
      enableDeclineButton
      onDecline={() => {
        // Handle declined cookies - disable analytics, etc.
        window.localStorage.setItem('researka-analytics-disabled', 'true');
      }}
      onAccept={() => {
        // Enable analytics and other tracking
        window.localStorage.removeItem('researka-analytics-disabled');
      }}
    >
      <span>
        This website uses cookies to enhance the user experience and analyze site usage. 
        By clicking "I understand," you consent to our use of cookies in accordance with our{' '}
        <Link to={cookiePolicyUrl} style={{ color: '#0077cc' }}>
          Cookie Policy
        </Link>{' '}
        and{' '}
        <Link to={privacyPolicyUrl} style={{ color: '#0077cc' }}>
          Privacy Policy
        </Link>
        .
      </span>
    </CookieConsent>
  );
};

/**
 * Hook to check if analytics/tracking is allowed by the user
 * Use this before initializing any analytics or tracking code
 */
export const useTrackingPermission = (): boolean => {
  const [hasConsent, setHasConsent] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    // Check if user has given consent
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('researka-gdpr-consent='));
    
    // Check if analytics is explicitly disabled
    const analyticsDisabled = window.localStorage.getItem('researka-analytics-disabled');
    
    setHasConsent(cookieValue !== undefined && analyticsDisabled !== 'true');
  }, []);
  
  return hasConsent;
};

/**
 * Utility to check if a specific cookie category is allowed
 * @param category The cookie category to check (e.g., 'necessary', 'analytics', 'marketing')
 */
export const isCookieCategoryAllowed = (category: 'necessary' | 'analytics' | 'marketing'): boolean => {
  // Necessary cookies are always allowed
  if (category === 'necessary') return true;
  
  // For other categories, check if consent was given
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('researka-gdpr-consent='));
  
  const analyticsDisabled = window.localStorage.getItem('researka-analytics-disabled');
  
  return cookieValue !== undefined && analyticsDisabled !== 'true';
};
