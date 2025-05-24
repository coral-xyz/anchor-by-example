---
title: Non-custodial escrow
description: On-chain non-custodial escrow program on Solana blockchain
---
> [Program Code](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/non-custodial-escrow)

Let's write a non-custodial escrow program that lives on the Solana blockchain. With the help of this programme, anyone can exchange their assets for new ones without having to trust a third party.

This program is a simple three-function non-custodial escrow that operates on-chain. Users will be able to:
- Create a new escrow linked to the assets they wish to exchange for a new one.
- Accept the escrow and exchange their current assets for a new one, yay! 🏄‍♂️.
- If they don't wish to exchange their assets for new ones, they can cancel the escrow.

---
To initialize the project, simply run:
```shell
anchor init non-custodial-escrow
```
## Program's Code
Let's write our first instruction `initialize`. This instruction will create a new escrow associated with our old token for a new one. For this program, we are going to sell our `x_token` for `y_token`. In order to make this program non-custodial, We will first transfer our `x_token` to the program's owned `escrowed_x_tokens` accounts. Enough theory; let's get to writing some code.
```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
#[program]
pub mod non_custodial_escrow {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, x_amount: u64, y_amount: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.bump = ctx.bumps.escrow;
        escrow.authority = ctx.accounts.seller.key();
        escrow.escrowed_x_tokens = ctx.accounts.escrowed_x_tokens.key();
        escrow.y_amount = y_amount; // number of token sellers wants in exchange
        escrow.y_mint = ctx.accounts.y_mint.key(); // token seller wants in exchange

        // Transfer seller's x_token in program owned escrow token account
        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.seller_x_token.to_account_info(),
                    to: ctx.accounts.escrowed_x_tokens.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            x_amount,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    seller: Signer<'info>,
    x_mint: Account<'info, Mint>,
    y_mint: Account<'info, Mint>,
    #[account(mut, constraint = seller_x_token.mint == x_mint.key() && seller_x_token.owner == seller.key())] 
    seller_x_token: Account<'info, TokenAccount>,
    #[account(
        init, 
        payer = seller,  
        space=Escrow::LEN,
        seeds = ["escrow".as_bytes(), seller.key().as_ref()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        init,
        payer = seller,
        token::mint = x_mint,
        token::authority = escrow,
    )]
    escrowed_x_tokens: Account<'info, TokenAccount>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>,
    system_program: Program<'info, System>,
}

#[account]
pub struct Escrow {
    authority: Pubkey,
    bump: u8,
    escrowed_x_tokens: Pubkey,
    y_mint: Pubkey,
    y_amount: u64,
}

impl Escrow {
    pub const LEN: usize = 8 + 1+ 32 + 32 + 32 + 8;
}
```

Our second instruction is `accept`. This instruction allows the user to accept an open escrow and exchange their old assets for new ones. Easy-pizy. In keeping with our programme, `buyer` is looking to exchange his `y_token` for `x_token`.
```rust
pub fn accept(ctx: Context<Accept>) -> Result<()> {
    // transfer escrowd_x_token to buyer
    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.escrowed_x_tokens.to_account_info(),
                to: ctx.accounts.buyer_x_tokens.to_account_info(),
                authority: ctx.accounts.escrow.to_account_info(),
            },
            &[&["escrow".as_bytes(), ctx.accounts.escrow.authority.as_ref(), &[ctx.accounts.escrow.bump]]],
        ),
        ctx.accounts.escrowed_x_tokens.amount,
    )?;

    // transfer buyer's y_token to seller
    anchor_spl::token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.buyer_y_tokens.to_account_info(),
                to: ctx.accounts.sellers_y_tokens.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        ),
        ctx.accounts.escrow.y_amount,
    )?;
    Ok(())
}
#[derive(Accounts)]
pub struct Accept<'info> {

    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = ["escrow".as_bytes(), escrow.authority.as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut, constraint = escrowed_x_tokens.key() == escrow.escrowed_x_tokens)]
    pub escrowed_x_tokens: Account<'info, TokenAccount>,

    #[account(mut, constraint = sellers_y_tokens.mint == escrow.y_mint)]
    pub sellers_y_tokens: Account<'info, TokenAccount>,

    #[account(mut, constraint = buyer_x_tokens.mint == escrowed_x_tokens.mint)]
    pub buyer_x_tokens: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = buyer_y_tokens.mint == escrow.y_mint,
        constraint = buyer_y_tokens.owner == buyer.key()
    )]
    pub buyer_y_tokens: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
```

Our last instruction is `cancle`. If the `seller` changes their minds, they are free to close their escrows without anyone's consent.
```rust
pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
    // return seller's x_token back to him/her
    anchor_spl::token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer {
                from: ctx.accounts.escrowed_x_tokens.to_account_info(),
                to: ctx.accounts.seller_x_token.to_account_info(),
                authority: ctx.accounts.escrow.to_account_info(),
            },
            &[&["escrow".as_bytes(), ctx.accounts.seller.key().as_ref(), &[ctx.accounts.escrow.bump]]],
        ),
        ctx.accounts.escrowed_x_tokens.amount,
    )?;

    anchor_spl::token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        anchor_spl::token::CloseAccount {
            account: ctx.accounts.escrowed_x_tokens.to_account_info(),
            destination: ctx.accounts.seller.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        },
        &[&["escrow".as_bytes(), ctx.accounts.seller.key().as_ref(), &[ctx.accounts.escrow.bump]]],
    ))?;
    Ok(())
}
#[derive(Accounts)]
pub struct Cancel<'info> {
    pub seller: Signer<'info>,
    #[account(
        mut,
        close = seller, constraint = escrow.authority == seller.key(),
        seeds = ["escrow".as_bytes(), escrow.authority.as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut, constraint = escrowed_x_tokens.key() == escrow.escrowed_x_tokens)]
    pub escrowed_x_tokens: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = seller_x_token.mint == escrowed_x_tokens.mint,
        constraint = seller_x_token.owner == seller.key()
    )]
    seller_x_token: Account<'info, TokenAccount>,
    token_program: Program<'info, Token>,
}
```

