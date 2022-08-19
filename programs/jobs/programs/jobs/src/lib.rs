mod states;
mod error_codes;
mod instructions;
mod utils;

use instructions::*;
use anchor_lang::prelude::*;

declare_id!("FoBEskU4Q36cqo9PUAG1eeFB41YNrpbQ3dSHYtNgvLJ");

#[program]
pub mod jobs {
    use super::*;

    pub fn register_company(
        ctx: Context<RegisterCompanyContext>,
        args: RegisterCompanyArgs,
    ) -> Result<()> {
        register_company::register_company(ctx, args)
    }

    pub fn remove_company(
        ctx: Context<RemoveCompanyContext>,
        args: RemoveCompanyArgs,
    ) -> Result<()> {
        remove_company::remove_company(ctx, args)
    }

    pub fn create_applicant_profile(
        ctx: Context<CreateApplicantProfileContext>,
        args: CreateApplicantProfileArgs,
    ) -> Result<()> {
        create_applicant_profile::create_applicant_profile(ctx, args)
    }

    pub fn remove_application_to_job_listing(
        ctx: Context<RemoveApplicantProfileContext>,
        args: RemoveApplicantProfileArgs,
    ) -> Result<()> {
        remove_application_to_job_listing::remove_application_to_job_listing(ctx, args)
    }

    pub fn create_job_listing(
        ctx: Context<CreateJobListingContext>,
        args: CreateJobListingArgs,
    ) -> Result<()> {
        create_job_listing::create_job_listing(ctx, args)
    }


    pub fn close_job_listing(
        ctx: Context<CloseJobListingContext>,
        args: CloseJobListingArgs,
    ) -> Result<()> {
        close_job_listing::close_job_listing(ctx, args)
    }

    pub fn edit_job_listing(
        ctx: Context<EditJobListingContext>,
        args: EditJobListingArgs,
    ) -> Result<()> {
        edit_job_listing::edit_job_listing(ctx, args)
    }

    pub fn apply_to_job_listing(
        ctx: Context<ApplyToJobListingContext>,
        args: ApplyToJobListingArgs,
    ) -> Result<()> {
        apply_to_job_listing::apply_to_job_listing(ctx, args)
    }
}
