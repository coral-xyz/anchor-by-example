use anchor_lang::prelude::*;

// We would like to have 'initialize' instruction for initializing MyAccount (which is declared in '../state/my_account.rs')

// Let's use some stuff from other modules of our program. We will need them here!
use crate::{
    state::my_account::{MyAccount, InitializeMyAccountData},
    constants::{MY_ACCOUNT_SEED_PREFIX},
};

// Let's declare the context for our instruction!

#[derive(Accounts)]
pub struct InitializeMyAccount<'info> {
    #[account(
        init,
        seeds = [
            // seed prefix is declared in '../constrants.rs'
            &MY_ACCOUNT_SEED_PREFIX[..],
            signer.key().as_ref()
        ],
        bump,
        // account space is declared in '../state/my_account.rs'
        space = MyAccount::SPACE,
        payer = signer,
    )]
    // MyAccount is declared in ../state/my_account.rs
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}

// Now let's declare our instruction logic!
// We may name our instruction handler functiojn however we want!
// Our instruction function takes two arguments - context, declared above, and data, declared in '../state/my_account.rs'

pub fn you_may_have_any_function_name(ctx: Context<InitializeMyAccount>, data: InitializeMyAccountData) -> Result<()> {

    let my_account = &mut ctx.accounts.my_account;

    // Let's assign some data to our account!
    my_account.authority = ctx.accounts.signer.key();
    my_account.bump = *ctx.bumps.get("my_account").unwrap();
    my_account.value = data.value;

    Ok(())
}