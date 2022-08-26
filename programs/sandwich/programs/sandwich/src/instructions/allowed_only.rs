use anchor_lang::prelude::*;
use anchor_lang::solana_program::serialize_utils::read_u16;
use anchor_lang::solana_program::sysvar;
use anchor_lang::solana_program::sysvar::instructions::load_current_index_checked;
use anchor_lang::solana_program::sysvar::instructions::load_instruction_at_checked;
// use anchor_lang::solana_program::sysvar::instructions::load_current_index_checked;
// use anchor_lang::solana_program::sysvar::instructions::load_instruction_at_checked;
// use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::Token;
use crate::error_codes::errors::Errors;
use crate::state::allowed::Allowed;
// use solana_program::{
//     clock::Clock,
//     program::{invoke, invoke_signed},
//     serialize_utils::{read_pubkey, read_u16},
//     system_instruction, sysvar,
//     sysvar::{instructions::get_instruction_relative, SysvarId},
// };

#[derive(Accounts)]
pub struct AllowedOnlyContext<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: Checking address
    #[account(address = sysvar::instructions::id())]
    instruction_sysvar_account: AccountInfo<'info>,
    #[account(
    seeds=[Allowed::PREFIX.as_bytes()],
    bump=allowed.bump
    )]
    pub allowed: Account<'info, Allowed>,
}

pub fn allowed_only(
    ctx: Context<AllowedOnlyContext>,
) -> Result<()> {
    let allowed = &ctx.accounts.allowed;
    let instruction_sysvar_account = &ctx.accounts.instruction_sysvar_account;
    let data = instruction_sysvar_account.try_borrow_data()?;
    let current_index = load_current_index_checked(instruction_sysvar_account.to_account_info().as_ref())?;
    msg!("Current index {}", current_index);

    let mut current = 0;
    let num_instructions;
    match read_u16(&mut current, &**data) {
        Ok(index) => {
            num_instructions = index;
        }
        Err(_) => {
            return Err(Errors::UnexpectedProgramInstruction.into());
        }
    }
    msg!("Num instructions {}", num_instructions);
    for index in 0..num_instructions {
        msg!("index {}", index);
        let instruction = load_instruction_at_checked(index as usize, &instruction_sysvar_account)?;
        msg!("Program ID {}", instruction.program_id);
        for account in instruction.accounts {
            msg!("Account {}", account.pubkey);
        }
        if !allowed.allowed.contains(&instruction.program_id) {
            return Err(Errors::ProgramNotAllowed.into());
        }
    }

    Ok(())
}