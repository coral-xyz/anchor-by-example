use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct Applicant {
    pub wallet: Pubkey,
    pub bump: u8,
    pub name: String,
    pub email: String,
    pub resume_link: String,
    pub contact_via_email: bool,
    pub contact_via_wallet: bool,
}

impl Applicant {
    pub const PREFIX: &'static str = "APPLICANT";

    pub const SIZE: usize = 8 + /* discriminator */
        std::mem::size_of::<Pubkey>() + /* wallet */
        std::mem::size_of::<u8>() + /* bump */
        64 + /* name */
        64 + /* email */
        128 + /* resume_link */
        std::mem::size_of::<bool>() + /* contact_via_email */
        std::mem::size_of::<bool>() + /* contact_via_wallet */
        100 /* padding */
    ;

    pub fn update(&mut self,
                wallet: Pubkey,
                bump: u8,
                name: String,
                email: String,
                resume_link: String,
                contact_via_email: bool,
                contact_via_wallet: bool,
    ) {
        self.wallet = wallet;
        self.bump = bump;
        self.name = name;
        self.email = email;
        self.resume_link = resume_link;
        self.contact_via_email = contact_via_email;
        self.contact_via_wallet = contact_via_wallet;
    }
}