import {PublicKey} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
export const APPLICANT: string = "APPLICANT";
export const APPLICATION: string = "APPLICATION";
export const COMPANY: string = "COMPANY";
export const JOB_LISTING: string = "JOB_LISTING";
export const PROGRAM_ID = new PublicKey("FoBEskU4Q36cqo9PUAG1eeFB41YNrpbQ3dSHYtNgvLJ")

export async function getApplicant(wallet: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
            Buffer.from(anchor.utils.bytes.utf8.encode(APPLICANT)),
            wallet.toBuffer()
        ],
        PROGRAM_ID);
}

export async function getApplication(applicant: PublicKey, job_listing: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
            Buffer.from(anchor.utils.bytes.utf8.encode(APPLICATION)),
            applicant.toBuffer(),
            job_listing.toBuffer()
        ],
        PROGRAM_ID);
}

export async function getCompany(uuid: string): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
            Buffer.from(anchor.utils.bytes.utf8.encode(COMPANY)),
            Buffer.from(anchor.utils.bytes.utf8.encode(uuid)),
        ],
        PROGRAM_ID);
}

export async function getJobListing(uuid: string): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
            Buffer.from(anchor.utils.bytes.utf8.encode(JOB_LISTING)),
            Buffer.from(anchor.utils.bytes.utf8.encode(uuid)),
        ],
        PROGRAM_ID);
}

