import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { DapprClient } from '@dappr/sdk';
import { AnchorProvider } from '@project-serum/anchor';
import { useToast } from './useToast';

export const useEscrowData = (escrowAddress?: string) => {
  const { connection } = useConnection();
  const { wallet, publicKey } = useWallet();
  const { showToast } = useToast();
  
  const [escrow, setEscrow] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dapprClient, setDapprClient] = useState<DapprClient | null>(null);

  // Initialize Dappr client
  useEffect(() => {
    const initClient = async () => {
      if (!wallet || !publicKey || !connection) return;
      
      try {
        const provider = new AnchorProvider(
          connection,
          wallet.adapter as any,
          {}
        );
        
        const client = new DapprClient(provider);
        setDapprClient(client);
      } catch (error) {
        console.error('Failed to initialize Dappr client:', error);
        showToast('error', 'Failed to initialize client');
      }
    };
    
    initClient();
  }, [wallet, publicKey, connection, showToast]);

  // Fetch escrow data
  const fetchEscrowData = useCallback(async () => {
    if (!dapprClient || !escrowAddress) return;
    
    try {
      setIsLoading(true);
      
      // Fetch escrow account
      const escrowAccount = await dapprClient.escrow.getEscrow(new PublicKey(escrowAddress));
      setEscrow({
        ...escrowAccount,
        creator: escrowAccount.creator.toString(),
        recipient: escrowAccount.recipient.toString(),
        tokenMint: escrowAccount.tokenMint.toString(),
        tokenAccount: escrowAccount.tokenAccount.toString(),
        totalAmount: escrowAccount.totalAmount.toNumber(),
        releasedAmount: escrowAccount.releasedAmount.toNumber(),
        createdAt: new Date(escrowAccount.createdAt.toNumber() * 1000),
        updatedAt: new Date(escrowAccount.updatedAt.toNumber() * 1000),
      });
      
      // Fetch milestones
      const milestonePromises = [];
      for (let i = 0; i < escrowAccount.milestonesCount; i++) {
        const [milestonePDA] = await dapprClient.escrow.getMilestonePDA(
          new PublicKey(escrowAddress),
          i
        );
        milestonePromises.push(
          dapprClient.escrow.getMilestone(milestonePDA)
            .then(ms => ({
              ...ms,
              amount: ms.amount.toNumber(),
              deadline: new Date(ms.deadline.toNumber() * 1000),
              completedAt: ms.completedAt ? new Date(ms.completedAt.toNumber() * 1000) : null,
              paidAt: ms.paidAt ? new Date(ms.paidAt.toNumber() * 1000) : null,
            }))
        );
      }
      
      const milestonesData = await Promise.all(milestonePromises);
      setMilestones(milestonesData);
      
    } catch (error) {
      console.error('Failed to fetch escrow data:', error);
      showToast('error', 'Failed to fetch escrow data', error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [dapprClient, escrowAddress, showToast]);

  // Fetch data when escrowAddress changes
  useEffect(() => {
    if (escrowAddress) {
      fetchEscrowData();
    }
  }, [escrowAddress, fetchEscrowData]);

  // Poll for updates
  useEffect(() => {
    if (!escrowAddress) return;
    
    const interval = setInterval(fetchEscrowData, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [escrowAddress, fetchEscrowData]);

  return {
    escrow,
    milestones,
    isLoading,
    refresh: fetchEscrowData,
    isCreator: publicKey ? escrow?.creator === publicKey.toString() : false,
    isRecipient: publicKey ? escrow?.recipient === publicKey.toString() : false,
  };
};

export default useEscrowData;
