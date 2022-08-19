use anchor_lang::AccountsClose;
use anchor_lang::prelude::*;
use crate::states::company::Company;
use crate::error_codes::errors::Errors;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RemoveCompanyArgs {
    pub are_you_sure: bool
}

#[derive(Accounts)]
#[instruction(args: RemoveCompanyArgs)]
pub struct RemoveCompanyContext<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    #[account(
    mut,
    seeds=[Company::PREFIX.as_bytes(), &company.uuid.as_bytes()],
    has_one=admin,
    bump=company.bump
    )]
    pub company: Box<Account<'info, Company>>,
}

pub fn remove_company(
    ctx: Context<RemoveCompanyContext>,
    args: RemoveCompanyArgs,
) -> Result<()> {
    let admin = &ctx.accounts.admin;
    let company = &mut ctx.accounts.company;
    if !args.are_you_sure {
        return Err(Errors::UnsureError.into());
    }
    company.close(admin.to_account_info())?;
    Ok(())
}
