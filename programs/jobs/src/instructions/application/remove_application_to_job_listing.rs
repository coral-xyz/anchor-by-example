use anchor_lang::prelude::*;
use crate::error_codes::errors::Errors;
use crate::states::applicant::Applicant;
use crate::states::application::{Application, ApplicationStatus};
use crate::states::job_listing::JobListing;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RemoveApplicantProfileArgs {
    pub are_you_sure: bool
}

#[derive(Accounts)]
#[instruction(args: RemoveApplicantProfileArgs)]
pub struct RemoveApplicantProfileContext<'info> {
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
    mut,
    seeds=[Application::PREFIX.as_bytes(), &applicant.key().to_bytes(), &job_listing.key().to_bytes()],
    bump=application.bump
    )]
    pub application: Box<Account<'info, Application>>,
}

pub fn remove_application_to_job_listing(
    ctx: Context<RemoveApplicantProfileContext>,
    args: RemoveApplicantProfileArgs,
) -> Result<()> {
    let application = &mut ctx.accounts.application;
    if !args.are_you_sure {
        return Err(Errors::UnsureError.into());
    }

    application.status = ApplicationStatus::Rejected;
    Ok(())
}
