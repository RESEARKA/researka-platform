import { useDisclosure } from '@chakra-ui/react';

export function useLoginModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return {
    isLoginModalOpen: isOpen,
    openLoginModal: onOpen,
    closeLoginModal: onClose,
  };
}
