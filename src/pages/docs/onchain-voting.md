---
title: On-Chain Voting
description: A decentralized on-chain voting 
---

In this program, we are going to build a decentralized on-chain voting system on solana. Where users can vote on our favourite `GM` and `GN`. Let's see who will win 🚀.

> With the help of this example we are going to learn, how to store and update data in solana accounts.

---

To initialize the project, simply run:
```shell
anchor init onchain-voting
```
## Program's Code
Let's write our first instruction `init_vote_bank` which let us to store all of our votes in a new account on the Solana blockchain.
```rust
use anchor_lang::prelude::*;
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
```

Time for our second and most important instruction the `gib_vote`. This instruction accept votes from public a.k.a janta
```rust
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
#[derive(Accounts)]
pub struct GibVote<'info> {
    // we are going to store users vote in this account. Hence marking it as mutable(mut), 
    #[account(mut)] 
    pub vote_account: Account<'info, VoteBank>,
    pub signer: Signer<'info>,
}
#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum VoteType {
    GM,
    GN
}
```

Now compile and build this program, by simply running:
```shell
anchor build
```
## Test
Now It's time to write a test for our program! Copy-pasta the following code into your `onchain-voting.ts` file in tests folder in the root directory.
```typescript
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { OnchainVoting } from "../target/types/onchain_voting";

describe("onchain-voting", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.OnchainVoting as Program<OnchainVoting>;
  let voteBank = anchor.web3.Keypair.generate();

  it("Creating vote bank for public to vote", async () => {
    const tx = await program.methods.initVoteBank()
      .accounts({
        voteAccount: voteBank.publicKey,
      })
      .signers([voteBank])
      .rpc();
    console.log("TxHash ::", tx);
  });

  it("Vote for GM", async () => { 
    const tx = await program.methods.gibVote({gm:{}})
    .accounts({
      voteAccount: voteBank.publicKey,
    })
    .rpc();
    console.log("TxHash ::", tx);

    let voteBankData = await program.account.voteBank.fetch(voteBank.publicKey);
    console.log(`Total GMs :: ${voteBankData.gm}`)
    console.log(`Total GNs :: ${voteBankData.gn}`)
  });

  it("Vote for GN", async () => { 
    const tx = await program.methods.gibVote({g:{}})
    .accounts({
      voteAccount: voteBank.publicKey,
    })
    .rpc();
    console.log("TxHash ::", tx);

    let voteBankData = await program.account.voteBank.fetch(voteBank.publicKey);
    console.log(`Total GMs :: ${voteBankData.gm}`)
    console.log(`Total GNs :: ${voteBankData.gn}`)
  });
});
```

## Deployment 🎉
Time to deploy and test our first hello world smart contract, yay! 

We are going to deploy on `devnet`. Here is our deployment checklist 🚀

1. Run `anchor build`. Your program keypair is now in `target/deploy`. Keep this keypair secret 🤫.
2. Run `anchor keys list` to display the keypair's public key and copy it into your `declare_id!` macro at the top of `lib.rs`.
3. Run `anchor build` again. This step is necessary to include the new program id in the binary.
4. Change the `provider.cluster` variable in `Anchor.toml` to `devnet`.
5. Run `anchor deploy`
6. Run `anchor test`

## On-Chain Result
```shell
> Program logged: "Instruction: GibVote"
> Program logged: "Voted for GM 🤝"
> Program consumed: 2121 of 200000 compute units
> Program returned success
```

[Program's transaction log](https://explorer.solana.com/tx/cZRfUaFshh4jyweT3ZAtVxcCatxSHujku76ar6NJRjGxyyFE8BX7PPs8ZXv4cEvVXQKz1TX7XEqhrmeDcqHRf1j?cluster=devnet#ix-1)