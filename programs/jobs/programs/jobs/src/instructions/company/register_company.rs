use anchor_lang::prelude::*;
use crate::states::company::Company;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct RegisterCompanyArgs {
    pub uuid: String,
    pub name: String,
    pub description: String,
    pub logo_url: String,
    pub company_url: String,
    pub email: String,
    pub number_of_employees: u32,
}

#[derive(Accounts)]
#[instruction(args: RegisterCompanyArgs)]
pub struct RegisterCompanyContext<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    #[account(
    init,
    seeds=[Company::PREFIX.as_bytes(), &args.uuid.as_bytes()],
    payer=admin,
    space=Company::SIZE,
    bump
    )]
    pub company: Box<Account<'info, Company>>,
}

pub fn register_company(
    ctx: Context<RegisterCompanyContext>,
    args: RegisterCompanyArgs,
) -> Result<()> {
    let admin = &ctx.accounts.admin;
    let company = &mut ctx.accounts.company;
    company.update(
        admin.key(),
        *ctx.bumps.get("company").unwrap(),
        args.uuid,
        args.name,
        args.description,
        args.logo_url,
        args.company_url,
        args.email,
        args.number_of_employees,
    );
    Ok(())
}
