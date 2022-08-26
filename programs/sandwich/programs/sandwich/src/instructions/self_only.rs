use anchor_lang::prelude::*;
use anchor_lang::solana_program::serialize_utils::read_u16;
use anchor_lang::solana_program::sysvar;
use anchor_lang::solana_program::sysvar::instructions::get_instruction_relative;
use anchor_lang::solana_program::sysvar::instructions::load_current_index_checked;
// use anchor_lang::solana_program::sysvar::instructions::load_instruction_at_checked;
// use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::Token;
use crate::error_codes::errors::Errors;
// use solana_program::{
//     clock::Clock,
//     program::{invoke, invoke_signed},
//     serialize_utils::{read_pubkey, read_u16},
//     system_instruction, sysvar,
//     sysvar::{instructions::get_instruction_relative, SysvarId},
// };

#[derive(Accounts)]
pub struct SelfOnlyContext<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: Checking address
    #[account(address = sysvar::instructions::id())]
    instruction_sysvar_account: AccountInfo<'info>,
}

pub fn self_only(
    ctx: Context<SelfOnlyContext>,
) -> Result<()> {
    let instruction_sysvar_account = &ctx.accounts.instruction_sysvar_account;
    let data = instruction_sysvar_account.try_borrow_data()?;
    let current_index = load_current_index_checked(&instruction_sysvar_account)?;
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
    require!(current_index == 0, Errors::ExpectedInstructionToBeZero);
    require!(num_instructions == 1, Errors::ExpectedOnlyOneInstruction);
    let current_ix = get_instruction_relative(0, &instruction_sysvar_account)?;
    msg!("Program ID {}", current_ix.program_id);
    msg!("All good");
    Ok(())
}