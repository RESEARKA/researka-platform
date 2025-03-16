import React, { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { WalletProvider } from './WalletProvider';

interface ClientSideProvidersProps {
  children: ReactNode;
}

export function ClientSideProviders({ children }: ClientSideProvidersProps) {
  return (
    <AuthProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </AuthProvider>
  );
}
