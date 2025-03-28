import { useToast as useChakraToast } from '@chakra-ui/react';

/**
 * Custom hook for centralized toast management with automatic deduplication
 * Uses Chakra UI's toast system with unique IDs to prevent duplicate toasts
 */
export const useAppToast = () => {
  const toast = useChakraToast();

  const showToast = (options: { 
    id?: string; 
    title: string; 
    description?: string; 
    status?: 'success' | 'error' | 'warning' | 'info'; 
    duration?: number; 
    isClosable?: boolean;
  }) => {
    // Generate a unique ID if not provided
    const toastId = options.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Only show the toast if one with the same ID is not already active
    if (!toast.isActive(toastId)) {
      toast({
        id: toastId,
        title: options.title,
        description: options.description,
        status: options.status || 'success',
        duration: options.duration || 5000,
        isClosable: options.isClosable !== undefined ? options.isClosable : true,
      });
    }
    
    return toastId;
  };

  // Add isActive method to check if a toast with a given ID is currently active
  showToast.isActive = (id: string) => toast.isActive(id);

  return showToast;
};

export default useAppToast;
