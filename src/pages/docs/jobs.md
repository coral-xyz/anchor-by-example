---
title: Job Board - Convention over Configuration
description: Anchor - Job Board - Convention over Configuration
---
> [Program Code](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/jobs)

## Directory Structure

*  [Error Codes](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/jobs/src/error_codes)
   * All errors in this module 
*  [States](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/jobs/src/states)
   * All states (PDAs) , each file contain one PDA
*  [Utils](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/jobs/src/utils)
   * Utility functions
*  [Instructions](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/jobs/src/instructions)
   * A directory of instructions for each state (PDAs) with the related `instructions`

## PDA

Store `bump` on the `PDA` to avoid passing it around.
```rust
#[account]
#[derive(Default, Debug)]
pub struct Applicant {
    pub wallet: Pubkey,
    pub bump: u8,
    pub name: String,
    pub email: String,
    pub resume_link: String,
    pub contact_via_email: bool,
    pub contact_via_wallet: bool,
}
```

Store the `PDA` seed prefix and size as `static` variables.

Also annotate each `size` with the origin for easier readability, use `std::mem::size_of` if possible. 

```rust
impl Applicant {
    pub const PREFIX: &'static str = "APPLICANT";

    pub const SIZE: usize = 8 + /* discriminator */
        std::mem::size_of::<Pubkey>() + /* wallet */
        std::mem::size_of::<u8>() + /* bump */
        64 + /* name */
        64 + /* email */
        128 + /* resume_link */
        std::mem::size_of::<bool>() + /* contact_via_email */
        std::mem::size_of::<bool>() + /* contact_via_wallet */
        100 /* padding */
    ;
    /* rest of file */
}
```

## Instructions 

Taken from [apply_to_job_listings](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/jobs/src/instructions/application/apply_to_job_listings.rs) .

One instruction per file, with file name, function name, context and arguments all keeping the same name.

```rust

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ApplyToJobListingArgs {
    pub are_you_sure: bool
}

#[derive(Accounts)]
#[instruction(args: ApplyToJobListingArgs)]
pub struct ApplyToJobListingContext<'info> {
    /* accounts */
}


pub fn apply_to_job_listing(
    ctx: Context<ApplyToJobListingContext>,
    args: ApplyToJobListingArgs,
) -> Result<()> {
    /* function implementation */
}
```

The seeds taken from the `Application::PREFIX` and `bump` from `applicant.bump`.

Also, try and use constraints like `has_one` as much a possible to protect against malicious inputs.

```rust
    #[account(
    seeds=[Applicant::PREFIX.as_bytes(), &applicant.wallet.to_bytes()],
    has_one=wallet,
    bump=applicant.bump
    )]
    pub applicant: Box<Account<'info, Applicant>>,
```

## Testing

* [PDAs](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/jobsi/tests/pdas/pdas.ts)
  * All PDA getters in one file.
* [Tests](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/jobsi/tests)
  * At least one test per instruction, easy to make sure proper coverage and easily copy tests to front-end and just replace `Keypair` signing with `wallet` signing.

