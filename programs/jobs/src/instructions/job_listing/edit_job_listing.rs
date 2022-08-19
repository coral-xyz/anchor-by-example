use anchor_lang::prelude::*;
use crate::states::company::Company;
use crate::states::job_listing::JobListing;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct EditJobListingArgs {
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
#[instruction(args: EditJobListingArgs)]
pub struct EditJobListingContext<'info> {
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
    mut,
    seeds=[JobListing::PREFIX.as_bytes(), &job_listing.uuid.as_bytes()],
    bump=job_listing.bump
    )]
    pub job_listing: Box<Account<'info, JobListing>>,
}

pub fn edit_job_listing(
    ctx: Context<EditJobListingContext>,
    args: EditJobListingArgs,
) -> Result<()> {
    let job_listing = &mut ctx.accounts.job_listing;
    let company = &mut ctx.accounts.company;
    let uuid = job_listing.uuid.clone();
    let bump = job_listing.bump;
    job_listing.update(
        bump,
        company.key(),
        uuid,
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
