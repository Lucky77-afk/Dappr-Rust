use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod dappr {
    use super::*;

    /// Initializes the program
    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Dappr program initialized");
        Ok(())
    }
}

/// Accounts required by the initialize instruction
#[derive(Accounts)]
pub struct Initialize {}

// Add more instructions and accounts as needed
