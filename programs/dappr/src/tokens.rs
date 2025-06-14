use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
        self, Burn, CloseAccount, InitializeMint, Mint, MintTo, Token, TokenAccount, Transfer,
    },
};
use mpl_token_metadata::{
    instruction::{create_metadata_accounts_v2, update_metadata_accounts_v2},
    state::{
        DataV2, Creator, Metadata, TokenMetadataAccount, TokenStandard,
    },
};

use crate::constants::*;

// Token configuration
pub const DAPPR_GOV_DECIMALS: u8 = 9;
pub const DAPPR_USD_DECIMALS: u8 = 6;

// Initial supply for testing
pub const INITIAL_GOV_SUPPLY: u64 = 10_000_000_000; // 10B tokens with 9 decimals
pub const INITIAL_USD_SUPPLY: u64 = 1_000_000_000; // 1B tokens with 6 decimals

// Token metadata
pub const DAPPR_GOV_NAME: &str = "DAPPR Governance Token";
pub const DAPPR_GOV_SYMBOL: &str = "DAPPR_GOV";
pub const DAPPR_GOV_URI: &str = "https://dappr-token-metadata.s3.amazonaws.com/dappr_gov.json";

pub const DAPPR_USD_NAME: &str = "DAPPR USD";
pub const DAPPR_USD_SYMBOL: &str = "DAPPR_USD";
pub const DAPPR_USD_URI: &str = "https://dappr-token-metadata.s3.amazonaws.com/dappr_usd.json";

// Token PDA seeds
pub const MINT_SEED: &[u8] = b"mint";

#[derive(Accounts)]
pub struct InitializeTokens<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    // Token mints
    #[account(
        init,
        payer = payer,
        mint::decimals = DAPPR_GOV_DECIMALS,
        mint::authority = mint_authority.key(),
    )]
    pub dappr_gov_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = payer,
        mint::decimals = DAPPR_USD_DECIMALS,
        mint::authority = mint_authority.key(),
    )]
    pub dappr_usd_mint: Account<'info, Mint>,
    
    // Mint authority (PDA that will control the mints)
    /// CHECK: This is safe because it's a derived PDA
    #[account(
        seeds = [MINT_SEED],
        bump,
    )]
    pub mint_authority: UncheckedAccount<'info>,
    
    // System program
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = recipient,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    /// CHECK: The recipient of the minted tokens
    pub recipient: UncheckedAccount<'info>,
    
    // Programs
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = authority,
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    // Programs
    pub token_program: Program<'info, Token>,
}

// Token implementation
pub fn initialize_tokens(ctx: Context<InitializeTokens>) -> Result<()> {
    // The mints are initialized by the Anchor constraints
    // We'll set up metadata in a separate instruction
    msg!("Initialized DAPPR_GOV and DAPPR_USD mints");
    Ok(())
}

pub fn mint_tokens(
    ctx: Context<MintTokens>,
    amount: u64,
) -> Result<()> {
    // In a real implementation, you'd add access control here
    // For example, check if the authority has minting privileges
    
    // Mint tokens to the recipient's account
    token::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount,
    )?;
    
    msg!("Minted {} tokens to recipient", amount);
    Ok(())
}

pub fn burn_tokens(
    ctx: Context<BurnTokens>,
    amount: u64,
) -> Result<()> {
    // Burn tokens from the authority's account
    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount,
    )?;
    
    msg!("Burned {} tokens", amount);
    Ok(())
}

// Helper function to create metadata for a token
pub fn create_token_metadata(
    mint: &Pubkey,
    mint_authority: &Pubkey,
    name: &str,
    symbol: &str,
    uri: &str,
    token_program: &Pubkey,
) -> Result<()> {
    // This would be called in a separate instruction with the proper accounts
    // For now, it's a placeholder showing how metadata would be created
    msg!("Creating metadata for token: {} ({})", name, symbol);
    msg!("URI: {}", uri);
    
    // In a real implementation, you would use the Metaplex token metadata program
    // to create and update the metadata account
    
    Ok(())
}
