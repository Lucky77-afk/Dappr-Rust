import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Dappr } from '../target/types/dappr';

describe('dappr', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Dappr as Program<Dappr>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
