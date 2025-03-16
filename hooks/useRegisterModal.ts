import { useDisclosure } from '@chakra-ui/react';

export function useRegisterModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return {
    isRegisterModalOpen: isOpen,
    openRegisterModal: onOpen,
    closeRegisterModal: onClose,
  };
}
