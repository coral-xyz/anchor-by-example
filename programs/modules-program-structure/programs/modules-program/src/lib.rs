use anchor_lang::prelude::*;

// This is an example of an anchor program with Rust modules.


// Since our program entrypoint includes structs and functions from these 2 modules
// We 'use" them
use instructions::*;
use state::*;

// Since we want to access content of these modules
// We declare them as modules with "mod"

// here we declare  './instructions/mod.rs'as program module
mod instructions;
// we could also declare single files, such as './constants.rs' as modules
mod constants;

mod state;
mod errors;

// Here we declare ID of our program
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// Here we declare entrypoint into our program
#[program]
pub mod modules_program {
    use super::*;

    // Here we declare public names of our program's methods/instructions.
    // Also we declare required context (accounts) and data for method.

    // As you see, there is no exact declarations of any context or data structs in this file.
    // All structs are declared in other modules of our program.

    // Here we just tell to the public which instructions they could invoke and which data they should provide!

    pub fn initialize(ctx: Context<InitializeMyAccount>, data: InitializeMyAccountData) -> Result<()> {
        // Exact function, which proccesses our function, might have any name.
        // Moreover, it could take any arguments, any ctx and any data. 

        // Less hardcoding - more scalability!

        // Just make sure, that final funcction returns Result<()> :)
        instructions::you_may_have_any_function_name(ctx, data)
    }

    pub fn close(ctx: Context<CloseMyAccount>) -> Result<()> {
        instructions::close_my_account(ctx)
    }
}
