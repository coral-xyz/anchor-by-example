import * as anchor from "@project-serum/anchor";
import {IdlAccounts, IdlTypes, Program} from "@project-serum/anchor";
import { Jobs } from "../../target/types/jobs";
import {Keypair, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {airdrop} from "../helpers";
import {getApplicant, getApplication, getCompany, getJobListing} from "../pdas";
import {assert} from "chai";
import {
    APPLICANT_CONTACT_VIA_EMAIL_2,
    APPLICANT_CONTACT_VIA_WALLET_2,
    APPLICANT_EMAIL_2,
    APPLICANT_NAME_2,
    APPLICANT_RESUME_LINK_2,
    COMPANY_DESCRIPTION_2,
    COMPANY_EMAIL_2,
    COMPANY_LOGO_URL_2,
    COMPANY_NAME_2,
    COMPANY_NUMBER_OF_EMPLOYEES_2,
    COMPANY_URL_2,
    COMPANY_UUID_2,
    JOB_LISTING_DESCRIPTION_2,
    JOB_LISTING_FULL_TIME_2,
    JOB_LISTING_HOURLY_PAY_RANGE_END_2,
    JOB_LISTING_HOURLY_PAY_RANGE_START_2,
    JOB_LISTING_LINK_2,
    JOB_LISTING_LOCATION_2,
    JOB_LISTING_PART_TIME_2,
    JOB_LISTING_REMOTE_2,
    JOB_LISTING_REQUIREMENTS_2,
    JOB_LISTING_TITLE_2,
    JOB_LISTING_UUID_2,
    JOB_LISTING_YEARLY_PAY_RANGE_END_2,
    JOB_LISTING_YEARLY_PAY_RANGE_START_2
} from "../test-fixtures";

describe("Application Unit Tests", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.Jobs as Program<Jobs>;

    const company_owner = Keypair.generate()
    const user = Keypair.generate()

    it("Airdrop Applicant", async () => {
        await airdrop(program, user.publicKey, 2 * LAMPORTS_PER_SOL)
        await airdrop(program, company_owner.publicKey, 2 * LAMPORTS_PER_SOL)
    });


    it("Prep", async() => {
        const [applicant] = await getApplicant(user.publicKey);
        const applicantAccountBefore = await program.provider.connection.getParsedAccountInfo(applicant, "confirmed");
        assert(applicantAccountBefore.value === null, "Applicant account should be empty");
        const [company] = await getCompany(COMPANY_UUID_2);
        const companyAccountBefore = await program.provider.connection.getParsedAccountInfo(company, "confirmed");
        assert(companyAccountBefore.value === null, "Company account should be empty");
        const [jobListing] = await getJobListing(JOB_LISTING_UUID_2);
        const jobListingAccount = await program.provider.connection.getParsedAccountInfo(jobListing, "confirmed");
        assert(jobListingAccount.value === null, "Job listing account should be empty");
    })

    it("Create Applicant Profile", async() => {
        const [applicant] = await getApplicant(user.publicKey);
        const applicantAccountBefore = await program.provider.connection.getParsedAccountInfo(applicant, "confirmed");
        assert(applicantAccountBefore.value === null, "Applicant account should be empty");

        const args: IdlTypes<Jobs>["CreateApplicantProfileArgs"] = {
            name: APPLICANT_NAME_2,
            email: APPLICANT_EMAIL_2,
            resumeLink: APPLICANT_RESUME_LINK_2,
            contactViaEmail: APPLICANT_CONTACT_VIA_EMAIL_2,
            contactViaWallet: APPLICANT_CONTACT_VIA_WALLET_2
        }

        await program.methods
            .createApplicantProfile(args)
            .accounts({
                applicant: applicant,
                wallet: user.publicKey
            })
            .signers([user])
            .rpc({commitment: "confirmed"});

        const applicantAccount: IdlAccounts<Jobs>["applicant"] = await program.account.applicant.fetch(applicant, "confirmed");
        assert(applicantAccount.wallet.toBase58() === user.publicKey.toBase58(), "Applicant wallet should be set");
        assert(applicantAccount.name === APPLICANT_NAME_2, "Applicant name should be correct");
        assert(applicantAccount.email === APPLICANT_EMAIL_2, "Applicant email should be correct");
        assert(applicantAccount.resumeLink === APPLICANT_RESUME_LINK_2, "Applicant resume link should be correct");
        assert(applicantAccount.contactViaEmail === APPLICANT_CONTACT_VIA_EMAIL_2, "Applicant contact via email should be correct");
        assert(applicantAccount.contactViaWallet === APPLICANT_CONTACT_VIA_WALLET_2, "Applicant contact via wallet should be correct");
    })

    it("Register Company", async () => {
        const [company] = await getCompany(COMPANY_UUID_2);
        const companyAccountBefore = await program.provider.connection.getParsedAccountInfo(company, "confirmed");
        assert(companyAccountBefore.value === null, "Company account should be empty");

        const args: IdlTypes<Jobs>["RegisterCompanyArgs"] = {
            uuid: COMPANY_UUID_2,
            name: COMPANY_NAME_2,
            description: COMPANY_DESCRIPTION_2,
            logoUrl: COMPANY_LOGO_URL_2,
            email: COMPANY_EMAIL_2,
            numberOfEmployees: COMPANY_NUMBER_OF_EMPLOYEES_2,
            companyUrl: COMPANY_URL_2
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
        assert(companyAccount.uuid === COMPANY_UUID_2, "Company uuid should be correct");
        assert(companyAccount.name === COMPANY_NAME_2, "Company name should be correct");
        assert(companyAccount.description === COMPANY_DESCRIPTION_2, "Company description should be correct");
        assert(companyAccount.logoUrl === COMPANY_LOGO_URL_2, "Company logoUrl should be correct");
        assert(companyAccount.email === COMPANY_EMAIL_2, "Company email should be correct");
        assert(companyAccount.numberOfEmployees === COMPANY_NUMBER_OF_EMPLOYEES_2, "Company numberOfEmployees should be correct");
        assert(companyAccount.companyUrl === COMPANY_URL_2, "Company companyUrl should be correct");
        assert(companyAccount.admin.toBase58() === company_owner.publicKey.toBase58(), "Company admin should be correct");
    });

    it("Create a job listing", async() => {
        const [jobListing] = await getJobListing(JOB_LISTING_UUID_2);
        const [company] = await getCompany(COMPANY_UUID_2);
        const companyAccountBefore = await program.provider.connection.getParsedAccountInfo(company, "confirmed");
        assert(companyAccountBefore.value !== null, "Company account should NOT be empty");

        const args: IdlTypes<Jobs>["CreateJobListingArgs"] = {
            uuid: JOB_LISTING_UUID_2,
            title: JOB_LISTING_TITLE_2,
            location: JOB_LISTING_LOCATION_2,
            partTime: JOB_LISTING_PART_TIME_2,
            fullTime: JOB_LISTING_FULL_TIME_2,
            remote: JOB_LISTING_REMOTE_2,
            requirements: JOB_LISTING_REQUIREMENTS_2,
            description: JOB_LISTING_DESCRIPTION_2,
            link: JOB_LISTING_LINK_2,
            yearlyPayRangeStart: JOB_LISTING_YEARLY_PAY_RANGE_START_2,
            yearlyPayRangeEnd: JOB_LISTING_YEARLY_PAY_RANGE_END_2,
            hourlyPayRangeStart: JOB_LISTING_HOURLY_PAY_RANGE_START_2,
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
        assert(jobListingAccount.uuid === JOB_LISTING_UUID_2, "Job listing uuid should be correct");
        assert(jobListingAccount.title === JOB_LISTING_TITLE_2, "Job listing title should be correct");
        assert(jobListingAccount.location === JOB_LISTING_LOCATION_2, "Job listing location should be correct");
        assert(jobListingAccount.partTime === JOB_LISTING_PART_TIME_2, "Job listing partTime should be correct");
        assert(jobListingAccount.fullTime === JOB_LISTING_FULL_TIME_2, "Job listing fullTime should be correct");
        assert(jobListingAccount.remote === JOB_LISTING_REMOTE_2, "Job listing remote should be correct");
        assert(jobListingAccount.requirements[0] === JOB_LISTING_REQUIREMENTS_2[0], "Job listing requirements should be correct");
        assert(jobListingAccount.requirements[1] === JOB_LISTING_REQUIREMENTS_2[1], "Job listing requirements should be correct");
        assert(jobListingAccount.description === JOB_LISTING_DESCRIPTION_2, "Job listing description should be correct");
        assert(jobListingAccount.link === JOB_LISTING_LINK_2, "Job listing link should be correct");
        assert(jobListingAccount.yearlyPayRangeStart === JOB_LISTING_YEARLY_PAY_RANGE_START_2, "Job listing yearlyPayRangeStart should be correct");
        assert(jobListingAccount.yearlyPayRangeEnd === JOB_LISTING_YEARLY_PAY_RANGE_END_2, "Job listing yearlyPayRangeEnd should be correct");
        assert(jobListingAccount.hourlyPayRangeStart === JOB_LISTING_HOURLY_PAY_RANGE_START_2, "Job listing hourlyPayRangeStart should be correct");
        assert(jobListingAccount.hourlyPayRangeEnd === JOB_LISTING_HOURLY_PAY_RANGE_END_2, "Job listing hourlyPayRangeEnd should be correct");
    });

    it("Apply to job listing", async () => {
        const [jobListing] = await getJobListing(JOB_LISTING_UUID_2);
        const [applicant] = await getApplicant(user.publicKey);
        const [application] = await getApplication(applicant, jobListing);

        const applicationAccountBefore = await program.provider.connection.getParsedAccountInfo(application, "confirmed");
        assert(applicationAccountBefore.value === null, "Application account should be empty");

        const args: IdlTypes<Jobs>["ApplyToJobListingArgs"] = {
            areYouSure: true,
        }

        await program.methods
            .applyToJobListing(args)
            .accounts({
                wallet: user.publicKey,
                applicant,
                jobListing,
                application
            })
            .signers([user])
            .rpc({commitment: "confirmed"});

        const applicationAccount = await program.account.application.fetch(application, "confirmed");
        assert(applicationAccount.wallet.toBase58() === user.publicKey.toBase58(), "Application wallet should be correct");
        assert(applicationAccount.job.toBase58() === jobListing.toBase58(), "Application jobListing should be correct");
        assert(applicationAccount.applicant.toBase58() === applicant.toBase58(), "Application applicant should be correct");
        assert(Object.keys(applicationAccount.status)[0] === "pending",
            `Application status should be correct ${JSON.stringify(applicationAccount.status, null, 2)}`);

    });

    it("Remove application to job listing", async () => {
        const [jobListing] = await getJobListing(JOB_LISTING_UUID_2);
        const [applicant] = await getApplicant(user.publicKey);
        const [application] = await getApplication(applicant, jobListing);

        const applicationAccountBefore = await program.provider.connection.getParsedAccountInfo(application, "confirmed");
        assert(applicationAccountBefore.value !== null, "Application account should be NOT  empty");

        const args: IdlTypes<Jobs>["RemoveApplicantProfileArgs"] = {
            areYouSure: true,
        }

        await program.methods
            .removeApplicationToJobListing(args)
            .accounts({
                wallet: user.publicKey,
                applicant,
                jobListing,
                application
            })
            .signers([user])
            .rpc({commitment: "confirmed"});

        const applicationAccount = await program.account.application.fetch(application, "confirmed");
        assert(Object.keys(applicationAccount.status)[0] === "rejected",
            `Application status should be correct ${JSON.stringify(applicationAccount.status, null, 2)}`);
    });
});
