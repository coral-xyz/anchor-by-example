<div align="center">
  <img height="170x" src="https://pbs.twimg.com/media/FVUVaO9XEAAulvK?format=png&name=small" />

  <h1>Anchor By Example</h1>

  <p>
    <strong>Solana Sealevel Framework</strong>
  </p>

  <p>
    <a href="https://examples.anchor-lang.com"><img alt="Tutorials" src="https://img.shields.io/badge/docs-tutorials-blueviolet" /></a>
    <a href="https://discord.gg/PDeRXyVURd"><img alt="Discord Chat" src="https://img.shields.io/discord/889577356681945098?color=blueviolet" /></a>
    <a href="https://opensource.org/licenses/Apache-2.0"><img alt="License" src="https://img.shields.io/github/license/coral-xyz/anchor?color=blueviolet" /></a>
  </p>
</div>

## Getting started

```bash
npm install
cp .env.example .env.local
```

Next, run the development server:

##use anchor_lang::prelude::*;
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
#[program]
pub mod hello_world {
    use super::*;
    pub fn init_vote_bank(ctx: Context<InitVote>) -> Result<()> {
        // Open vote bank for public to vote on our favourite "GM" or "GN"
        ctx.accounts.vote_account.is_open_to_vote = true;
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
#[account]
#[derive(Default)]
pub struct VoteBank {
    is_open_to_vote: bool,
    gm: u64, 
    gn: u64,
}

```bash
npm run dev
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.
