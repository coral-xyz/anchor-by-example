import * as anchor from "@project-serum/anchor";
import {IdlTypes, Program} from "@project-serum/anchor";
import { Sandwich } from "../target/types/sandwich";
import {Keypair, LAMPORTS_PER_SOL, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY} from "@solana/web3.js";
import {airdrop, getTxn, processTransaction} from "./helper";
import * as assert from "assert";
import {getAllowed} from "./pda";
import {createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, NATIVE_MINT} from "@solana/spl-token";

describe("sandwich", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.Sandwich as Program<Sandwich>;
    const user = Keypair.generate();
    const anotherUser = Keypair.generate();

    it("Airdrop", async() => {
        await airdrop(program, user.publicKey, LAMPORTS_PER_SOL);
        await airdrop(program, anotherUser.publicKey, LAMPORTS_PER_SOL);
    });

    it("Create Allowed", async () => {
        const [allowed] = await getAllowed();

        const args: IdlTypes<Sandwich>["SetAllowedArgs"] = {
            allowed: [
                program.programId,
                SystemProgram.programId
            ]
        }

        await program.methods
            .setAllowed(args)
            .accounts({
                allowed,
                user: user.publicKey
            })
            .signers([user])
            .rpc({commitment: "confirmed"})

        const allowedAccount = await program.account.allowed.fetch(allowed);
        assert.deepEqual(allowedAccount.allowed, args.allowed);
    })

    it("Self Only - Success", async () => {
        const instructions = [];

        instructions.push(await program.methods
            .selfOnly().accounts({
                user: user.publicKey,
                instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY
            })
            .signers([user])
            .instruction()
        )

        const result = await processTransaction(instructions, program.provider.connection, user);
        const txn = await getTxn(program, result.Signature);
        assert.equal(result.SignatureResult.err, null, `Transaction failed:\n${txn.meta.logMessages}`);
    });

    it("Self Only - Fail due to Pre Instruction", async () => {
        const instructions = [];

        instructions.push(
            SystemProgram.transfer({
                fromPubkey: user.publicKey,
                toPubkey: anotherUser.publicKey,
                lamports: LAMPORTS_PER_SOL * 0.01,
            }));

        instructions.push(await program.methods
            .selfOnly().accounts({
                user: user.publicKey,
                instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY
            })
            .signers([user])
            .instruction()
        )

        const result = await processTransaction(instructions, program.provider.connection, user);
        const txn = await getTxn(program, result.Signature);
        assert.notEqual(result.SignatureResult.err, null, `Transaction should fail:\n${txn.meta.logMessages}`);
    });

    it("Self Only - Fail due to Post Instruction", async () => {
        const instructions = [];

        instructions.push(await program.methods
            .selfOnly().accounts({
                user: user.publicKey,
                instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY
            })
            .signers([user])
            .instruction()
        )

        instructions.push(
            SystemProgram.transfer({
                fromPubkey: user.publicKey,
                toPubkey: anotherUser.publicKey,
                lamports: LAMPORTS_PER_SOL * 0.01,
            }))

        const result = await processTransaction(instructions, program.provider.connection, user);
        const txn = await getTxn(program, result.Signature);
        assert.notEqual(result.SignatureResult.err, null, `Transaction should fail:\n${txn.meta.logMessages}`);
    });

    it("Allowed Only (only self program) - Success", async () => {
        const [allowed] = await getAllowed();
        const instructions = [];

        instructions.push(await program.methods
            .allowedOnly().accounts({
                user: user.publicKey,
                instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
                allowed
            })
            .signers([user])
            .instruction()
        );
        const result = await processTransaction(instructions, program.provider.connection, user);
        const txn = await getTxn(program, result.Signature);
        assert.equal(result.SignatureResult.err, null, `Transaction failed:\n${txn.meta.logMessages}`);
    });

    it("Allowed And Transfer) - Success", async () => {
        const [allowed] = await getAllowed();
        const instructions = [];

        instructions.push(
            SystemProgram.transfer({
                fromPubkey: user.publicKey,
                toPubkey: anotherUser.publicKey,
                lamports: LAMPORTS_PER_SOL * 0.01,
            }))

        instructions.push(await program.methods
            .allowedOnly().accounts({
                user: user.publicKey,
                allowed,
                instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY
            })
            .signers([user])
            .instruction()
        );
        const result = await processTransaction(instructions, program.provider.connection, user);
        const txn = await getTxn(program, result.Signature);
        assert.equal(result.SignatureResult.err, null, `Transaction failed:\n${txn.meta.logMessages}`);
    });

    it("Allowed And Token - Failure", async () => {
        const [allowed] = await getAllowed();
        const instructions = [];
        const ata = await getAssociatedTokenAddress(NATIVE_MINT, user.publicKey);

        instructions.push(createAssociatedTokenAccountInstruction(user.publicKey, ata, user.publicKey, NATIVE_MINT));

        instructions.push(await program.methods
            .allowedOnly().accounts({
                user: user.publicKey,
                allowed,
                instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY
            })
            .signers([user])
            .instruction()
        );
        const result = await processTransaction(instructions, program.provider.connection, user);
        const txn = await getTxn(program, result.Signature);
        assert.notEqual(result.SignatureResult.err, null, `Transaction failed:\n${txn.meta.logMessages.join("\n")}`);
    });
});
