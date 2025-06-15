import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { DapprClient } from '../src';
import * as anchor from '@project-serum/anchor';
import { BN } from 'bn.js';

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const CONNECTION = new Connection(RPC_URL, 'confirmed');

// Helper function to airdrop SOL
async function airdropSol(publicKey: PublicKey, amount = 1) {
  const signature = await CONNECTION.requestAirdrop(
    publicKey,
    amount * LAMPORTS_PER_SOL
  );
  await CONNECTION.confirmTransaction(signature);
}

async function main() {
  console.log('🚀 Starting Dappr Escrow Test');

  // Generate keypairs for testing
  const creator = Keypair.generate();
  const recipient = Keypair.generate();
  
  console.log('🧑 Creator:', creator.publicKey.toString());
  console.log('👤 Recipient:', recipient.publicKey.toString());

  // Airdrop SOL to creator for transaction fees
  console.log('💸 Airdropping SOL to creator...');
  await airdropSol(creator.publicKey, 1);
  await airdropSol(recipient.publicKey, 1);

  // Create token mint
  console.log('🪙 Creating test token mint...');
  const token = await Token.createMint(
    CONNECTION,
    creator,
    creator.publicKey,
    null,
    6, // DAPPR_USD has 6 decimals
    TOKEN_PROGRAM_ID
  );
  
  console.log('✅ Token created:', token.publicKey.toString());

  // Create token accounts
  console.log('🏦 Creating token accounts...');
  const creatorTokenAccount = await token.createAssociatedTokenAccount(creator.publicKey);
  const recipientTokenAccount = await token.createAssociatedTokenAccount(recipient.publicKey);
  
  console.log('💳 Creator token account:', creatorTokenAccount.toString());
  console.log('💳 Recipient token account:', recipientTokenAccount.toString());

  // Mint test tokens to creator
  console.log('🪙 Minting test tokens...');
  await token.mintTo(creatorTokenAccount, creator.publicKey, [], 1_000_000); // 1M tokens (1.0 with 6 decimals)
  
  console.log('✅ Minted 1,000,000 test tokens to creator');

  // Initialize Dappr client
  console.log('🚀 Initializing Dappr client...');
  const provider = new anchor.AnchorProvider(
    CONNECTION,
    new anchor.Wallet(creator),
    {}
  );
  
  const dapprClient = new DapprClient(provider);
  const escrowClient = dapprClient.escrow;

  // Step 1: Initialize escrow
  console.log('\n🔐 Initializing escrow...');
  const { escrow: escrowPubkey } = await escrowClient.initializeEscrow(
    recipient.publicKey,
    3 // 3 milestones
  );
  
  console.log('✅ Escrow initialized:', escrowPubkey.toString());

  // Step 2: Add milestones
  console.log('\n📅 Adding milestones...');
  const now = Math.floor(Date.now() / 1000);
  const oneWeek = 7 * 24 * 60 * 60;
  
  // Add 3 milestones with increasing deadlines and amounts
  for (let i = 0; i < 3; i++) {
    const amount = (i + 1) * 100_000; // 0.1, 0.2, 0.3 tokens
    const deadline = now + (i + 1) * oneWeek; // 1, 2, 3 weeks from now
    
    await escrowClient.addMilestone(
      escrowPubkey,
      i,
      amount,
      deadline
    );
    
    console.log(`✅ Milestone ${i + 1}: ${amount / 1_000_000} tokens, deadline: ${new Date(deadline * 1000).toLocaleDateString()}`);
  }

  // Step 3: Fund the escrow
  console.log('\n💰 Funding escrow...');
  const totalAmount = 600_000; // 0.6 tokens total (0.1 + 0.2 + 0.3)
  
  await escrowClient.fundEscrow(
    escrowPubkey,
    token.publicKey,
    totalAmount
  );
  
  console.log(`✅ Funded escrow with ${totalAmount / 1_000_000} tokens`);

  // Verify escrow was funded
  const escrowAccount = await escrowClient.getEscrow(escrowPubkey);
  console.log('\n📊 Escrow details:');
  console.log(`- Creator: ${escrowAccount.creator.toString()}`);
  console.log(`- Recipient: ${escrowAccount.recipient.toString()}`);
  console.log(`- Total amount: ${escrowAccount.totalAmount.toNumber() / 1_000_000} tokens`);
  console.log(`- Status: ${escrowAccount.status}`);
  console.log(`- Milestones: ${escrowAccount.milestonesCount}`);

  // Step 4: Complete first milestone
  console.log('\n✅ Completing milestone 1...');
  await escrowClient.completeMilestone(escrowPubkey, 0);
  
  // Verify milestone was completed
  const [milestonePDA] = await escrowClient.getMilestonePDA(escrowPubkey, 0);
  const milestoneAccount = await escrowClient.getMilestone(milestonePDA);
  console.log('✅ Milestone 1 completed at:', new Date(milestoneAccount.completedAt!.toNumber() * 1000).toISOString());

  // Step 5: Release funds for first milestone
  console.log('\n💸 Releasing funds for milestone 1...');
  const recipientBalanceBefore = (await token.getAccountInfo(recipientTokenAccount)).amount.toNumber();
  
  await escrowClient.releaseFunds(
    escrowPubkey,
    0, // First milestone
    token.publicKey,
    recipient.publicKey
  );
  
  // Verify funds were released
  const recipientBalanceAfter = (await token.getAccountInfo(recipientTokenAccount)).amount.toNumber();
  const amountReleased = recipientBalanceAfter - recipientBalanceBefore;
  
  console.log(`✅ Released ${amountReleased / 1_000_000} tokens to recipient`);
  console.log('💰 Recipient balance:', recipientBalanceAfter / 1_000_000, 'tokens');

  // Step 6: Initiate emergency withdrawal
  console.log('\n🚨 Initiating emergency withdrawal...');
  const signers = [
    Keypair.generate().publicKey,
    Keypair.generate().publicKey,
    Keypair.generate().publicKey
  ];
  
  const { multisig: multisigPubkey } = await escrowClient.initiateEmergencyWithdrawal(
    escrowPubkey,
    creator.publicKey,
    signers
  );
  
  console.log('✅ Emergency withdrawal initiated with 3 signers (2/3 required)');
  console.log('🔑 Multisig account:', multisigPubkey.toString());

  // Verify multisig was created
  const multisigAccount = await escrowClient.getMultisig(multisigPubkey);
  console.log('\n🔐 Multisig details:');
  console.log(`- Escrow: ${multisigAccount.escrow.toString()}`);
  console.log(`- Threshold: ${multisigAccount.threshold} of ${multisigAccount.signers.length}`);
  console.log('- Signers:', multisigAccount.signers.map(s => s.toString()));
  console.log('- Signatures:', multisigAccount.signatures);
}

main().catch(console.error);
