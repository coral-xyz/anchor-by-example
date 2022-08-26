use anchor_lang::prelude::*;
use crate::states::applicant::Applicant;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateApplicantProfileArgs {
    pub name: String,
    pub email: String,
    pub resume_link: String,
    pub contact_via_email: bool,
    pub contact_via_wallet: bool,
}

#[derive(Accounts)]
#[instruction(args: CreateApplicantProfileArgs)]
pub struct CreateApplicantProfileContext<'info> {
    #[account(mut)]
    pub wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    #[account(
    init,
    seeds=[Applicant::PREFIX.as_bytes(), &wallet.key().to_bytes()],
    payer=wallet,
    space=Applicant::SIZE,
    bump
    )]
    pub applicant: Box<Account<'info, Applicant>>,
}

pub fn create_applicant_profile(
    ctx: Context<CreateApplicantProfileContext>,
    args: CreateApplicantProfileArgs,
) -> Result<()> {
    let wallet = &ctx.accounts.wallet;
    let applicant = &mut ctx.accounts.applicant;
    applicant.update(
        wallet.key(),
        *ctx.bumps.get("applicant").unwrap(),
        args.name,
        args.email,
        args.resume_link,
        args.contact_via_email,
        args.contact_via_wallet,
    );
    Ok(())
}
