import { Program, Provider, web3 } from '@project-serum/anchor';
import { PublicKey, Connection, Keypair } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { Dappr, IDL } from './dappr';
import { EscrowClient } from './escrow';

export * from './types';

// Re-export commonly used types
export { PublicKey, Connection, Keypair };

// Re-export escrow types
export * from './escrow';

// Program ID - should match the one in your program
export const DAPPR_PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// Token mint addresses (will be set after initialization)
let DAPPR_GOV_MINT: PublicKey | null = null;
let DAPPR_USD_MINT: PublicKey | null = null;

// Token metadata
const TOKEN_METADATA = {
  DAPPR_GOV: {
    name: 'DAPPR Governance Token',
    symbol: 'DAPPR_GOV',
    decimals: 9,
    uri: 'https://dappr-token-metadata.s3.amazonaws.com/dappr_gov.json',
  },
  DAPPR_USD: {
    name: 'DAPPR USD',
    symbol: 'DAPPR_USD',
    decimals: 6,
    uri: 'https://dappr-token-metadata.s3.amazonaws.com/dappr_usd.json',
  },
} as const;

type TokenType = keyof typeof TOKEN_METADATA;

export class DapprClient {
  public program: Program<Dappr>;
  public provider: Provider;
  public escrow: EscrowClient;

  constructor(provider: Provider, programId: PublicKey = DAPPR_PROGRAM_ID) {
    this.provider = provider;
    this.program = new Program<Dappr>(IDL, programId, provider);
    this.escrow = new EscrowClient(this);
  }

  // Initialize the token mints
  async initializeTokens(): Promise<{
    dapprGovMint: PublicKey;
    dapprUsdMint: PublicKey;
  }> {
    // Derive the mint authority PDA
    const [mintAuthority] = await this.getMintAuthority();
    
    // Initialize the token mints
    const tx = await this.program.rpc.initializeTokens({
      accounts: {
        payer: this.provider.wallet.publicKey,
        dapprGovMint: DAPPR_GOV_MINT!,
        dapprUsdMint: DAPPR_USD_MINT!,
        mintAuthority,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: web3.SYSVAR_RENT_PUBKEY,
      },
    });

    return {
      dapprGovMint: DAPPR_GOV_MINT!,
      dapprUsdMint: DAPPR_USD_MINT!,
    };
  }

  // Mint tokens to a recipient
  async mintTokens(
    mint: PublicKey,
    recipient: PublicKey,
    amount: number,
  ): Promise<string> {
    const token = new Token(
      this.provider.connection,
      mint,
      TOKEN_PROGRAM_ID,
      this.provider.wallet.payer
    );

    // Get or create the associated token account
    const recipientTokenAccount = await token.getOrCreateAssociatedAccountInfo(recipient);

    // Mint tokens
    const tx = await this.program.rpc.mintTokens(
      new anchor.BN(amount),
      {
        accounts: {
          mint,
          tokenAccount: recipientTokenAccount.address,
          authority: this.provider.wallet.publicKey,
          recipient,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: web3.SystemProgram.programId,
        },
      }
    );

    return tx;
  }

  // Burn tokens from a user's account
  async burnTokens(
    mint: PublicKey,
    amount: number,
  ): Promise<string> {
    const token = new Token(
      this.provider.connection,
      mint,
      TOKEN_PROGRAM_ID,
      this.provider.wallet.payer
    );

    // Get the user's token account
    const userTokenAccount = await token.getOrCreateAssociatedAccountInfo(
      this.provider.wallet.publicKey
    );

    // Burn tokens
    const tx = await this.program.rpc.burnTokens(
      new anchor.BN(amount),
      {
        accounts: {
          mint,
          tokenAccount: userTokenAccount.address,
          authority: this.provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    );

    return tx;
  }

  // Helper to get the mint authority PDA
  private async getMintAuthority(): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('mint_authority')],
      this.program.programId
    );
  }

  // Helper to get token info
  getTokenInfo(tokenType: TokenType) {
    return TOKEN_METADATA[tokenType];
  }

  // Helper to get token mint address
  getTokenMint(tokenType: TokenType): PublicKey {
    const mint = tokenType === 'DAPPR_GOV' ? DAPPR_GOV_MINT : DAPPR_USD_MINT;
    if (!mint) {
      throw new Error(`Token ${tokenType} not initialized`);
    }
    return mint;
  }
}

// Export the IDL for client-side usage
export { IDL as DapprIdl };

export default DapprClient;