## Test
Let's write some test for our `non-custodial-escorw` that we just wrote or kinda partially, whatever. You know what to do copy-pasta the following code in your `non-custodial-escorw.ts` file in tests folder in the root directory.
```typescript
import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { Program } from "@project-serum/anchor";
import { NonCustodialEscrow } from "../target/types/non_custodial_escrow";
import { LAMPORTS_PER_SOL, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

describe("NonCustodialEscrow", () => {
  const provider =  anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.NonCustodialEscrow as Program<NonCustodialEscrow>;
  
  const seller =  provider.wallet.publicKey; // anchor.web3.Keypair.generate();
  const payer = (provider.wallet as NodeWallet).payer;
  const buyer =  anchor.web3.Keypair.generate();
  const escrowedXTokens = anchor.web3.Keypair.generate();
  let x_mint;
  let y_mint;
  let sellers_x_token;
  let sellers_y_token;
  let buyer_x_token;
  let buyer_y_token;
  let escrow: anchor.web3.PublicKey;
  before(async() => {
    await provider.connection.requestAirdrop(buyer.publicKey, 1*LAMPORTS_PER_SOL);
    // Derive escrow address
    [escrow] = await anchor.web3.PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("escrow"),
      seller.toBuffer()
    ], 
    program.programId)
    x_mint = await splToken.Token.createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      provider.wallet.publicKey,
      6,
      splToken.TOKEN_PROGRAM_ID
    );
    y_mint = await splToken.Token.createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      null,
      6,
      splToken.TOKEN_PROGRAM_ID
    );
    // seller's x and y token account
    sellers_x_token = await x_mint.createAccount(seller);
    await x_mint.mintTo(sellers_x_token, payer, [], 10_000_000_000);

    sellers_y_token = await y_mint.createAccount(seller);
    // buyer's x and y token account
    buyer_x_token = await x_mint.createAccount(buyer.publicKey);
    buyer_y_token = await y_mint.createAccount(buyer.publicKey);
    await y_mint.mintTo(buyer_y_token, payer, [], 10_000_000_000);
  })

  it("Initialize escrow", async () => {
    const x_amount = new anchor.BN(40);
    const y_amount = new anchor.BN(40);
    const tx = await program.methods.initialize(x_amount, y_amount)
      .accounts({
        seller: seller,
        xMint: x_mint.publicKey,
        yMint: y_mint.publicKey,
        sellerXToken: sellers_x_token,
        escrow: escrow,
        escrowedXTokens: escrowedXTokens.publicKey,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([escrowedXTokens])
      .rpc()
  });

  it("Execute the trade", async () => { 
    const tx = await program.methods.execute()
      .accounts({
        buyer: buyer.publicKey,
        escrow: escrow,
        escrowedXTokens: escrowedXTokens.publicKey,
        sellersYTokens: sellers_y_token,
        buyerXTokens: buyer_x_token,
        buyerYTokens: buyer_y_token,
        tokenProgram: splToken.TOKEN_PROGRAM_ID
      })
      .signers([buyer])
      .rpc()
  });

  it("Cancle the trade", async () => { 
    const tx = await program.methods.cancel()
    .accounts({
      seller: seller,
      escrow: escrow,
      escrowedXTokens: escrowedXTokens.publicKey,
      sellerXToken: sellers_x_token,
      tokenProgram: splToken.TOKEN_PROGRAM_ID
    })
    .rpc()
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

[Escrow Creation tx log](https://explorer.solana.com/tx/3YhNqdH3ZUHMzYDtTQS6yJUWD6RKr7Yhaz1jxNEq9z2HK4jWBreXuwZUH2MhuQmfvdkSx1EZjUCyCNfV6GTSKpVw?cluster=devnet#ix-1)
```shell
> Program logged: "Instruction: Initialize"
> Program invoked: System Program
  > Program returned success
```

[Accepting escrow tx log](https://explorer.solana.com/tx/eFUR1HPWEyC743v1AcHPjtG1wE6BBVaZXWnXLEqPe12ZQiDaeUKabJHaiicECJd23cysH98NUkCC5yKfoMBzp4o?cluster=devnet#ix-1)
```shell
> Program logged: "Instruction: Execute"
> Program invoked: Token Program
  > Program logged: "Instruction: Transfer"
  > Program consumed: 4645 of 189339 compute units
```

[Cancelling escrow tx log](https://explorer.solana.com/tx/eFUR1HPWEyC743v1AcHPjtG1wE6BBVaZXWnXLEqPe12ZQiDaeUKabJHaiicECJd23cysH98NUkCC5yKfoMBzp4o?cluster=devnet#ix-1)
```shell
> Program logged: "Instruction: Cancel"
> Program invoked: Token Program
  > Program logged: "Instruction: Transfer"
  > Program consumed: 4740 of 191390 compute units
  > Program returned success
> Program invoked: Token Program
  > Program logged: "Instruction: CloseAccount"
  > Program consumed: 3015 of 184215 compute units
```


