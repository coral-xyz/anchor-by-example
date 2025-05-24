use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("6jhqFRCphbsTJJCwa6azgURdyYDCv8pNHYgER7bM23oP");

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
                &[&["escrow6".as_bytes(), ctx.accounts.escrow.authority.as_ref(), &[ctx.accounts.escrow.bump]]],
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
                &[&["escrow6".as_bytes(), ctx.accounts.seller.key().as_ref(), &[ctx.accounts.escrow.bump]]],
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
            &[&["escrow6".as_bytes(), ctx.accounts.seller.key().as_ref(), &[ctx.accounts.escrow.bump]]],
        ))?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {

    /// `seller`, who is willing to sell his token_x for token_y
    #[account(mut)]
    seller: Signer<'info>,

    /// Token x mint for ex. USDC
    x_mint: Account<'info, Mint>,
    /// Token y mint 
    y_mint: Account<'info, Mint>,

    /// ATA of x_mint 
    #[account(mut, constraint = seller_x_token.mint == x_mint.key() && seller_x_token.owner == seller.key())] 
    seller_x_token: Account<'info, TokenAccount>,

    #[account(
        init, 
        payer = seller,  
        space=Escrow::LEN,
        seeds = ["escrow6".as_bytes(), seller.key().as_ref()],
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

#[derive(Accounts)]
pub struct Accept<'info> {

    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = ["escrow6".as_bytes(), escrow.authority.as_ref()],
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

#[derive(Accounts)]
pub struct Cancel<'info> {
    pub seller: Signer<'info>,

    #[account(
        mut,
        close = seller, constraint = escrow.authority == seller.key(),
        seeds = ["escrow6".as_bytes(), escrow.authority.as_ref()],
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