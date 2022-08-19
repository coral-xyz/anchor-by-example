import * as anchor from "@project-serum/anchor";
import {IdlAccounts, IdlTypes, Program} from "@project-serum/anchor";
import { Jobs } from "../../target/types/jobs";
import {Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {airdrop} from "../helpers";
import {getCompany} from "../pdas";
import {
    COMPANY_DESCRIPTION_1,
    COMPANY_EMAIL_1,
    COMPANY_LOGO_URL_1,
    COMPANY_NAME_1, COMPANY_NUMBER_OF_EMPLOYEES_1, COMPANY_URL_1,
    COMPANY_UUID_1
} from "../test-fixtures";
import {assert} from "chai";

describe("Company Unit Tests", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.Jobs as Program<Jobs>;
    const user = Keypair.generate()

    it("Airdrop Applicant", async () => {
        await airdrop(program, user.publicKey, LAMPORTS_PER_SOL)
    });

    it("Register Company", async () => {
        const [company] = await getCompany(COMPANY_UUID_1);
        const compnayAccountBefore = await program.provider.connection.getParsedAccountInfo(company, "confirmed");
        assert(compnayAccountBefore.value === null, "Company account should be empty");

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
                admin: user.publicKey,
            })
            .signers([user])
            .rpc({commitment: "confirmed"});


        const companyAccount: IdlAccounts<Jobs>["company"] = await program.account.company.fetch(company, "confirmed");
        assert(companyAccount.uuid === COMPANY_UUID_1, "Company uuid should be correct");
        assert(companyAccount.name === COMPANY_NAME_1, "Company name should be correct");
        assert(companyAccount.description === COMPANY_DESCRIPTION_1, "Company description should be correct");
        assert(companyAccount.logoUrl === COMPANY_LOGO_URL_1, "Company logoUrl should be correct");
        assert(companyAccount.email === COMPANY_EMAIL_1, "Company email should be correct");
        assert(companyAccount.numberOfEmployees === COMPANY_NUMBER_OF_EMPLOYEES_1, "Company numberOfEmployees should be correct");
        assert(companyAccount.companyUrl === COMPANY_URL_1, "Company companyUrl should be correct");
        assert(companyAccount.admin.toBase58() === user.publicKey.toBase58(), "Company admin should be correct");
    });

    it("Remove company", async () => {
        const [company] = await getCompany(COMPANY_UUID_1);
        const companyAccount: IdlAccounts<Jobs>["company"] = await program.account.company.fetch(company, "confirmed");
        assert(companyAccount.uuid === COMPANY_UUID_1, "Company uuid should be correct");
        assert(companyAccount.name === COMPANY_NAME_1, "Company name should be correct");
        assert(companyAccount.description === COMPANY_DESCRIPTION_1, "Company description should be correct");
        assert(companyAccount.logoUrl === COMPANY_LOGO_URL_1, "Company logoUrl should be correct");
        assert(companyAccount.email === COMPANY_EMAIL_1, "Company email should be correct");
        assert(companyAccount.numberOfEmployees === COMPANY_NUMBER_OF_EMPLOYEES_1, "Company numberOfEmployees should be correct");
        assert(companyAccount.companyUrl === COMPANY_URL_1, "Company companyUrl should be correct");
        assert(companyAccount.admin.toBase58() === user.publicKey.toBase58(), "Company admin should be correct");

        const args: IdlTypes<Jobs>["RemoveCompanyArgs"] = {
            areYouSure: true,
        };

        await program.methods
            .removeCompany(args)
            .accounts({
                company: company,
                admin: user.publicKey,
            })
            .signers([user])
            .rpc({commitment: "confirmed"});

        const compnayAccountAfter = await program.provider.connection.getParsedAccountInfo(company, "confirmed");
        assert(compnayAccountAfter.value === null, "Company account should be empty");
      });
});
