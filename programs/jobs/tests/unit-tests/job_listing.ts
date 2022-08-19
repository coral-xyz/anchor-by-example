import * as anchor from "@project-serum/anchor";
import { IdlAccounts, IdlTypes, Program} from "@project-serum/anchor";
import { Jobs } from "../../target/types/jobs";
import {Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {airdrop} from "../helpers";
import {
    COMPANY_DESCRIPTION_1,
    COMPANY_EMAIL_1,
    COMPANY_LOGO_URL_1,
    COMPANY_NAME_1,
    COMPANY_NUMBER_OF_EMPLOYEES_1,
    COMPANY_URL_1,
    COMPANY_UUID_1,
    JOB_LISTING_DESCRIPTION_1,
    JOB_LISTING_FULL_TIME_1, JOB_LISTING_HOURLY_PAY_RANGE_END_1,
    JOB_LISTING_HOURLY_PAY_RANGE_END_2,
    JOB_LISTING_HOURLY_PAY_RANGE_START_1,
    JOB_LISTING_LINK_1,
    JOB_LISTING_LOCATION_1,
    JOB_LISTING_PART_TIME_1,
    JOB_LISTING_REMOTE_1,
    JOB_LISTING_REQUIREMENTS_1,
    JOB_LISTING_TITLE_1,
    JOB_LISTING_UUID_1,
    JOB_LISTING_YEARLY_PAY_RANGE_END_1,
    JOB_LISTING_YEARLY_PAY_RANGE_START_1,
} from "../test-fixtures";
import {assert} from "chai";
import {getCompany, getJobListing} from "../pdas";

describe("Job Listings Unit Tests", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.Jobs as Program<Jobs>;

    const company_owner = Keypair.generate()
    const user = Keypair.generate()

    it("Airdrop Applicant", async () => {
        await airdrop(program, user.publicKey, 2 * LAMPORTS_PER_SOL)
        await airdrop(program, company_owner.publicKey, 2 * LAMPORTS_PER_SOL)
    });

    it("Register Company", async () => {
        const [company] = await getCompany(COMPANY_UUID_1);
        const companyAccountBefore = await program.provider.connection.getParsedAccountInfo(company, "confirmed");
        assert(companyAccountBefore.value === null, "Company account should be empty");

        const args: IdlTypes<Jobs>["RegisterCompanyArgs"] = {
            uuid: COMPANY_UUID_1,
            name: COMPANY_NAME_1,
            description: COMPANY_DESCRIPTION_1,
            logoUrl: COMPANY_LOGO_URL_1,
            email: COMPANY_EMAIL_1,
            numberOfEmployees: COMPANY_NUMBER_OF_EMPLOYEES_1,
            companyUrl: COMPANY_URL_1
        };

        await program.methods
            .registerCompany(args)
            .accounts({
                company: company,
                admin: company_owner.publicKey,
            })
            .signers([company_owner])
            .rpc({commitment: "confirmed"});


        const companyAccount: IdlAccounts<Jobs>["company"] = await program.account.company.fetch(company, "confirmed");
        assert(companyAccount.uuid === COMPANY_UUID_1, "Company uuid should be correct");
        assert(companyAccount.name === COMPANY_NAME_1, "Company name should be correct");
        assert(companyAccount.description === COMPANY_DESCRIPTION_1, "Company description should be correct");
        assert(companyAccount.logoUrl === COMPANY_LOGO_URL_1, "Company logoUrl should be correct");
        assert(companyAccount.email === COMPANY_EMAIL_1, "Company email should be correct");
        assert(companyAccount.numberOfEmployees === COMPANY_NUMBER_OF_EMPLOYEES_1, "Company numberOfEmployees should be correct");
        assert(companyAccount.companyUrl === COMPANY_URL_1, "Company companyUrl should be correct");
        assert(companyAccount.admin.toBase58() === company_owner.publicKey.toBase58(), "Company admin should be correct");
    });

    it("Create a job listing", async() => {
        const [jobListing] = await getJobListing(JOB_LISTING_UUID_1);
        const [company] = await getCompany(COMPANY_UUID_1);
        const companyAccountBefore = await program.provider.connection.getParsedAccountInfo(company, "confirmed");
        assert(companyAccountBefore.value !== null, "Company account should NOT be empty");

        const args: IdlTypes<Jobs>["CreateJobListingArgs"] = {
            uuid: JOB_LISTING_UUID_1,
            title: JOB_LISTING_TITLE_1,
            location: JOB_LISTING_LOCATION_1,
            partTime: JOB_LISTING_PART_TIME_1,
            fullTime: JOB_LISTING_FULL_TIME_1,
            remote: JOB_LISTING_REMOTE_1,
            requirements: JOB_LISTING_REQUIREMENTS_1,
            description: JOB_LISTING_DESCRIPTION_1,
            link: JOB_LISTING_LINK_1,
            yearlyPayRangeStart: JOB_LISTING_YEARLY_PAY_RANGE_START_1,
            yearlyPayRangeEnd: JOB_LISTING_YEARLY_PAY_RANGE_END_1,
            hourlyPayRangeStart: JOB_LISTING_HOURLY_PAY_RANGE_START_1,
            hourlyPayRangeEnd: JOB_LISTING_HOURLY_PAY_RANGE_END_2,
        };

        await program.methods
            .createJobListing(args)
            .accounts({
                company,
                admin: company_owner.publicKey,
                jobListing
            })
            .signers([company_owner])
            .rpc({commitment: "confirmed"});

        const jobListingAccount = await program.account.jobListing.fetch(jobListing, "confirmed");
        assert(jobListingAccount.uuid === JOB_LISTING_UUID_1, "Job listing uuid should be correct");
        assert(jobListingAccount.title === JOB_LISTING_TITLE_1, "Job listing title should be correct");
        assert(jobListingAccount.location === JOB_LISTING_LOCATION_1, "Job listing location should be correct");
        assert(jobListingAccount.partTime === JOB_LISTING_PART_TIME_1, "Job listing partTime should be correct");
        assert(jobListingAccount.fullTime === JOB_LISTING_FULL_TIME_1, "Job listing fullTime should be correct");
        assert(jobListingAccount.remote === JOB_LISTING_REMOTE_1, "Job listing remote should be correct");
        assert(jobListingAccount.requirements[0] === JOB_LISTING_REQUIREMENTS_1[0], "Job listing requirements should be correct");
        assert(jobListingAccount.requirements[1] === JOB_LISTING_REQUIREMENTS_1[1], "Job listing requirements should be correct");
        assert(jobListingAccount.description === JOB_LISTING_DESCRIPTION_1, "Job listing description should be correct");
        assert(jobListingAccount.link === JOB_LISTING_LINK_1, "Job listing link should be correct");
        assert(jobListingAccount.yearlyPayRangeStart === JOB_LISTING_YEARLY_PAY_RANGE_START_1, "Job listing yearlyPayRangeStart should be correct");
        assert(jobListingAccount.yearlyPayRangeEnd === JOB_LISTING_YEARLY_PAY_RANGE_END_1, "Job listing yearlyPayRangeEnd should be correct");
        assert(jobListingAccount.hourlyPayRangeStart === JOB_LISTING_HOURLY_PAY_RANGE_START_1, "Job listing hourlyPayRangeStart should be correct");
        assert(jobListingAccount.hourlyPayRangeEnd === JOB_LISTING_HOURLY_PAY_RANGE_END_2, "Job listing hourlyPayRangeEnd should be correct");
    });

    it("Edit job listing", async() => {
        const [jobListing] = await getJobListing(JOB_LISTING_UUID_1);
        const [company] = await getCompany(COMPANY_UUID_1);
        const companyAccountBefore = await program.provider.connection.getParsedAccountInfo(company, "confirmed");
        assert(companyAccountBefore.value !== null, "Company account should NOT be empty");

        const args: IdlTypes<Jobs>["EditJobListingArgs"] = {
            title: "",
            location: "",
            partTime: !JOB_LISTING_PART_TIME_1,
            fullTime: !JOB_LISTING_FULL_TIME_1,
            remote: !JOB_LISTING_REMOTE_1,
            requirements: [],
            description: "",
            link: "",
            yearlyPayRangeStart: 1 + JOB_LISTING_YEARLY_PAY_RANGE_START_1,
            yearlyPayRangeEnd: 1 + JOB_LISTING_YEARLY_PAY_RANGE_END_1,
            hourlyPayRangeStart: 1 + JOB_LISTING_HOURLY_PAY_RANGE_START_1,
            hourlyPayRangeEnd: 1 + JOB_LISTING_HOURLY_PAY_RANGE_END_2,
        };

        await program.methods
            .editJobListing(args)
            .accounts({
                company,
                admin: company_owner.publicKey,
                jobListing
            })
            .signers([company_owner])
            .rpc({commitment: "confirmed"});

        const jobListingAccount = await program.account.jobListing.fetch(jobListing, "confirmed");
        assert(jobListingAccount.uuid === JOB_LISTING_UUID_1, "Job listing uuid should be correct");
        assert(jobListingAccount.title === "", "Job listing title should be correct");
        assert(jobListingAccount.location === "", "Job listing location should be correct");
        assert(jobListingAccount.partTime === !JOB_LISTING_PART_TIME_1, "Job listing partTime should be correct");
        assert(jobListingAccount.fullTime === !JOB_LISTING_FULL_TIME_1, "Job listing fullTime should be correct");
        assert(jobListingAccount.remote === !JOB_LISTING_REMOTE_1, "Job listing remote should be correct");
        assert(jobListingAccount.requirements.length === 0, "Job listing requirements should be correct");
        assert(jobListingAccount.description === "", "Job listing description should be correct");
        assert(jobListingAccount.link === "", "Job listing link should be correct");
        assert(jobListingAccount.yearlyPayRangeStart === 1 + JOB_LISTING_YEARLY_PAY_RANGE_START_1, "Job listing yearlyPayRangeStart should be correct");
        assert(jobListingAccount.yearlyPayRangeEnd === 1 + JOB_LISTING_YEARLY_PAY_RANGE_END_1, "Job listing yearlyPayRangeEnd should be correct");
        assert(jobListingAccount.hourlyPayRangeStart === 1 + JOB_LISTING_HOURLY_PAY_RANGE_START_1, "Job listing hourlyPayRangeStart should be correct");
        assert(jobListingAccount.hourlyPayRangeEnd === 1 + JOB_LISTING_HOURLY_PAY_RANGE_END_1, "Job listing hourlyPayRangeEnd should be correct");
    });

    it("Close Job Listings", async() => {
        const [jobListing] = await getJobListing(JOB_LISTING_UUID_1);
        const [company] = await getCompany(COMPANY_UUID_1);
        const companyAccountBefore = await program.provider.connection.getParsedAccountInfo(company, "confirmed");
        assert(companyAccountBefore.value !== null, "Company account should NOT be empty");

        const args: IdlTypes<Jobs>["CloseJobListingArgs"] = {
            areYouSure: true,
        };

        await program.methods
            .closeJobListing(args)
            .accounts({
                admin: company_owner.publicKey,
                jobListing
            })
            .signers([company_owner])
            .rpc({commitment: "confirmed"});

        const jobListingAccount = await program.provider.connection.getParsedAccountInfo(jobListing, "confirmed");
        assert(jobListingAccount.value === null, "Job Listing account IS NOT empty");
    });
});
