mod instructions;
mod error_codes;
mod state;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod sandwich {
    use super::*;

    pub fn self_only(
        ctx: Context<SelfOnlyContext>,
    ) -> Result<()> {
        self_only::self_only(ctx)
    }

    pub fn allowed_only(
        ctx: Context<AllowedOnlyContext>,
    ) -> Result<()> {
        allowed_only::allowed_only(ctx)
    }

    pub fn set_allowed(
        ctx: Context<SetAllowedContext>,
        args: SetAllowedArgs,
    ) -> Result<()> {
        set_allowed::set_allowed(ctx, args)
    }
}
