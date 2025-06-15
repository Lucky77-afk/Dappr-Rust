import { assert } from 'chai';
import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { DapprClient } from '../src';
import { EscrowStatus, MilestoneStatus } from '../src/types';
import { EscrowClient } from '../src/escrow';
import { Provider, Program, web3, AnchorProvider } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';

// Test configuration
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

// Helper function to airdrop SOL to a wallet
const airdropSol = async (connection: Connection, wallet: Keypair, amount = 1) => {
  const airdropSig = await connection.requestAirdrop(
    wallet.publicKey,
    amount * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSig);
};

describe('Escrow', () => {
  // Test accounts
  let creator: Keypair;
  let recipient: Keypair;
  let signer1: Keypair;
  let signer2: Keypair;
  let signer3: Keypair;
  let dapprClient: DapprClient;
  let escrowClient: EscrowClient;
  let tokenMint: PublicKey;
  let creatorTokenAccount: PublicKey;
  let recipientTokenAccount: PublicKey;
  let escrow: PublicKey;
  let milestone: PublicKey;
  let multisig: PublicKey;

  before(async () => {
    // Generate keypairs for test accounts
    creator = Keypair.generate();
    recipient = Keypair.generate();
    signer1 = Keypair.generate();
    signer2 = Keypair.generate();
    signer3 = Keypair.generate();

    // Airdrop SOL to creator for transaction fees
    await airdropSol(provider.connection, creator, 10);
    await airdropSol(provider.connection, recipient, 10);
    await airdropSol(provider.connection, signer1, 10);
    await airdropSol(provider.connection, signer2, 10);
    await airdropSol(provider.connection, signer3, 10);

    // Create a test token mint
    const token = await Token.createMint(
      provider.connection,
      creator,
      creator.publicKey,
      null,
      6, // DAPPR_USD has 6 decimals
      TOKEN_PROGRAM_ID
    );
    tokenMint = token.publicKey;

    // Create token accounts
    creatorTokenAccount = await token.createAssociatedTokenAccount(creator.publicKey);
    recipientTokenAccount = await token.createAssociatedTokenAccount(recipient.publicKey);

    // Mint some test tokens to the creator
    await token.mintTo(creatorTokenAccount, creator.publicKey, [], 1_000_000_000); // 1000 tokens with 6 decimals

    // Initialize Dappr client
    dapprClient = new DapprClient(provider);
    escrowClient = dapprClient.escrow;
  });

  describe('Escrow Lifecycle', () => {
    it('should initialize a new escrow', async () => {
      // Initialize escrow
      const { escrow: escrowPubkey, tx } = await escrowClient.initializeEscrow(
        recipient.publicKey,
        3 // 3 milestones
      );
      
      escrow = escrowPubkey;
      
      // Verify escrow account was created
      const escrowAccount = await escrowClient.getEscrow(escrow);
      
      assert.ok(escrowAccount.creator.equals(creator.publicKey), 'Creator should be set');
      assert.ok(escrowAccount.recipient.equals(recipient.publicKey), 'Recipient should be set');
      assert.equal(escrowAccount.milestonesCount, 3, 'Should have 3 milestones');
      assert.equal(escrowAccount.status, EscrowStatus.Initialized, 'Status should be Initialized');
      assert.equal(escrowAccount.totalAmount.toNumber(), 0, 'Initial total amount should be 0');
    });

    it('should add milestones to the escrow', async () => {
      // Add milestones
      const now = Math.floor(Date.now() / 1000);
      const oneWeek = 7 * 24 * 60 * 60; // 1 week in seconds
      
      // Add 3 milestones with increasing deadlines
      for (let i = 0; i < 3; i++) {
        const amount = (i + 1) * 100_000; // 0.1, 0.2, 0.3 tokens
        const deadline = now + (i + 1) * oneWeek; // 1, 2, 3 weeks from now
        
        const { milestone: milestonePubkey } = await escrowClient.addMilestone(
          escrow,
          i,
          amount,
          deadline
        );
        
        if (i === 0) milestone = milestonePubkey; // Save the first milestone for later tests
        
        // Verify milestone was created
        const milestoneAccount = await escrowClient.getMilestone(milestonePubkey);
        
        assert.equal(milestoneAccount.index, i, `Milestone ${i} index should match`);
        assert.equal(milestoneAccount.amount.toNumber(), amount, `Milestone ${i} amount should match`);
        assert.equal(milestoneAccount.deadline.toNumber(), deadline, `Milestone ${i} deadline should match`);
        assert.equal(milestoneAccount.status, MilestoneStatus.Pending, `Milestone ${i} status should be Pending`);
      }
    });

    it('should fund the escrow', async () => {
      // Get escrow token account
      const escrowTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenMint,
        escrow,
        true
      );
      
      // Fund escrow with 0.6 tokens (100k + 200k + 300k = 600k lamports)
      const tx = await escrowClient.fundEscrow(
        escrow,
        tokenMint,
        600_000 // 0.6 tokens
      );
      
      // Verify escrow was funded
      const escrowAccount = await escrowClient.getEscrow(escrow);
      assert.equal(escrowAccount.status, EscrowStatus.Funded, 'Status should be Funded');
      assert.equal(escrowAccount.totalAmount.toNumber(), 600_000, 'Total amount should be 0.6 tokens');
      
      // Verify tokens were transferred to escrow
      const tokenClient = new Token(
        provider.connection,
        tokenMint,
        TOKEN_PROGRAM_ID,
        creator
      );
      
      const escrowTokenBalance = await tokenClient.getAccountInfo(escrowTokenAccount);
      assert.equal(escrowTokenBalance.amount.toNumber(), 600_000, 'Escrow should have 0.6 tokens');
    });

    it('should complete a milestone', async () => {
      // Complete the first milestone
      const tx = await escrowClient.completeMilestone(escrow, 0);
      
      // Verify milestone was marked as completed
      const [milestonePubkey] = await escrowClient.getMilestonePDA(escrow, 0);
      const milestoneAccount = await escrowClient.getMilestone(milestonePubkey);
      
      assert.equal(milestoneAccount.status, MilestoneStatus.Completed, 'Milestone status should be Completed');
      assert.ok(milestoneAccount.completedAt, 'Completed at should be set');
    });

    it('should release funds for a completed milestone', async () => {
      // Get token balances before release
      const tokenClient = new Token(
        provider.connection,
        tokenMint,
        TOKEN_PROGRAM_ID,
        creator
      );
      
      const initialRecipientBalance = (await tokenClient.getAccountInfo(recipientTokenAccount)).amount.toNumber();
      
      // Release funds for the first milestone (100k = 0.1 tokens)
      const tx = await escrowClient.releaseFunds(
        escrow,
        0, // First milestone
        tokenMint,
        recipient.publicKey
      );
      
      // Verify recipient received the funds
      const finalRecipientBalance = (await tokenClient.getAccountInfo(recipientTokenAccount)).amount.toNumber();
      assert.equal(
        finalRecipientBalance - initialRecipientBalance,
        100_000,
        'Recipient should have received 0.1 tokens'
      );
      
      // Verify milestone was marked as paid
      const [milestonePubkey] = await escrowClient.getMilestonePDA(escrow, 0);
      const milestoneAccount = await escrowClient.getMilestone(milestonePubkey);
      assert.equal(milestoneAccount.status, MilestoneStatus.Paid, 'Milestone status should be Paid');
      assert.ok(milestoneAccount.paidAt, 'Paid at should be set');
      
      // Verify released amount was updated in escrow
      const escrowAccount = await escrowClient.getEscrow(escrow);
      assert.equal(escrowAccount.releasedAmount.toNumber(), 100_000, 'Released amount should be 0.1 tokens');
    });

    it('should initiate emergency withdrawal', async () => {
      // Initiate emergency withdrawal with 2-of-3 multisig
      const signers = [signer1.publicKey, signer2.publicKey, signer3.publicKey];
      const { multisig: multisigPubkey } = await escrowClient.initiateEmergencyWithdrawal(
        escrow,
        creator.publicKey,
        signers
      );
      
      multisig = multisigPubkey;
      
      // Verify multisig was created
      const multisigAccount = await escrowClient.getMultisig(multisig);
      assert.ok(multisigAccount.escrow.equals(escrow), 'Escrow should match');
      assert.equal(multisigAccount.signers.length, 3, 'Should have 3 signers');
      assert.equal(multisigAccount.threshold, 2, 'Threshold should be 2');
      assert.deepEqual(
        multisigAccount.signers.map(s => s.toString()),
        signers.map(s => s.toString()),
        'Signers should match'
      );
      assert.deepEqual(
        multisigAccount.signatures,
        [false, false, false],
        'Initial signatures should all be false'
      );
    });

    it('should sign emergency withdrawal', async () => {
      // Sign with the first signer
      const tx1 = await escrowClient.signEmergencyWithdrawal(escrow);
      
      // Verify signature was recorded
      const multisigAccount1 = await escrowClient.getMultisig(multisig);
      assert.deepEqual(
        multisigAccount1.signatures,
        [true, false, false],
        'First signature should be recorded'
      );
      
      // Sign with the second signer (using a different wallet)
      const originalSigner = provider.wallet;
      try {
        // Switch to signer2
        provider.wallet = {
          publicKey: signer2.publicKey,
          signTransaction: signer2.signTransaction,
          signAllTransactions: signer2.signAllTransactions,
        };
        
        const tx2 = await escrowClient.signEmergencyWithdrawal(escrow);
        
        // Verify second signature was recorded
        const multisigAccount2 = await escrowClient.getMultisig(multisig);
        assert.deepEqual(
          multisigAccount2.signatures,
          [true, true, false],
          'Second signature should be recorded'
        );
        
        // Verify threshold was reached
        assert.isTrue(
          multisigAccount2.signatures.filter(Boolean).length >= multisigAccount2.threshold,
          'Threshold should be reached'
        );
      } finally {
        // Restore original wallet
        provider.wallet = originalSigner;
      }
    });
  });
});
