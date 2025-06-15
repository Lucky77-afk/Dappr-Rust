import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { DapprClient } from '../sdk/src';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const CONNECTION = new Connection(RPC_URL, 'confirmed');
const WALLET_PATH = path.resolve(__dirname, '..', 'wallet.json');

// Helper function to load keypair from file
function loadKeypairFromFile(filePath: string): Keypair {
  const secretKeyString = fs.readFileSync(filePath, { encoding: 'utf8' });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}

// Helper function to airdrop SOL
async function airdropSol(publicKey: PublicKey, amount = 1) {
  const signature = await CONNECTION.requestAirdrop(
    publicKey,
    amount * LAMPORTS_PER_SOL
  );
  console.log(`Airdropping ${amount} SOL to ${publicKey.toString()}...`);
  await CONNECTION.confirmTransaction(signature);
  console.log('✅ Airdrop successful');
}

async function main() {
  console.log('🚀 Initializing Dappr Escrow Program');
  
  // Load or create wallet
  let wallet: Keypair;
  if (fs.existsSync(WALLET_PATH)) {
    console.log('🔑 Loading existing wallet...');
    wallet = loadKeypairFromFile(WALLET_PATH);
  } else {
    console.log('🔑 Generating new wallet...');
    wallet = Keypair.generate();
    fs.writeFileSync(WALLET_PATH, `[${wallet.secretKey.toString()}]`);
    console.log('💾 Wallet saved to', WALLET_PATH);
  }
  
  console.log('👛 Wallet public key:', wallet.publicKey.toString());
  
  // Airdrop SOL if needed
  const balance = await CONNECTION.getBalance(wallet.publicKey);
  console.log('💰 Balance:', balance / LAMPORTS_PER_SOL, 'SOL');
  
  if (balance < 0.5 * LAMPORTS_PER_SOL) {
    console.log('💧 Requesting airdrop...');
    await airdropSol(wallet.publicKey, 1);
  }
  
  // Initialize Anchor provider
  const provider = new anchor.AnchorProvider(
    CONNECTION,
    new anchor.Wallet(wallet),
    {}
  );
  
  // Initialize Dappr client
  console.log('🚀 Initializing Dappr client...');
  const dapprClient = new DapprClient(provider);
  const escrowClient = dapprClient.escrow;
  
  // Create test token
  console.log('🪙 Creating test token...');
  const token = await Token.createMint(
    CONNECTION,
    wallet,
    wallet.publicKey,
    null,
    6, // 6 decimals
    TOKEN_PROGRAM_ID
  );
  
  console.log('✅ Test token created:', token.publicKey.toString());
  
  // Create token accounts
  console.log('💳 Creating token accounts...');
  const creatorTokenAccount = await token.createAssociatedTokenAccount(wallet.publicKey);
  console.log('✅ Creator token account:', creatorTokenAccount.toString());
  
  // Mint test tokens
  console.log('🪙 Minting test tokens...');
  await token.mintTo(creatorTokenAccount, wallet.publicKey, [], 1_000_000); // 1M tokens (1.0 with 6 decimals)
  console.log('✅ Minted 1,000,000 test tokens');
  
  // Save deployment info
  const deploymentInfo = {
    wallet: wallet.publicKey.toString(),
    tokenMint: token.publicKey.toString(),
    creatorTokenAccount: creatorTokenAccount.toString(),
    network: 'devnet',
    rpcUrl: RPC_URL,
    timestamp: new Date().toISOString()
  };
  
  const deploymentPath = path.resolve(__dirname, 'deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log('\n✨ Deployment successful!');
  console.log('📄 Deployment info saved to:', deploymentPath);
  console.log('\nNext steps:');
  console.log('1. Fund the escrow with tokens');
  console.log('2. Add milestones');
  console.log('3. Complete milestones and release funds');
  console.log('\nRun the test script:');
  console.log('  npm run test:escrow');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
