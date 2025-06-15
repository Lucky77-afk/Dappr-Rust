import { Program, web3, BN } from '@project-serum/anchor';
import { PublicKey, Connection, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Dappr } from './dappr';
import { DapprClient } from './index';
import { Escrow, Milestone, Multisig } from './types';

// Constants
export const ESCROW_PDA_SEED = 'escrow';
export const MILESTONE_PDA_SEED = 'milestone';
export const MULTISIG_PDA_SEED = 'multisig';

export class EscrowClient {
  private program: Program<Dappr>;
  private connection: Connection;
  private wallet: any; // Wallet interface

  constructor(dapprClient: DapprClient) {
    this.program = dapprClient['program'];
    this.connection = dapprClient['provider'].connection;
    this.wallet = dapprClient['provider'].wallet;
  }

  /**
   * Derive the escrow PDA
   */
  async getEscrowPDA(creator: PublicKey, recipient: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from(ESCROW_PDA_SEED),
        creator.toBuffer(),
        recipient.toBuffer(),
      ],
      this.program.programId
    );
  }

  /**
   * Derive the milestone PDA
   */
  async getMilestonePDA(escrow: PublicKey, milestoneIndex: number): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from(MILESTONE_PDA_SEED),
        escrow.toBuffer(),
        new Uint8Array([milestoneIndex]),
      ],
      this.program.programId
    );
  }

  /**
   * Derive the multisig PDA for an escrow
   */
  async getMultisigPDA(escrow: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from(MULTISIG_PDA_SEED),
        escrow.toBuffer(),
      ],
      this.program.programId
    );
  }

  /**
   * Initialize a new escrow
   */
  async initializeEscrow(
    recipient: PublicKey,
    milestonesCount: number
  ): Promise<{ escrow: PublicKey; tx: string }> {
    const [escrow, bump] = await this.getEscrowPDA(this.wallet.publicKey, recipient);
    
    const tx = await this.program.rpc.initializeEscrow(
      bump,
      milestonesCount,
      {
        accounts: {
          creator: this.wallet.publicKey,
          recipient,
          escrow,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        },
      }
    );

    return { escrow, tx };
  }

  /**
   * Add a milestone to an escrow
   */
  async addMilestone(
    escrow: PublicKey,
    milestoneIndex: number,
    amount: number,
    deadline: number
  ): Promise<{ milestone: PublicKey; tx: string }> {
    const [milestone, bump] = await this.getMilestonePDA(escrow, milestoneIndex);
    
    const tx = await this.program.rpc.addMilestone(
      bump,
      new BN(amount),
      new BN(deadline),
      {
        accounts: {
          creator: this.wallet.publicKey,
          escrow,
          milestone,
          systemProgram: SystemProgram.programId,
        },
      }
    );

    return { milestone, tx };
  }

  /**
   * Fund an escrow with tokens
   */
  async fundEscrow(
    escrow: PublicKey,
    tokenMint: PublicKey,
    amount: number
  ): Promise<string> {
    // Get or create token accounts
    const creatorTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      this.wallet.publicKey
    );

    const escrowTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      escrow,
      true
    );

    const tx = await this.program.rpc.fundEscrow(
      new BN(amount),
      {
        accounts: {
          funder: this.wallet.publicKey,
          escrow,
          tokenMint,
          funderTokenAccount: creatorTokenAccount,
          escrowTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
      }
    );

    return tx;
  }

  /**
   * Mark a milestone as completed
   */
  async completeMilestone(
    escrow: PublicKey,
    milestoneIndex: number
  ): Promise<string> {
    const [milestone] = await this.getMilestonePDA(escrow, milestoneIndex);
    
    const tx = await this.program.rpc.completeMilestone({
      accounts: {
        verifier: this.wallet.publicKey,
        escrow,
        milestone,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
      },
    });

    return tx;
  }

  /**
   * Release funds for a completed milestone
   */
  async releaseFunds(
    escrow: PublicKey,
    milestoneIndex: number,
    tokenMint: PublicKey,
    recipient: PublicKey
  ): Promise<string> {
    const [milestone] = await this.getMilestonePDA(escrow, milestoneIndex);
    
    // Get or create token accounts
    const escrowTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      escrow,
      true
    );

    const recipientTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      recipient,
      true
    );

    const tx = await this.program.rpc.releaseFunds({
      accounts: {
        releaser: this.wallet.publicKey,
        escrow,
        recipient,
        milestone,
        tokenMint,
        escrowTokenAccount,
        recipientTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
      },
    });

    return tx;
  }

  /**
   * Initiate emergency withdrawal process
   */
  async initiateEmergencyWithdrawal(
    escrow: PublicKey,
    creator: PublicKey,
    signers: PublicKey[]
  ): Promise<{ multisig: PublicKey; tx: string }> {
    const [multisig, bump] = await this.getMultisigPDA(escrow);
    
    const tx = await this.program.rpc.initiateEmergencyWithdrawal(
      bump,
      signers,
      {
        accounts: {
          requester: this.wallet.publicKey,
          escrow,
          creator,
          multisig,
          systemProgram: SystemProgram.programId,
        },
      }
    );

    return { multisig, tx };
  }

  /**
   * Sign an emergency withdrawal
   */
  async signEmergencyWithdrawal(
    escrow: PublicKey
  ): Promise<string> {
    const [multisig] = await this.getMultisigPDA(escrow);
    
    const tx = await this.program.rpc.signEmergencyWithdrawal({
      accounts: {
        signer: this.wallet.publicKey,
        escrow,
        multisig,
      },
    });

    return tx;
  }

  /**
   * Fetch escrow account data
   */
  async getEscrow(escrow: PublicKey): Promise<Escrow> {
    return this.program.account.escrow.fetch(escrow);
  }

  /**
   * Fetch milestone account data
   */
  async getMilestone(milestone: PublicKey): Promise<Milestone> {
    return this.program.account.milestone.fetch(milestone);
  }

  /**
   * Fetch multisig account data
   */
  async getMultisig(multisig: PublicKey): Promise<Multisig> {
    return this.program.account.multisig.fetch(multisig);
  }

  /**
   * Subscribe to escrow account changes
   */
  onEscrowChange(
    escrow: PublicKey,
    callback: (escrow: Escrow) => void
  ): number {
    return this.program.account.escrow.subscribe(escrow, 'processed', callback);
  }

  /**
   * Unsubscribe from escrow account changes
   */
  async removeEscrowChangeListener(subscriptionId: number): Promise<void> {
    await this.connection.removeAccountChangeListener(subscriptionId);
  }

  /**
   * Get all milestones for an escrow
   */
  async getMilestones(escrow: PublicKey): Promise<Milestone[]> {
    const filter = {
      memcmp: {
        offset: 8, // Skip discriminator
        bytes: escrow.toBase58(),
      },
    };

    const milestones = await this.program.account.milestone.all([filter]);
    return milestones.map(m => m.account);
  }
}

// Export types
export * from './types';
