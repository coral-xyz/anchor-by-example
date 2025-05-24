// use this import to gain access to common anchor features
use anchor_lang::prelude::*;
// Declare an address for your program a.k.a smart contract
declare_id!("AorK8YHC6QQSqm4wUJauqCfMWMvm8iepTmjmwH9bYQtk");

// write your business logic here
#[program]
pub mod hello_world {
    use super::*;
    pub fn hello_world(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello world, from solana smart contract");
        Ok(())
    }
}

// validate incoming accounts here
#[derive(Accounts)]
pub struct Initialize {}
