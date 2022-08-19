use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Company {
    pub admin: Pubkey,
    pub bump: u8,
    pub uuid: String,
    pub name: String,
    pub description: String,
    pub logo_url: String,
    pub company_url: String,
    pub email: String,
    pub number_of_employees: u32,
}

impl Company {
    pub const PREFIX: &'static str = "COMPANY";

    pub const SIZE: usize = 8 + /* discriminator */
        std::mem::size_of::<Pubkey>() + /* admin */
        std::mem::size_of::<u8>() + /* bump */
        64 + /* uuid */
        64 + /* name */
        200 + /* description */
        128 + /* logo_url */
        128 + /* company_url */
        64 + /* email */
        std::mem::size_of::<u32>() + /* number_of_employees */
        100 /* padding */
    ;

    pub fn update(
        &mut self,
        admin: Pubkey,
        bump: u8,
        uuid: String,
        name: String,
        description: String,
        logo_url: String,
        company_url: String,
        email: String,
        number_of_employees: u32,
    ) {
        self.admin = admin;
        self.bump = bump;
        self.uuid = uuid;
        self.name = name;
        self.description = description;
        self.logo_url = logo_url;
        self.company_url = company_url;
        self.email = email;
        self.number_of_employees = number_of_employees;
    }
}