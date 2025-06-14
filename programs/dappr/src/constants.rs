//! Constants used in the Dappr program

use solana_program::pubkey::Pubkey;
use std::str::FromStr;

// Program IDs
pub const DAPPR_PROGRAM_ID: &str = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";

// Token mint seeds
pub const MINT_SEED: &[u8] = b"mint_authority";

// Token metadata program ID
pub const TOKEN_METADATA_PROGRAM_ID: &str = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

// Derive the token metadata account address for a given mint
pub fn get_metadata_account(mint: &Pubkey) -> Pubkey {
    let metadata_program_id = Pubkey::from_str(TOKEN_METADATA_PROGRAM_ID).unwrap();
    let seeds = &[
        b"metadata".as_ref(),
        metadata_program_id.as_ref(),
        mint.as_ref(),
    ];
    let (pda, _bump) = Pubkey::find_program_address(seeds, &metadata_program_id);
    pda
}

// Derive the mint authority PDA
pub fn get_mint_authority(program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[MINT_SEED], program_id)
}

// Token configuration
pub mod tokens {
    use super::*;
    
    // Token decimals
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
}
