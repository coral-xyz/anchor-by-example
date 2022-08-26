use anchor_lang::prelude::*;
use crate::states::company::Company;
use crate::states::job_listing::JobListing;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateJobListingArgs {
    pub uuid: String,
    pub title: String,
    pub location: String,
    pub part_time: bool,
    pub full_time: bool,
    pub remote: bool,
    pub requirements: Vec<String>,
    pub description: String,
    pub link: String,
    pub yearly_pay_range_start: u32,
    pub yearly_pay_range_end: u32,
    pub hourly_pay_range_start: u32,
    pub hourly_pay_range_end: u32,
}

#[derive(Accounts)]
#[instruction(args: CreateJobListingArgs)]
pub struct CreateJobListingContext<'info> {
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
    #[account(
    init,
    seeds=[JobListing::PREFIX.as_bytes(), &args.uuid.as_bytes()],
    payer=admin,
    space=JobListing::SIZE,
    bump
    )]
    pub job_listing: Box<Account<'info, JobListing>>,
}

pub fn create_job_listing(
    ctx: Context<CreateJobListingContext>,
    args: CreateJobListingArgs,
) -> Result<()> {
    let job_listing = &mut ctx.accounts.job_listing;
    let company = &mut ctx.accounts.company;
    job_listing.update(
        *ctx.bumps.get("job_listing").unwrap(),
        company.key(),
        args.uuid,
        args.title,
        args.location,
        args.part_time,
        args.full_time,
        args.remote,
        args.requirements,
        args.description,
        args.link,
        args.yearly_pay_range_start,
        args.yearly_pay_range_end,
        args.hourly_pay_range_start,
        args.hourly_pay_range_end,
    );
    Ok(())
}
