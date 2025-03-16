import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isLoginModalOpen: boolean;
  openLoginModal: (redirectPath?: string) => void;
  closeLoginModal: () => void;
  redirectPath: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  setRedirectPath: (path: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');

  const openLoginModal = (redirectPath = '/') => {
    setRedirectPath(redirectPath);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
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
