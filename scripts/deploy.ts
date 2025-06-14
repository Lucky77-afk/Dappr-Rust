import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
} from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import * as fs from 'fs';
import * as path from 'path';
import { DapprClient } from '../sdk/src';

// Configuration
const CONFIG = {
  // Use localhost for local development
  // For devnet or mainnet, use the appropriate cluster URL
  clusterUrl: 'http://localhost:8899',
  keypairPath: path.join(process.env.HOME || process.env.USERPROFILE || '', '.config/solana/id.json'),
  programId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS',
  tokenMetadataProgramId: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
};

// Load the wallet keypair
function loadWalletKeypair(keypairPath: string): Keypair {
  try {
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
  } catch (error) {
    console.error('Failed to load wallet keypair:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting Dappr token deployment...');

  // Load wallet
  const walletKeypair = loadWalletKeypair(CONFIG.keypairPath);
  console.log(`🔑 Using wallet: ${walletKeypair.publicKey.toString()}`);

  // Initialize connection
  const connection = new anchor.web3.Connection(CONFIG.clusterUrl, 'confirmed');
  
  // Create Dappr client
  const dapprClient = new DapprClient({
    connection,
    wallet: {
      publicKey: walletKeypair.publicKey,
      signTransaction: (tx) => {
        tx.sign(walletKeypair);
        return Promise.resolve(tx);
      },
      signAllTransactions: (txs) => {
        return Promise.all(txs.map(tx => {
          tx.sign(walletKeypair);
          return tx;
        }));
      },
    },
  });

  try {
    console.log('🔄 Initializing token mints...');
    
    // Initialize tokens
    const { dapprGovMint, dapprUsdMint } = await dapprClient.initializeTokens();
    
    console.log('✅ Token mints initialized successfully!');
    console.log(`DAPPR_GOV Mint: ${dapprGovMint.toString()}`);
    console.log(`DAPPR_USD Mint: ${dapprUsdMint.toString()}`);

    // Mint initial supply to the deployer
    console.log('🔄 Minting initial token supply...');
    
    // Mint DAPPR_GOV tokens
    await dapprClient.mintTokens(
      dapprGovMint,
      walletKeypair.publicKey,
      1_000_000_000 // 1,000 tokens (assuming 6 decimals)
    );
    
    // Mint DAPPR_USD tokens
    await dapprClient.mintTokens(
      dapprUsdMint,
      walletKeypair.publicKey,
      10_000_000 // 10,000 tokens (assuming 6 decimals)
    );
    
    console.log('✅ Initial token supply minted!');
    
    console.log('\n🎉 Deployment completed successfully!');
    
    // Save deployment info
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      programId: CONFIG.programId,
      tokens: {
        DAPPR_GOV: {
          mint: dapprGovMint.toString(),
          name: 'DAPPR Governance Token',
          symbol: 'DAPPR_GOV',
          decimals: 9,
        },
        DAPPR_USD: {
          mint: dapprUsdMint.toString(),
          name: 'DAPPR USD',
          symbol: 'DAPPR_USD',
          decimals: 6,
        },
      },
      network: CONFIG.clusterUrl.includes('devnet') ? 'devnet' : 'localnet',
    };
    
    // Save to file
    const outputPath = path.join(__dirname, '..', 'deployment.json');
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`📝 Deployment info saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
main().catch(console.error);
