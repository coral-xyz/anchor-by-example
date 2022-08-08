use anchor_lang::prelude::*;

declare_id!("AkN2PoD2JrWyYzmB6FEbWBncQbsMxhYH5otfmQJFMsdC");

#[program]
pub mod onchain_voting {
    use super::*;

    pub fn init_vote_bank(ctx: Context<InitVote>) -> Result<()> {
        // Open vote bank for public to vote on our favourite "GM" or "GN"
        ctx.accounts.vote_account.is_open_to_vote = true;
        Ok(())
    }

    pub fn gib_vote(ctx: Context<GibVote>, vote_type: VoteType) -> Result<()> {
        // If vote_type is GM increment GM by 1 else increment GN by 1
        match vote_type {
            VoteType::GM => {
                msg!("Voted for GM 🤝");
                ctx.accounts.vote_account.gm += 1; 
            },
            VoteType::GN => {
                msg!("Voted for GN 🤞");
                ctx.accounts.vote_account.gn += 1; 
            },
        };
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitVote<'info> {
    // Making a global account for storing votes
    #[account(
        init, 
        payer = signer, 
        space = 8 + 1 + 8 + 8, 
    )] 
    pub vote_account: Account<'info, VoteBank>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GibVote<'info> {
    // Storing Votes in global account
    #[account(mut)] 
    pub vote_account: Account<'info, VoteBank>,

    pub signer: Signer<'info>,
}


#[account]
#[derive(Default)]
pub struct VoteBank {
    is_open_to_vote: bool,
    gm: u64, // 8 bytes in size
    gn: u64, // 8 bytes in size
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum VoteType {
    GM,
    GN
}