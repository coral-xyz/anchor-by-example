import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert } from "chai";
import { ModulesProgram } from "../target/types/modules_program";

describe("modules-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ModulesProgram as Program<ModulesProgram>;
  const provider = anchor.getProvider()

  const [myAccount, _myAccountCanonicalBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("my_account"), provider.publicKey.toBuffer()],
    program.programId
  )

  const value = 1

  it("My account is initialized!", async () => {
      await program.methods.initialize({
        value: value
      }).accounts({
        myAccount,
        // Anchor 0.26 typescript client has in-built account resolver. 
        // So we don't need to provide such accounts as systemProgram or signer.
        // Anchor will add them on its own!
      }).rpc()

      const myAccountFetched = await program.account.myAccount.fetch(myAccount)

      assert.equal(myAccountFetched.value, value)
  });

  it("Some rando tries to close my account", async () => {
    let random_signer = anchor.web3.Keypair.generate()

    // Random signer could not perform this action.
    // Since we added restriction to our contract.
    // Only myAccount authority may close myAccount.
    // Let's make sure we will receive an expected error.x

    let tx_error: null | string = null

    await program.methods.close().accounts({
      myAccount,
      signer: random_signer.publicKey
    }).signers([random_signer]).rpc().catch(e => tx_error = e.error.errorMessage)

    assert.equal(tx_error, 'Signer is not an authority of this account')

  })

  it("My account is closed", async () => {
    await program.methods.close().accounts({
      myAccount,
    }).rpc()

    // Account was closed, so fetch function will throw an error. 
    // Let's make sure, we could catch some error during fetch()
    let fetchError: null | string = null
    await program.account.myAccount.fetch(myAccount).catch(e => fetchError = e)
    assert.exists(fetchError)
  })
});
