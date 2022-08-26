import * as anchor from "@project-serum/anchor";
import { Program, IdlAccounts, IdlTypes } from "@project-serum/anchor"
import { Jobs } from "../../target/types/jobs";
import {Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";
import {airdrop} from "../helpers";
import {getApplicant} from "../pdas";
import {assert} from "chai";
import {
    APPLICANT_CONTACT_VIA_EMAIL_1,
    APPLICANT_CONTACT_VIA_WALLET_1,
    APPLICANT_EMAIL_1,
    APPLICANT_NAME_1,
    APPLICANT_RESUME_LINK_1
} from "../test-fixtures";


describe("Applicant Unit Tests", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.Jobs as Program<Jobs>;
    const user = Keypair.generate()

    it("Airdrop Applicant", async () => {
        await airdrop(program, user.publicKey, LAMPORTS_PER_SOL)
    });

    it("Create Applicant Profile", async() => {
        const [applicant] = await getApplicant(user.publicKey);
        const applicantAccountBefore = await program.provider.connection.getParsedAccountInfo(applicant, "confirmed");
        assert(applicantAccountBefore.value === null, "Applicant account should be empty");

        const args: IdlTypes<Jobs>["CreateApplicantProfileArgs"] = {
            name: APPLICANT_NAME_1,
            email: APPLICANT_EMAIL_1,
            resumeLink: APPLICANT_RESUME_LINK_1,
            contactViaEmail: APPLICANT_CONTACT_VIA_EMAIL_1,
            contactViaWallet: APPLICANT_CONTACT_VIA_WALLET_1
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
        assert(applicantAccount.name === APPLICANT_NAME_1, "Applicant name should be correct");
        assert(applicantAccount.email === APPLICANT_EMAIL_1, "Applicant email should be correct");
        assert(applicantAccount.resumeLink === APPLICANT_RESUME_LINK_1, "Applicant resume link should be correct");
        assert(applicantAccount.contactViaEmail === APPLICANT_CONTACT_VIA_EMAIL_1, "Applicant contact via email should be correct");
        assert(applicantAccount.contactViaWallet === APPLICANT_CONTACT_VIA_WALLET_1, "Applicant contact via wallet should be correct");
    })
});
