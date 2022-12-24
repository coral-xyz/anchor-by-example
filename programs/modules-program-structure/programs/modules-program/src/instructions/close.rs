use anchor_lang::prelude::*;

use crate::{
    state::my_account::{MyAccount},
    constants::{MY_ACCOUNT_SEED_PREFIX},
    // Let's import MyError enum of error codes declared in '../errors.rs'
    errors::{MyError}
};

#[derive(Accounts)]
pub struct CloseMyAccount<'info> {
    #[account(
        mut,
        seeds = [
            &MY_ACCOUNT_SEED_PREFIX[..],
            my_account.authority.as_ref()
        ],
        bump = my_account.bump,
        close = signer
    )]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn close_my_account(ctx: Context<CloseMyAccount>) -> Result<()> {

    let expected_authority_key = ctx.accounts.my_account.authority;
    let signer_key = ctx.accounts.signer.key();

    // If our MyAccount authority key doesn't match signer's key, let's throw an error!
    if expected_authority_key != signer_key {
        return err!(MyError::AuthorityMismatch);
    }

    Ok(())
}