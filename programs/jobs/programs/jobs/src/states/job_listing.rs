use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct JobListing {
    pub bump: u8,
    pub company: Pubkey,
    pub uuid: String,
    pub title: String,
    pub location: String,
    pub part_time: bool,
    pub full_time: bool,
    pub remote: bool,
    pub requirements: Vec<String>,
    pub description: String,
    pub link: String,
    pub yearly_pay_range_start: u32,
    pub yearly_pay_range_end: u32,
    pub hourly_pay_range_start: u32,
    pub hourly_pay_range_end: u32,
    // pub created_at: u64
}

impl JobListing {
    pub const PREFIX: &'static str = "JOB_LISTING";

    pub const SIZE: usize = 8 + /* discriminator */
        std::mem::size_of::<Pubkey>() + /* company */
        32 + /* uuid */
        64 + /* title */
        64 + /* location */
        std::mem::size_of::<bool>() + /* part_time */
        std::mem::size_of::<bool>() + /* full_time */
        std::mem::size_of::<bool>() + /* remote */
        10 * 64 + /* requirements */
        200 + /* description */
        128 + /* link */
        std::mem::size_of::<u32>() + /* yearly_pay_range_start */
        std::mem::size_of::<u32>() + /* yearly_pay_range_end */
        std::mem::size_of::<u32>() + /* hourly_pay_range_start */
        std::mem::size_of::<u32>() + /* hourly_pay_range_end */
        // std::mem::size_of::<u64>() + /* created_at */
        100 /* padding */
    ;

    pub fn update(&mut self,
                  bump: u8,
                  company: Pubkey,
                  uuid: String,
                  title: String,
                  location: String,
                  part_time: bool,
                  full_time: bool,
                  remote: bool,
                  requirements: Vec<String>,
                  description: String,
                  link: String,
                  yearly_pay_range_start: u32,
                  yearly_pay_range_end: u32,
                  hourly_pay_range_start: u32,
                  hourly_pay_range_end: u32,
    ) {
        self.bump = bump;
        self.company = company;
        self.uuid = uuid;
        self.title = title;
        self.location = location;
        self.part_time = part_time;
        self.full_time = full_time;
        self.remote = remote;
        self.requirements = requirements;
        self.description = description;
        self.link = link;
        self.yearly_pay_range_start = yearly_pay_range_start;
        self.yearly_pay_range_end = yearly_pay_range_end;
        self.hourly_pay_range_start = hourly_pay_range_start;
        self.hourly_pay_range_end = hourly_pay_range_end;
    }
}