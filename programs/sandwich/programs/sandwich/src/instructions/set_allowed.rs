use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use crate::state::allowed::Allowed;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SetAllowedArgs {
    pub allowed: Vec<Pubkey>,
}

#[derive(Accounts)]
#[instruction(args: SetAllowedArgs)]
pub struct SetAllowedContext<'info> {
    #[account(
    init,
    seeds=[Allowed::PREFIX.as_bytes()],
    space=Allowed::SIZE,
    payer=user,
    bump
    )]
    pub allowed: Account<'info, Allowed>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn set_allowed(
    ctx: Context<SetAllowedContext>,
    args: SetAllowedArgs,
) -> Result<()> {
    let allowed = &mut ctx.accounts.allowed;
    allowed.init(*ctx.bumps.get("allowed").unwrap(), args.allowed);
    Ok(())
}