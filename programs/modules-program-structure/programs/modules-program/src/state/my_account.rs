use anchor_lang::prelude::*;

// We introduce MyAccount struct

#[account]
#[derive(Default, Debug)]
pub struct MyAccount {
    pub authority: Pubkey,
    pub bump: u8,
    pub value: u8
}

// To initialize MyAccount, we want user to provide some "value". Let's introduce the data struct of our initialize instruction here

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug)]
pub struct InitializeMyAccountData {
    pub value: u8
}

// Additionally, we could keep byte space which is required by single MyAccount here

impl MyAccount {
    pub const SPACE: usize = {
        // anchor account discriminator 
        8 +
        // pubkey 
        32 + 
        // bump
        1 +
        // some value
        1
    };
}