import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { Program } from "@project-serum/anchor";
import { NonCustodialEscrow } from "../target/types/non_custodial_escrow";
import { LAMPORTS_PER_SOL, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

describe("solvrf", () => {
  const provider =  anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NonCustodialEscrow as Program<NonCustodialEscrow>;
  
  const seller =  provider.wallet.publicKey; // anchor.web3.Keypair.generate();
  const payer = (provider.wallet as NodeWallet).payer;

  const buyer =  anchor.web3.Keypair.generate();
  console.log(`Buyer :: `, buyer.publicKey.toString());
  
  const escrowedXTokens = anchor.web3.Keypair.generate();
  console.log(`escrowedXTokens :: `, escrowedXTokens.publicKey.toString());


  let x_mint;
  let y_mint;
  let sellers_x_token;
  let sellers_y_token;
  let buyer_x_token;
  let buyer_y_token;
  let escrow: anchor.web3.PublicKey;


  before(async() => {
    await provider.connection.requestAirdrop(buyer.publicKey, 1*LAMPORTS_PER_SOL);

    // Derive escrow address
    [escrow] = await anchor.web3.PublicKey.findProgramAddress([
      anchor.utils.bytes.utf8.encode("escrow6"),
      seller.toBuffer()
    ], 
    program.programId)

    x_mint = await splToken.Token.createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      provider.wallet.publicKey,
      6,
      splToken.TOKEN_PROGRAM_ID
    );

    console.log(`x_mint :: `, x_mint.publicKey.toString());
    
    

    y_mint = await splToken.Token.createMint(
      provider.connection,
      payer,
      provider.wallet.publicKey,
      null,
      6,
      splToken.TOKEN_PROGRAM_ID
    );

    console.log(`y_mint :: `, y_mint.publicKey.toString());

    // seller's x and y token account
    sellers_x_token = await x_mint.createAccount(seller);
    console.log(`sellers_x_token :: `, sellers_x_token.toString());

    await x_mint.mintTo(sellers_x_token, payer, [], 10_000_000_000);

    sellers_y_token = await y_mint.createAccount(seller);
    console.log(`sellers_y_token :: `, sellers_y_token.toString());

    // buyer's x and y token account
    buyer_x_token = await x_mint.createAccount(buyer.publicKey);
    console.log(`buyer_x_token :: `, buyer_x_token.toString());

    buyer_y_token = await y_mint.createAccount(buyer.publicKey);
    console.log(`buyer_y_token :: `, buyer_y_token.toString());

    await y_mint.mintTo(buyer_y_token, payer, [], 10_000_000_000);


  })

  it("Initialize escrow", async () => {
    const x_amount = new anchor.BN(40);
    const y_amount = new anchor.BN(40);
    console.log("x :: ", sellers_x_token);
    
    const tx = await program.methods.initialize(x_amount, y_amount)
      .accounts({
        seller: seller,
        xMint: x_mint.publicKey,
        yMint: y_mint.publicKey,
        sellerXToken: sellers_x_token,
        escrow: escrow,
        escrowedXTokens: escrowedXTokens.publicKey,
        tokenProgram: splToken.TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .signers([escrowedXTokens])
      .rpc({skipPreflight: true})

    console.log("TxSig :: ", tx);
  });

  it("Execute the trade", async () => { 
    const tx = await program.methods.execute()
      .accounts({
        buyer: buyer.publicKey,
        escrow: escrow,
        escrowedXTokens: escrowedXTokens.publicKey,
        sellersYTokens: sellers_y_token,
        buyerXTokens: buyer_x_token,
        buyerYTokens: buyer_y_token,
        tokenProgram: splToken.TOKEN_PROGRAM_ID
      })
      .signers([buyer])
      .rpc({skipPreflight: true})
  });

  it("Cancle the trade", async () => { 
    const tx = await program.methods.cancel()
    .accounts({
      seller: seller,
      escrow: escrow,
      escrowedXTokens: escrowedXTokens.publicKey,
      sellerXToken: sellers_x_token,
      tokenProgram: splToken.TOKEN_PROGRAM_ID
    })
    .rpc({skipPreflight: true})
  });
});