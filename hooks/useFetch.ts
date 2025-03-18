import { useState, useEffect } from 'react';

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * A custom hook for data fetching with loading and error states
 * @param url The URL to fetch data from
 * @param options Optional fetch options
 * @returns Object containing data, loading state, and error (if any)
 */
function useFetch<T>(url: string, options?: RequestInit): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!url) return;
    
    let isMounted = true;
    
    const fetchData = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setState({
            data,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [url, JSON.stringify(options)]);

  return state;
}

export default useFetch;
