use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize,  Clone, Debug, PartialEq, Copy)]
pub enum ApplicationStatus {
    Pending,
    Accepted,
    Rejected,
}

#[account]
pub struct Application {
    pub wallet: Pubkey,
    pub applicant: Pubkey,
    pub job: Pubkey,
    pub status: ApplicationStatus,
    pub bump: u8
}

impl Application {
    pub const PREFIX: &'static str = "APPLICATION";

    pub const SIZE: usize = 8 + /* discriminator */
        std::mem::size_of::<Pubkey>() + /* wallet */
        std::mem::size_of::<Pubkey>() + /* applicant */
        std::mem::size_of::<Pubkey>() + /* job */
        std::mem::size_of::<ApplicationStatus>() + /* status */
        std::mem::size_of::<u8>() + /* bump */
        100 /* padding */
    ;

    pub fn update(&mut self,
                  wallet: Pubkey,
                  applicant: Pubkey,
                  job: Pubkey,
                  status: ApplicationStatus,
                  bump: u8
    ) {
        self.wallet = wallet;
        self.bump = bump;
        self.job = job;
        self.applicant = applicant;
        self.status = status;
    }
}