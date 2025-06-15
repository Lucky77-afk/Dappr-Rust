use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::constants::*;
use std::convert::TryInto;

// Constants
pub const ESCROW_PDA_SEED: &[u8] = b"escrow";
pub const MILESTONE_PDA_SEED: &[u8] = b"milestone";
pub const MULTISIG_THRESHOLD: u8 = 2; // 2 out of 3 multisig for emergency withdrawal

// Account to store escrow state
#[account]
pub struct Escrow {
    pub creator: Pubkey,           // Creator of the escrow
    pub recipient: Pubkey,          // Recipient of the funds
    pub token_mint: Pubkey,         // Token mint (DAPPR_USD)
    pub total_amount: u64,         // Total amount in the escrow
    pub released_amount: u64,       // Amount already released
    pub milestones_count: u8,       // Total number of milestones
    pub current_milestone: u8,      // Current milestone index (0-based)
    pub is_active: bool,           // Whether the escrow is active
    pub created_at: i64,            // Timestamp when escrow was created
    pub bump: u8,                   // Bump seed for the escrow PDA
}

// Account to store milestone state
#[account]
pub struct Milestone {
    pub escrow: Pubkey,             // Associated escrow account
    pub index: u8,                  // Milestone index (0-based)
    pub amount: u64,                // Amount allocated to this milestone
    pub deadline: i64,              // Unix timestamp for milestone deadline
    pub completed: bool,            // Whether the milestone is completed
    pub verified: bool,             // Whether the milestone is verified
    pub verified_at: Option<i64>,   // When the milestone was verified
    pub verified_by: Option<Pubkey>, // Who verified the milestone
    pub bump: u8,                   // Bump seed for the milestone PDA
}

// Multisig account for emergency withdrawals
#[account]
pub struct Multisig {
    pub escrow: Pubkey,             // Associated escrow account
    pub signers: Vec<Pubkey>,        // List of signers (3 total)
    pub threshold: u8,              // Required signatures (2)
    pub signed_by: Vec<Pubkey>,     // Who has signed so far
    pub executed: bool,             // Whether the withdrawal was executed
    pub bump: u8,                   // Bump seed for the multisig PDA
}

// Events
#[event]
pub struct EscrowCreated {
    pub escrow: Pubkey,
    pub creator: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
}

#[event]
pub struct MilestoneCompleted {
    pub escrow: Pubkey,
    pub milestone: Pubkey,
    pub milestone_index: u8,
    pub amount: u64,
}

#[event]
pub struct FundsReleased {
    pub escrow: Pubkey,
    pub milestone: Pubkey,
    pub amount: u64,
    pub recipient: Pubkey,
}

#[event]
pub struct EmergencyWithdrawalRequested {
    pub escrow: Pubkey,
    pub requester: Pubkey,
    pub amount: u64,
}

// Error codes
#[error_code]
pub enum EscrowError {
    #[msg("Invalid milestone index")]
    InvalidMilestoneIndex,
    #[msg("Milestone not completed")]
    MilestoneNotCompleted,
    #[msg("Milestone already completed")]
    MilestoneAlreadyCompleted,
    #[msg("Deadline not reached")]
    DeadlineNotReached,
    #[msg("Invalid signer")]
    InvalidSigner,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Escrow not active")]
    EscrowNotActive,
    #[msg("Invalid milestone state")]
    InvalidMilestoneState,
    #[msg("Invalid multisig threshold")]
    InvalidMultisigThreshold,
    #[msg("Already signed")]
    AlreadySigned,
    #[msg("Not enough signatures")]
    NotEnoughSignatures,
    #[msg("Already executed")]
    AlreadyExecuted,
}

// Contexts
#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    /// CHECK: The recipient of the funds
    pub recipient: UncheckedAccount<'info>,
    pub token_mint: Account<'info, token::Mint>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 8 + 1,
        seeds = [ESCROW_PDA_SEED, creator.key.as_ref(), recipient.key.as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        init,
        payer = creator,
        token::mint = token_mint,
        token::authority = escrow,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(milestone_index: u8)]
