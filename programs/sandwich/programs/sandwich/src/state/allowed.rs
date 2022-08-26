use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Allowed {
    pub(crate) bump: u8,
    pub(crate) allowed: Vec<Pubkey>,
}

impl Allowed {
    pub const PREFIX: &'static str = "ALLOWED";

    pub const SIZE: usize = 8 + /* discriminator */
        std::mem::size_of::<u8>() + /* bump */
        4 + 5 * std::mem::size_of::<Pubkey>() + /* allowed */
        100; /* padding */

    pub(crate) fn init(
        &mut self,
        bump: u8,
        allowed: Vec<Pubkey>,
    ) -> () {
        self.bump = bump;
        self.allowed = allowed;
    }
}