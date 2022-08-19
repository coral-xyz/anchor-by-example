use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use pyth_sdk_solana::{load_price_feed_from_account_info};

declare_id!("2iFXrFurDAZwv5HZHebiTgE4p2GoKkokw8F3fjKnPy4s");

const PREDICTION_SEED: &'static [u8] = b"prediction";
const POOL_SEED: &'static [u8] = b"betting_pool";

#[program]
pub mod pyth_stake {
    use super::*;

    pub fn create_prediction(
        ctx: Context<CreatePrediction>,
        asset_name: String,
        base_bump: u8, 
        _pool_bump: u8,
        predicted_price: i64,
        holdout_period_sec: u64,
        bid_amount: u64,
    ) -> Result<()> {
        let price_account_info = &mut ctx.accounts.asset_price_record;
        let price_feed = load_price_feed_from_account_info( &price_account_info ).expect("error loading the price feed");
        let current_price = price_feed.get_current_price().expect("error getting the current price");

        // checks the direction with the data fetched from pyth which would be used for vaildation
        if current_price.price > predicted_price {
            ctx.accounts.base_account.direction = String::from("DOWN");
        }
        else {
            ctx.accounts.base_account.direction = String::from("UP");
        }

        // The prediction details are stored in the PDA
        ctx.accounts.base_account.asset = asset_name;
        ctx.accounts.base_account.is_correct = false;
        ctx.accounts.base_account.expiry_date =
            (holdout_period_sec as i64) + Clock::get().unwrap().unix_timestamp;
        ctx.accounts.base_account.bidder_token_wallet_key =
            ctx.accounts.wallet_to_withdraw_from.key();
        ctx.accounts.base_account.pyth_product_public_key = ctx.accounts.asset_record.key();
        ctx.accounts.base_account.pyth_price_public_key = ctx.accounts.asset_price_record.key();
        ctx.accounts.base_account.entry_price               = current_price.price;
        ctx.accounts.base_account.validation_price = predicted_price;
        ctx.accounts.base_account.bid_amount = bid_amount;
        ctx.accounts.base_account.is_correct = false;

        msg!("You can transfer");
        msg!("Transfer is initiated");

        // This is the transfer instruction where the tokens are transfered from the user's wallet to the betting pool wallet
        let authority_key = ctx.accounts.authority.key();

        let bump_vector = base_bump.to_le_bytes();
        let inner = vec![
            PREDICTION_SEED,
            ctx.accounts.base_account.asset.as_ref(),
            authority_key.as_ref(),
            bump_vector.as_ref(),
        ];
        let outer = vec![inner.as_slice()];

        // Below is the actual instruction that we are going to send to the Token program.
        let transfer_instruction = Transfer {
            from: ctx.accounts.wallet_to_withdraw_from.to_account_info(),
            to: ctx.accounts.betting_pool_wallet.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            outer.as_slice(), //signer PDA
        );

        // The `?` at the end will cause the function to return early in case of an error.
        // This pattern is common in Rust.
        anchor_spl::token::transfer(cpi_ctx, bid_amount)?;

        msg!("token is deposited");

        Ok(())
    }

    pub fn validate_prediction(
        ctx: Context<ValidatePrediction>,
        _asset_name: String,
        base_bump: u8,
        _pool_bump: u8,
        reward: u64
    ) -> Result<()> {
        let parameter = &mut ctx.accounts.base_account;

        let price_account_info = &mut ctx.accounts.asset_price_record;
        let price_feed = load_price_feed_from_account_info(&price_account_info).unwrap();
        let current_price = price_feed.get_current_price().unwrap();


        // Check if the prediction is true and the status is updated based on which the user is rewarded
        if parameter.direction == "UP" {
            if current_price.price > parameter.validation_price {
                parameter.is_correct = true;
                msg!("Will get the reward");
            } else {
                parameter.is_correct = false;
            }
        } else {
            if current_price.price < parameter.validation_price {
                parameter.is_correct = true;
                msg!("Will get the reward");
            } else {
                parameter.is_correct = false;
            }
        }

        // This is only for testing to check the reward is getting transfered from the betting pool wallet to the user wallet
        // This has to be commented if it is in real time.
        parameter.is_correct = true;

        if parameter.is_correct {
            let authority_key = ctx.accounts.authority.key();

            let bump_vector = base_bump.to_le_bytes();
            let inner = vec![
                PREDICTION_SEED,
                ctx.accounts.base_account.asset.as_ref(),
                authority_key.as_ref(),
                bump_vector.as_ref(),
            ];
            let outer = vec![inner.as_slice()];

            // Below is the actual instruction that we are going to send to the Token program.
            let transfer_instruction = Transfer {
                from: ctx.accounts.betting_pool_wallet.to_account_info(),
                to: ctx.accounts.wallet_to_deposit_to.to_account_info(),
                authority: ctx.accounts.base_account.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_instruction,
                outer.as_slice(), //signer PDA
            );

            // The `?` at the end will cause the function to return early in case of an error.
            // This pattern is common in Rust.
            anchor_spl::token::transfer(cpi_ctx, reward)?;
        }

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(asset_name: String, base_bump: u8, pool_bump: u8)]
pub struct CreatePrediction<'info> {
    #[account(init, payer = authority, seeds = [PREDICTION_SEED, asset_name.as_ref(), authority.key().as_ref()], bump, space = 800)]
    pub base_account: Account<'info, PredictionRecord>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    ///CHECK:
    pub asset_record: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK:
    pub asset_price_record: AccountInfo<'info>,
    #[account(
        init, payer = authority,
        seeds = [POOL_SEED, authority.key().as_ref()],
        bump,
        token::mint=token_mint,
        token::authority=base_account,
    )]
    pub betting_pool_wallet: Account<'info, TokenAccount>,
    #[account(mut)]
    pub wallet_to_withdraw_from: Account<'info, TokenAccount>,
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(asset_name: String, base_bump: u8, pool_bump: u8)]
pub struct ValidatePrediction<'info> {
    #[account(mut, seeds = [PREDICTION_SEED, asset_name.as_ref(), authority.key().as_ref()], bump = base_bump)]
    pub base_account: Account<'info, PredictionRecord>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    ///CHECK:
    pub asset_record: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK:
    pub asset_price_record: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [POOL_SEED, authority.key().as_ref()],
        bump = pool_bump,
        token::mint=token_mint,
        token::authority=base_account,
    )]
    pub betting_pool_wallet: Account<'info, TokenAccount>,
    #[account(mut)]
    pub wallet_to_deposit_to: Account<'info, TokenAccount>,
    pub token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct PredictionRecord {
    pub direction: String, // 4
    pub asset: String,     // 15
    pub is_correct: bool,  // 1
    pub expiry_date: i64,
    pub bidder_token_wallet_key: Pubkey, // 32
    pub pyth_product_public_key: Pubkey, // 32
    pub pyth_price_public_key: Pubkey,   // 32
    pub validation_date: i64,
    pub entry_price: i64,
    // pub entry_expo: i32,
    pub validation_price: i64,
    // pub validation_expo: i32,
    pub bid_amount: u64, // 8
}