pub struct AddMilestone<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        mut,
        has_one = creator,
    )]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 1 + 8 + 8 + 1 + 1 + 1 + 32 + 1,
        seeds = [MILESTONE_PDA_SEED, escrow.key().as_ref(), &[milestone_index]],
        bump
    )]
    pub milestone: Account<'info, Milestone>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct FundEscrow<'info> {
    #[account(mut)]
    pub funder: Signer<'info>,
    
    #[account(
        mut,
        has_one = token_mint,
    )]
    pub escrow: Account<'info, Escrow>,
    
    pub token_mint: Account<'info, token::Mint>,
    
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = funder,
    )]
    pub funder_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = escrow,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteMilestone<'info> {
    pub verifier: Signer<'info>,
    
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        has_one = escrow,
    )]
    pub milestone: Account<'info, Milestone>,
    
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(mut)]
    pub releaser: Signer<'info>,
    
    #[account(
        mut,
        has_one = recipient,
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// CHECK: The recipient of the funds
    pub recipient: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub milestone: Account<'info, Milestone>,
    
    pub token_mint: Account<'info, token::Mint>,
    
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = escrow,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = recipient,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct InitiateEmergencyWithdrawal<'info> {
    pub requester: Signer<'info>,
    
    #[account(
        mut,
        has_one = creator,
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// CHECK: The creator of the escrow
    pub creator: UncheckedAccount<'info>,
    
    #[account(
        init_if_needed,
        payer = requester,
        space = 8 + 32 + 1 + 1 + 1 + (4 + 3 * 32) + (4 + 3 * 32) + 1 + 1,
        seeds = [b"multisig", escrow.key().as_ref()],
        bump
    )]
    pub multisig: Account<'info, Multisig>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SignEmergencyWithdrawal<'info> {
    pub signer: Signer<'info>,
    
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    #[account(
        mut,
        has_one = escrow,
    )]
    pub multisig: Account<'info, Multisig>,
}

// Implementation of the escrow program
impl<'info> InitializeEscrow<'info> {
    pub fn initialize(
        &mut self,
        bump: u8,
        milestones_count: u8,
    ) -> Result<()> {
        require!(milestones_count > 0, EscrowError::InvalidMilestoneIndex);
        
        let clock = Clock::get()?;
        
        self.escrow.creator = self.creator.key();
        self.escrow.recipient = self.recipient.key();
        self.escrow.token_mint = self.token_mint.key();
        self.escrow.total_amount = 0;
        self.escrow.released_amount = 0;
        self.escrow.milestones_count = milestones_count;
        self.escrow.current_milestone = 0;
        self.escrow.is_active = true;
        self.escrow.created_at = clock.unix_timestamp;
        self.escrow.bump = bump;
        
        emit!(EscrowCreated {
            escrow: self.escrow.key(),
            creator: self.creator.key(),
            recipient: self.recipient.key(),
            amount: 0,
        });
        
        Ok(())
    }
}

impl<'info> AddMilestone<'info> {
    pub fn add_milestone(
        &mut self,
        bump: u8,
        amount: u64,
        deadline: i64,
    ) -> Result<()> {
        require!(self.escrow.is_active, EscrowError::EscrowNotActive);
        require!(
            self.milestone.index < self.escrow.milestones_count,
            EscrowError::InvalidMilestoneIndex
        );
        
        self.milestone.escrow = self.escrow.key();
        self.milestone.index = self.escrow.current_milestone;
        self.milestone.amount = amount;
        self.milestone.deadline = deadline;
        self.milestone.completed = false;
        self.milestone.verified = false;
        self.milestone.verified_at = None;
        self.milestone.verified_by = None;
        self.milestone.bump = bump;
        
        self.escrow.total_amount = self.escrow.total_amount.checked_add(amount)
            .ok_or(EscrowError::InvalidMilestoneState)?;
            
        Ok(())
    }
}

impl<'info> FundEscrow<'info> {
    pub fn fund(&mut self, amount: u64) -> Result<()> {
        require!(self.escrow.is_active, EscrowError::EscrowNotActive);
        
        // Transfer tokens from funder to escrow
        let cpi_accounts = Transfer {
            from: self.funder_token_account.to_account_info(),
            to: self.escrow_token_account.to_account_info(),
            authority: self.funder.to_account_info(),
        };
        
        let cpi_program = self.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        self.escrow.total_amount = self.escrow.total_amount.checked_add(amount)
            .ok_or(EscrowError::InsufficientFunds)?;
            
        Ok(())
    }
}

