use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

// Import modules
pub mod constants;
pub mod tokens;
pub mod escrow;

// Re-export for external use
pub use tokens::*;
pub use escrow::*;

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

    // Escrow instructions
    
    /// Initialize a new escrow
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        bump: u8,
        milestones_count: u8,
    ) -> Result<()> {
        escrow::InitializeEscrow::initialize(ctx, bump, milestones_count)
    }
    
    /// Add a milestone to an escrow
    pub fn add_milestone(
        ctx: Context<AddMilestone>,
        bump: u8,
        amount: u64,
        deadline: i64,
    ) -> Result<()> {
        escrow::AddMilestone::add_milestone(ctx, bump, amount, deadline)
    }
    
    /// Fund an escrow with tokens
    pub fn fund_escrow(
        ctx: Context<FundEscrow>,
        amount: u64,
    ) -> Result<()> {
        escrow::FundEscrow::fund(ctx, amount)
    }
    
    /// Mark a milestone as completed
    pub fn complete_milestone(
        ctx: Context<CompleteMilestone>,
    ) -> Result<()> {
        escrow::CompleteMilestone::complete(ctx)
    }
    
    /// Release funds for a completed milestone
    pub fn release_funds(
        ctx: Context<ReleaseFunds>,
    ) -> Result<()> {
        escrow::ReleaseFunds::release(ctx)
    }
    
    /// Initiate emergency withdrawal process
    pub fn initiate_emergency_withdrawal(
        ctx: Context<InitiateEmergencyWithdrawal>,
        bump: u8,
        signers: Vec<Pubkey>,
    ) -> Result<()> {
        escrow::InitiateEmergencyWithdrawal::initiate(ctx, bump, signers)
    }
    
    /// Sign an emergency withdrawal
    pub fn sign_emergency_withdrawal(
        ctx: Context<SignEmergencyWithdrawal>,
    ) -> Result<()> {
        escrow::SignEmergencyWithdrawal::sign(ctx)
    }
}

/// Accounts required by the initialize instruction
#[derive(Accounts)]
pub struct Initialize {}

// Re-export account structs for external use
pub use tokens::{
    InitializeTokens,
    MintTokens,
    BurnTokens,
};

pub use escrow::{
    Escrow,
    Milestone,
    Multisig,
    InitializeEscrow,
    AddMilestone,
    FundEscrow,
    CompleteMilestone,
    ReleaseFunds,
    InitiateEmergencyWithdrawal,
    SignEmergencyWithdrawal,
    EscrowError,
};
