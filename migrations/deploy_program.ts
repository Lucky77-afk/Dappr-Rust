import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Dappr } from '../target/types/dappr';

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

async function main() {
  console.log('🚀 Starting deployment...');
  
  // Get the program ID from the workspace
  const program = anchor.workspace.Dappr as Program<Dappr>;
  console.log(`Program ID: ${program.programId.toString()}`);
  
  // Deploy the program
  console.log('Deploying program...');
  await program.methods.initialize().rpc();
  
  console.log('✅ Deployment successful!');
}

main().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
