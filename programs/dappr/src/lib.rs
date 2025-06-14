use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

// Import modules
pub mod constants;
pub mod tokens;

// Re-export for external use
pub use tokens::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod dappr {
    use super::*;
    use crate::constants;

    /// Initializes the Dappr program
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Dappr program initialized");
        Ok(())
    }

    /// Initialize both DAPPR_GOV and DAPPR_USD tokens
    pub fn initialize_tokens(
        ctx: Context<InitializeTokens>,
    ) -> Result<()> {
        tokens::initialize_tokens(ctx)
    }

    /// Mint tokens to a recipient
    pub fn mint_tokens(
        ctx: Context<MintTokens>,
        amount: u64,
    ) -> Result<()> {
        tokens::mint_tokens(ctx, amount)
    }

    /// Burn tokens from a user's account
    pub fn burn_tokens(
        ctx: Context<BurnTokens>,
        amount: u64,
    ) -> Result<()> {
        tokens::burn_tokens(ctx, amount)
    }
}

/// Accounts required by the initialize instruction
#[derive(Accounts)]
pub struct Initialize {}

// Re-export token-related account structs for external use
pub use tokens::{
    InitializeTokens,
    MintTokens,
    BurnTokens,
};
