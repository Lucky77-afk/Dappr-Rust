import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection, Transaction, TransactionInstruction } from '@solana/web3.js';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { DapprClient } from '@dappr/sdk';
import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import { useToast } from './useToast';

export interface Milestone {
  amount: number;
  deadline: number; // Unix timestamp in seconds
  description: string;
}

export const useEscrow = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, wallet } = useWallet();
  const { showToast } = useToast();
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [escrowClient, setEscrowClient] = useState<DapprClient | null>(null);

  // Initialize the Dappr client
  useEffect(() => {
    const init = async () => {
      if (!publicKey || !connection || !wallet) return;
      
      try {
        setIsInitializing(true);
        
        // Create Anchor provider
        const provider = new AnchorProvider(
          connection,
          wallet.adapter as any,
          {}
        );
        
        // Initialize Dappr client
        const client = new DapprClient(provider);
        setEscrowClient(client);
      } catch (error) {
        console.error('Failed to initialize escrow client:', error);
        showToast('error', 'Failed to initialize escrow client');
      } finally {
        setIsInitializing(false);
      }
    };
    
    init();
  }, [publicKey, connection, wallet, showToast]);

  /**
   * Create a new escrow with milestones
   */
  const createEscrow = useCallback(async (
    recipient: string,
    milestones: Milestone[],
    tokenMint: string
  ) => {
    if (!escrowClient || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      showToast('info', 'Creating escrow...');
      
      // Initialize escrow
      const { escrow, tx: initTx } = await escrowClient.escrow.initializeEscrow(
        new PublicKey(recipient),
        milestones.length
      );
      
      showToast('success', 'Escrow initialized', `Transaction: ${initTx}`);
      
      // Add milestones
      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        const { tx: addTx } = await escrowClient.escrow.addMilestone(
          escrow,
          i,
          milestone.amount,
          milestone.deadline
        );
        console.log(`Added milestone ${i + 1}:`, addTx);
      }
      
      // Fund the escrow
      const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
      const fundTx = await escrowClient.escrow.fundEscrow(
        escrow,
        new PublicKey(tokenMint),
        totalAmount
      );
      
      showToast('success', 'Escrow funded successfully', `Transaction: ${fundTx}`);
      
      return {
        escrowAddress: escrow.toString(),
        transaction: fundTx
      };
    } catch (error) {
      console.error('Failed to create escrow:', error);
      showToast('error', 'Failed to create escrow', error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [escrowClient, publicKey, showToast]);

  /**
   * Complete a milestone
   */
  const completeMilestone = useCallback(async (
    escrowAddress: string,
    milestoneIndex: number
  ) => {
    if (!escrowClient || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      showToast('info', 'Completing milestone...');
      
      const tx = await escrowClient.escrow.completeMilestone(
        new PublicKey(escrowAddress),
        milestoneIndex
      );
      
      showToast('success', 'Milestone completed', `Transaction: ${tx}`);
      return tx;
    } catch (error) {
      console.error('Failed to complete milestone:', error);
      showToast('error', 'Failed to complete milestone', error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [escrowClient, publicKey, showToast]);

  /**
   * Release funds for a completed milestone
   */
  const releaseFunds = useCallback(async (
    escrowAddress: string,
    milestoneIndex: number,
    tokenMint: string,
    recipient: string
  ) => {
    if (!escrowClient || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      showToast('info', 'Releasing funds...');
      
      const tx = await escrowClient.escrow.releaseFunds(
        new PublicKey(escrowAddress),
        milestoneIndex,
        new PublicKey(tokenMint),
        new PublicKey(recipient)
      );
      
      showToast('success', 'Funds released', `Transaction: ${tx}`);
      return tx;
    } catch (error) {
      console.error('Failed to release funds:', error);
      showToast('error', 'Failed to release funds', error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [escrowClient, publicKey, showToast]);

  /**
   * Initiate emergency withdrawal
   */
  const initiateEmergencyWithdrawal = useCallback(async (
    escrowAddress: string,
    creator: string,
    signers: string[]
  ) => {
    if (!escrowClient || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      showToast('info', 'Initiating emergency withdrawal...');
      
      const { multisig, tx } = await escrowClient.escrow.initiateEmergencyWithdrawal(
        new PublicKey(escrowAddress),
        new PublicKey(creator),
        signers.map(s => new PublicKey(s))
      );
      
      showToast('success', 'Emergency withdrawal initiated', `Multisig: ${multisig.toString()}`);
      return { multisig, tx };
    } catch (error) {
      console.error('Failed to initiate emergency withdrawal:', error);
      showToast('error', 'Failed to initiate emergency withdrawal', error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [escrowClient, publicKey, showToast]);

  /**
   * Sign emergency withdrawal
   */
  const signEmergencyWithdrawal = useCallback(async (
    escrowAddress: string
  ) => {
    if (!escrowClient || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      showToast('info', 'Signing emergency withdrawal...');
      
      const tx = await escrowClient.escrow.signEmergencyWithdrawal(
        new PublicKey(escrowAddress)
      );
      
      showToast('success', 'Emergency withdrawal signed', `Transaction: ${tx}`);
      return tx;
    } catch (error) {
      console.error('Failed to sign emergency withdrawal:', error);
      showToast('error', 'Failed to sign emergency withdrawal', error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [escrowClient, publicKey, showToast]);

  /**
   * Get escrow details
   */
  const getEscrow = useCallback(async (escrowAddress: string) => {
    if (!escrowClient) {
      throw new Error('Escrow client not initialized');
    }

    try {
      const escrow = await escrowClient.escrow.getEscrow(new PublicKey(escrowAddress));
      return {
        ...escrow,
        creator: escrow.creator.toString(),
        recipient: escrow.recipient.toString(),
        tokenMint: escrow.tokenMint.toString(),
        tokenAccount: escrow.tokenAccount.toString(),
        totalAmount: escrow.totalAmount.toNumber(),
        releasedAmount: escrow.releasedAmount.toNumber(),
        createdAt: new Date(escrow.createdAt.toNumber() * 1000),
        updatedAt: new Date(escrow.updatedAt.toNumber() * 1000),
      };
    } catch (error) {
      console.error('Failed to get escrow:', error);
      throw error;
    }
  }, [escrowClient]);

  /**
   * Get milestone details
   */
  const getMilestone = useCallback(async (milestoneAddress: string) => {
    if (!escrowClient) {
      throw new Error('Escrow client not initialized');
    }

    try {
      const milestone = await escrowClient.escrow.getMilestone(new PublicKey(milestoneAddress));
      return {
        ...milestone,
        amount: milestone.amount.toNumber(),
        deadline: new Date(milestone.deadline.toNumber() * 1000),
        completedAt: milestone.completedAt ? new Date(milestone.completedAt.toNumber() * 1000) : null,
        paidAt: milestone.paidAt ? new Date(milestone.paidAt.toNumber() * 1000) : null,
      };
    } catch (error) {
      console.error('Failed to get milestone:', error);
      throw error;
    }
  }, [escrowClient]);

  return {
    isInitialized: !!escrowClient,
    isInitializing,
    isLoading,
    createEscrow,
    completeMilestone,
    releaseFunds,
    initiateEmergencyWithdrawal,
    signEmergencyWithdrawal,
    getEscrow,
    getMilestone,
  };
};

export default useEscrow;
