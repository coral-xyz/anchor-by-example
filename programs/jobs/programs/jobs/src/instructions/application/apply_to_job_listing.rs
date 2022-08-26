use anchor_lang::prelude::*;
use crate::error_codes::errors::Errors;
use crate::states::applicant::Applicant;
use crate::states::application::{Application, ApplicationStatus};
use crate::states::job_listing::JobListing;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ApplyToJobListingArgs {
    pub are_you_sure: bool
}

#[derive(Accounts)]
#[instruction(args: ApplyToJobListingArgs)]
pub struct ApplyToJobListingContext<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    #[account(
    seeds=[Applicant::PREFIX.as_bytes(), &applicant.wallet.to_bytes()],
    has_one=wallet,
    bump=applicant.bump
    )]
    pub applicant: Box<Account<'info, Applicant>>,
    #[account(
    seeds=[JobListing::PREFIX.as_bytes(), &job_listing.uuid.as_bytes()],
    bump=job_listing.bump
    )]
    pub job_listing: Box<Account<'info, JobListing>>,
    #[account(
    init,
    seeds=[Application::PREFIX.as_bytes(), &applicant.key().to_bytes(), &job_listing.key().to_bytes()],
    space=Application::SIZE,
    payer=wallet,
    bump
    )]
    pub application: Box<Account<'info, Application>>,
}

pub fn apply_to_job_listing(
    ctx: Context<ApplyToJobListingContext>,
    args: ApplyToJobListingArgs,
) -> Result<()> {
    let wallet = &ctx.accounts.wallet;
    let applicant = &ctx.accounts.applicant;
    let job_listing = &ctx.accounts.job_listing;
    let application = &mut ctx.accounts.application;

    if !args.are_you_sure {
        return Err(Errors::UnsureError.into());
    }

    application.update(wallet.key(),
                     applicant.key(),
                     job_listing.key(),
                     ApplicationStatus::Pending,
                     *ctx.bumps.get("application").unwrap()
    );
    Ok(())
}
