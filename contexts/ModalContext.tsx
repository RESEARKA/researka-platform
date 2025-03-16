import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';

interface ModalContextType {
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  openLoginModal: () => {},
  closeLoginModal: () => {},
  openRegisterModal: () => {},
  closeRegisterModal: () => {},
});

export const useModalContext = () => useContext(ModalContext);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleSwitchToRegister = () => {
    closeLoginModal();
    openRegisterModal();
  };

  const handleSwitchToLogin = () => {
    closeRegisterModal();
    openLoginModal();
  };

  return (
    <ModalContext.Provider
      value={{
        openLoginModal,
        closeLoginModal,
        openRegisterModal,
        closeRegisterModal,
      }}
    >
      {children}
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeLoginModal} 
        onRegisterClick={handleSwitchToRegister} 
      />
      
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={closeRegisterModal} 
        onLoginClick={handleSwitchToLogin} 
      />
    </ModalContext.Provider>
  );
}
