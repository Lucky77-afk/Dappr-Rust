import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { DapprClient } from '@dappr/sdk';
import { AnchorProvider } from '@project-serum/anchor';
import { useToast } from '../hooks/useToast';

interface EscrowContextType {
  dapprClient: DapprClient | null;
  isInitialized: boolean;
  initializeClient: () => Promise<void>;
}

const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

export const EscrowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const { wallet, publicKey } = useWallet();
  const { showToast } = useToast();
  
  const [dapprClient, setDapprClient] = useState<DapprClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeClient = useCallback(async () => {
    if (!wallet || !publicKey || !connection) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const provider = new AnchorProvider(
        connection,
        wallet.adapter as any,
        {}
      );
      
      const client = new DapprClient(provider);
      setDapprClient(client);
      setIsInitialized(true);
      
      return client;
    } catch (error) {
      console.error('Failed to initialize Dappr client:', error);
      showToast('error', 'Failed to initialize client');
      throw error;
    }
  }, [wallet, publicKey, connection, showToast]);

  // Initialize client when wallet connects
  useEffect(() => {
    if (wallet && publicKey && connection && !isInitialized) {
      initializeClient().catch(console.error);
    }
  }, [wallet, publicKey, connection, isInitialized, initializeClient]);

  return (
    <EscrowContext.Provider value={{ dapprClient, isInitialized, initializeClient }}>
      {children}
    </EscrowContext.Provider>
  );
};

export const useEscrow = (): EscrowContextType => {
  const context = useContext(EscrowContext);
  if (context === undefined) {
    throw new Error('useEscrow must be used within an EscrowProvider');
  }
  return context;
};

export default EscrowContext;
