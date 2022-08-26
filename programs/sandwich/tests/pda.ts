import {PublicKey} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
import { Sandwich } from "../target/types/sandwich";

const program = anchor.workspace.Sandwich as Program<Sandwich>;
const PROGRAM_ID = program.programId;
const ALLOWED: string = "ALLOWED";

export async function getAllowed(): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
        Buffer.from(anchor.utils.bytes.utf8.encode(ALLOWED)),
    ], PROGRAM_ID);
}