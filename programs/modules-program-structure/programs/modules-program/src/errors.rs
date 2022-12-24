use anchor_lang::prelude::*;

// We declare all error codes of our program in this particular file


#[error_code]
pub enum MyError {
    #[msg("Signer is not an authority of this account")]
    AuthorityMismatch
}