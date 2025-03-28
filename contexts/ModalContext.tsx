import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isLoginModalOpen: boolean;
  openLoginModal: (redirectPath?: string) => void;
  closeLoginModal: () => void;
  isSignupModalOpen: boolean;
  openSignupModal: () => void;
  closeSignupModal: () => void;
  redirectPath: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  setRedirectPath: (path: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');

  const openLoginModal = (redirectPath = '/') => {
    setRedirectPath(redirectPath);
    setIsLoginModalOpen(true);
    // Close signup modal if it's open
    if (isSignupModalOpen) {
      setIsSignupModalOpen(false);
    }
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
    // Close login modal if it's open
    if (isLoginModalOpen) {
      setIsLoginModalOpen(false);
    }
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  const onOpen = () => {
    setIsLoginModalOpen(true);
  };

  const onClose = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        isSignupModalOpen,
        openSignupModal,
        closeSignupModal,
        redirectPath,
        isOpen: isLoginModalOpen,
        onOpen,
        onClose,
        setRedirectPath,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
