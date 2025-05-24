---
title: Self-Custodial Facebook
description: A decentralized self-custodial facebook on solana blockchain 
---
> [Program Code](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/self-custodial-facebook)

In this program, we are building a "Self-Custodial Facebook" where individuals may publish information about themselves that other users can find out about, such as their name, status, abilities, and one joke.
> With the help of this example we are going to learn about PDAs(program derived addresses). The Why, When and How about PDAs.
#### Pre-requisite
[PDAs](https://www.anchor-lang.com/docs/pdas)

---

To initialize the project, simply run:
```shell
anchor init self-custodial-facebook 
```
## Program's Code
Let's write our first instruction `create_facebook`. In this instruction we are going to create a new account for every user, for this we are using PDAs(program-derived addresses). Every `facebook_account` is a PDA with seeds that includes their `WALLET_ADDRESS` and `CONSTANT_PREFIX`.
```rust
use anchor_lang::prelude::*;
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
#[program]
pub mod self_custodial_facebook {
    use super::*;
    pub fn create_facebook(ctx: Context<Initialize>, name: String, status: String, twitter: String) -> Result<()> {
        // setting userdata in user's account
        let users_account_data = &mut ctx.accounts.facebook_account;
        users_account_data.bump = ctx.bumps.facebook_account;

        users_account_data.authority = *ctx.accounts.signer.key;
        users_account_data.name = name.to_owned();
        users_account_data.status = status.to_owned();
        users_account_data.twitter = twitter.to_owned();

        // Printing User Info into program's on-chain transaction log.
        msg!("Created a new account with following details 
            Name :: {0}
            Status :: {1}
            Twitter :: {2}
            ", name, status, twitter 
        );
        Ok(())
    }
}
#[derive(Accounts)]
pub struct Initialize<'info> {
    // User's account
    #[account(mut)]
    pub signer: Signer<'info>,
    // Creating a new account for every user with seed of their wallet address.
    // This constraint allow one-account per wallet address
    #[account(
        init, 
        payer = signer, 
        space = FacebookAccount::LEN, 
        seeds = ["self-custodial-facebook2".as_bytes(), signer.key().as_ref()], 
        bump,
    )] 
    pub facebook_account: Account<'info, FacebookAccount>,
    pub system_program: Program<'info, System>,
}
#[account]
pub struct FacebookAccount {
    pub authority: Pubkey, // Authority of this account
    pub bump: u8,
    pub name: String, // Max 10 Chars
    pub status: String, // Max 100 Chars
    pub twitter: String // Max 10 Chars
}

impl FacebookAccount {
    const LEN: usize = 
        8 + // discriminator
        32 + // Pubkey
        1 + // bump
        (4 + 10) + // 10 chars of Name
        (4 + 100) + // 100 chars of Status  
        (4 + 10); // 10 chars' twitter
}
```

Time for our second instruction the `update_status`. This instruction allow user to update their status.
```rust
pub fn update_status(ctx: Context<Update>, new_status: String) -> Result<()> {
    // Update user status, much more like whatsapp 24 hour status, without self destruction 😉
    msg!("Updating status from :: {0} -> to :: {1}", &ctx.accounts.facebook_account.status, &new_status);
    ctx.accounts.facebook_account.status = new_status;
    Ok(())
}
#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    // user's facebook account    
    #[account(
        mut,
        seeds = ["self-custodial-facebook".as_bytes(), signer.key().as_ref()], 
        bump = facebook_account.bump,
    )]
    pub facebook_account: Account<'info, FacebookAccount>,
}
```

Our third instructino will allow user to delete their facebook account (without needing anyone's permission).
```rust
pub fn delete_account(_ctx: Context<Close>) -> Result<()> {
    msg!("Account Closed successfully");
    Ok(())
}
#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    // we will use `close` for closing user's facebook account.
    #[account(
        mut,
        seeds = ["self-custodial-facebook".as_bytes(), signer.key().as_ref()], 
        bump = facebook_account.bump,
        close=signer
    )]
    pub facebook_account: Account<'info, FacebookAccount>,
}
```
Before compiling the program, we will make use of anchor's [auto-infer PDA addresses](https://github.com/coral-xyz/anchor/pull/1331) feature. So that our client code does not need to manually derive PDA addresses. To accomplish this, we must turn on the `seeds` feature in our `Anchor.toml` file in the root directory.
> This feature is gated by a Cargo feature flag in the `Anchor.toml`. When this feature is enabled, seeds will be parsed into the IDL and automatically used to generate PDAs. 

```rust
[features]
seeds = true
```

Now compile and build this program, by simply running:
```shell
anchor build
```

## Test
Now It's time to write a test for our program! Copy-pasta the following code into your `self-custodial-facebook.ts` file in tests folder in the root directory.
```typescript
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SelfCustodialFacebook } from "../target/types/self_custodial_facebook";

describe("self-custodial-facebook", () => {
  const provider =  anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SelfCustodialFacebook as Program<SelfCustodialFacebook>;

  it("Creating a new account for user", async () => {
    const ix = await program.methods.createFacebook("Deep", "always tinkring", "0xdeep")
    const userFacebookAddress = (await ix.pubkeys()).facebookAccount
    console.log("User facebook address :: ", userFacebookAddress.toString());
    // Create user's facebook address
    const tx = await ix.rpc()
    console.log("Your transaction signature", tx);
    // User Details
    let userDetails = await program.account.facebookAccount.fetch(userFacebookAddress);
    console.log(`Created a new account with following details \n Name :: ${userDetails.name} \n Status :: ${userDetails.status} \n Twitter :: ${userDetails.twitter}`)
  });

  it("Update My Status", async () => { 
    const ix = await program.methods.updateStatus("&mut self :crab")
    const userFacebookAddress = (await ix.pubkeys()).facebookAccount
    console.log("usrFaceBook Address :: ", userFacebookAddress.toString());
    // Create user's facebook address
    const tx = await ix.rpc()
    console.log("Your transaction signature", tx);
    // User Details
    let userDetails = await program.account.facebookAccount.fetch(userFacebookAddress);
    console.log(`Created a new account with following details \n Name :: ${userDetails.name} \n Status :: ${userDetails.status} \n Twitter :: ${userDetails.twitter}`)
  });

  it("Find Someone's Facebook", async () => {
    const userAddress = new anchor.web3.PublicKey("Gz2k7789kKnoeDo9TWXpCmSudp5DW22u8FvnRcFS5aS6");
    const [userFacebookAccount, _] = await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('self-custodial-facebook2'),
        userAddress.toBuffer(),
      ],
      program.programId
    )
    try {
      let userDetails = await program.account.facebookAccount.fetch(userFacebookAccount);
      console.log(
        `Created a new account with following details \n Name :: ${userDetails.name} \n Status :: ${userDetails.status} \n Twitter :: ${userDetails.twitter}`
      )
    } catch (error) {
      console.log("Users account does not exist :: ", error) 
    }
  });

  it("Close My Facebook Account", async () => {
    const ix = await program.methods.deleteAccount()
    const userFacebookAddress = (await ix.pubkeys()).facebookAccount
    console.log("user facebook address :: ", userFacebookAddress.toString());  
    // Create user's facebook address
    const tx = await ix.rpc()
    console.log("Your transaction signature", tx);
    // User Details Not found, 'cuz we closed the account
    try {
      let userDetails = await program.account.facebookAccount.fetch(userFacebookAddress);
      console.log(`Created a new account with following details \n Name :: ${userDetails.name} \n Status :: ${userDetails.status} \n Twitter :: ${userDetails.twitter}`)
    } catch {
      console.log("User Details Not found, 'cuz we close the account");
    }
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

[Account Creation transaction log](https://explorer.solana.com/tx/1eMvuPwrphHsoDPBGARJ2phjuRh851xWnwQ2bYzqB1ZuCahqVBBiy9LXWgMriZhaCVRADkZAWQH9wb5NadyT7LG?cluster=devnet#ix-1)
```shell
> Program logged: "Instruction: CreateFacebook"
> Program logged: "Created a new account with following details " Name :: Deep Status :: always tinkring Twitter :: 0xdeep
> Program consumed: 13707 of 200000 compute units
> Program returned success
```

[Update status transaction log](https://explorer.solana.com/tx/4WSBg693Kk3wdWf1gj31Ke4rNv3ukMeVtmPCzmuqQfn3rd83ay9bzhJbXRyzXg59wkKqjaayuvvj4kjYdevHeHRq?cluster=devnet#ix-1)
```shell
> Program logged: "Instruction: UpdateStatus"
> Program logged: "Updating status from :: always tinkring -> to :: &mut self :crab"
> Program consumed: 5812 of 200000 compute units
> Program returned success
```

