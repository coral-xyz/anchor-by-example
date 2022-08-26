use anchor_lang::AccountsClose;
use anchor_lang::prelude::*;
use crate::error_codes::errors::Errors;
use crate::states::job_listing::JobListing;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CloseJobListingArgs {
    pub are_you_sure: bool
}

#[derive(Accounts)]
#[instruction(args: CloseJobListingArgs)]
pub struct CloseJobListingContext<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    #[account(
    mut,
    seeds=[JobListing::PREFIX.as_bytes(), &job_listing.uuid.as_bytes()],
    bump=job_listing.bump
    )]
    pub job_listing: Box<Account<'info, JobListing>>,
}

pub fn close_job_listing(
    ctx: Context<CloseJobListingContext>,
    args: CloseJobListingArgs,
) -> Result<()> {
    let admin = &mut ctx.accounts.admin;
    let job_listing = &mut ctx.accounts.job_listing;
    if !args.are_you_sure {
        return Err(Errors::UnsureError.into());
    }
    job_listing.close(admin.to_account_info())?;
    Ok(())
}