impl<'info> CompleteMilestone<'info> {
    pub fn complete(&mut self) -> Result<()> {
        require!(self.escrow.is_active, EscrowError::EscrowNotActive);
        require!(
            self.milestone.index == self.escrow.current_milestone,
            EscrowError::InvalidMilestoneIndex
        );
        require!(!self.milestone.completed, EscrowError::MilestoneAlreadyCompleted);
        
        let clock = Clock::get()?;
        
        // Mark milestone as completed
        self.milestone.completed = true;
        self.milestone.verified = true;
        self.milestone.verified_at = Some(clock.unix_timestamp);
        self.milestone.verified_by = Some(self.verifier.key());
        
        emit!(MilestoneCompleted {
            escrow: self.escrow.key(),
            milestone: self.milestone.key(),
            milestone_index: self.milestone.index,
            amount: self.milestone.amount,
        });
        
        Ok(())
    }
}

impl<'info> ReleaseFunds<'info> {
    pub fn release(&mut self) -> Result<()> {
        require!(self.escrow.is_active, EscrowError::EscrowNotActive);
        require!(
            self.milestone.index == self.escrow.current_milestone,
            EscrowError::InvalidMilestoneIndex
        );
        require!(self.milestone.completed, EscrowError::MilestoneNotCompleted);
        require!(self.milestone.verified, EscrowError::MilestoneNotCompleted);
        
        let clock = Clock::get()?;
        
        // Verify deadline has passed if milestone is not verified
        if !self.milestone.verified {
            require!(
                clock.unix_timestamp >= self.milestone.deadline,
                EscrowError::DeadlineNotReached
            );
        }
        
        // Transfer tokens from escrow to recipient
        let transfer_amount = self.milestone.amount;
        
        // Verify escrow has sufficient balance
        require!(
            self.escrow_token_account.amount >= transfer_amount,
            EscrowError::InsufficientFunds
        );
        
        // Perform the transfer
        let seeds = &[
            ESCROW_PDA_SEED,
            self.escrow.creator.as_ref(),
            self.escrow.recipient.as_ref(),
            &[self.escrow.bump],
        ];
        
        let signer = &[&seeds[..]];
        
        let cpi_accounts = Transfer {
            from: self.escrow_token_account.to_account_info(),
            to: self.recipient_token_account.to_account_info(),
            authority: self.escrow.to_account_info(),
        };
        
        let cpi_program = self.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, transfer_amount)?;
        
        // Update escrow state
        self.escrow.released_amount = self.escrow.released_amount
            .checked_add(transfer_amount)
            .ok_or(EscrowError::InvalidMilestoneState)?;
            
        self.escrow.current_milestone = self.escrow.current_milestone
            .checked_add(1)
            .ok_or(EscrowError::InvalidMilestoneState)?;
            
        // Check if all milestones are completed
        if self.escrow.current_milestone >= self.escrow.milestones_count {
            self.escrow.is_active = false;
        }
        
        emit!(FundsReleased {
            escrow: self.escrow.key(),
            milestone: self.milestone.key(),
            amount: transfer_amount,
            recipient: self.recipient.key(),
        });
        
        Ok(())
    }
}

impl<'info> InitiateEmergencyWithdrawal<'info> {
    pub fn initiate(&mut self, bump: u8, signers: Vec<Pubkey>) -> Result<()> {
        require!(self.escrow.is_active, EscrowError::EscrowNotActive);
        require!(
            signers.len() == 3 && signers.contains(&self.requester.key()),
            EscrowError::InvalidSigner
        );
        
        self.multisig.escrow = self.escrow.key();
        self.multisig.signers = signers;
        self.multisig.threshold = MULTISIG_THRESHOLD;
        self.multisig.signed_by = vec![self.requester.key()];
        self.multisig.executed = false;
        self.multisig.bump = bump;
        
        emit!(EmergencyWithdrawalRequested {
            escrow: self.escrow.key(),
            requester: self.requester.key(),
            amount: self.escrow.total_amount - self.escrow.released_amount,
        });
        
        Ok(())
    }
}

impl<'info> SignEmergencyWithdrawal<'info> {
    pub fn sign(&mut self) -> Result<()> {
        require!(!self.multisig.executed, EscrowError::AlreadyExecuted);
        require!(
            self.multisig.signers.contains(&self.signer.key()),
            EscrowError::InvalidSigner
        );
        require!(
            !self.multisig.signed_by.contains(&self.signer.key()),
            EscrowError::AlreadySigned
        );
        
        self.multisig.signed_by.push(self.signer.key());
        
        // Check if we have enough signatures
        if (self.multisig.signed_by.len() as u8) >= self.multisig.threshold {
            self.multisig.executed = true;
            self.escrow.is_active = false;
            // In a real implementation, you would transfer remaining funds back to creator
            // This is simplified for the example
        }
        
        Ok(())
    }
}
