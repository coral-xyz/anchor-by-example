import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SelfCustodialFacebook } from "../target/types/self_custodial_facebook";

describe('self-custodial-facebook', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.SelfCustodialFacebook as Program<SelfCustodialFacebook>

  it('Creating a new account for user', async () => {
    const ix = await program.methods.createFacebook(
      'Deep',
      'always tinkring',
      '0xdeep'
    )
    const userFacebookAddress = (await ix.pubkeys()).facebookAccount
    console.log('User facebook address :: ', userFacebookAddress.toString())

    // Create user's facebook address
    const tx = await ix.rpc()
    console.log('Your transaction signature', tx)

    // User Details
    let userDetails = await program.account.facebookAccount.fetch(
      userFacebookAddress
    )
    console.log(
      `Created a new account with following details \n Name :: ${userDetails.name} \n Status :: ${userDetails.status} \n Twitter :: ${userDetails.twitter}`
    )
  })

  it('Update My Status', async () => {
    const ix = await program.methods.updateStatus('&mut self :crab')
    const userFacebookAddress = (await ix.pubkeys()).facebookAccount
    console.log('usrFaceBook Address :: ', userFacebookAddress.toString())

    // Create user's facebook address
    const tx = await ix.rpc()
    console.log('Your transaction signature', tx)

    // User Details
    let userDetails = await program.account.facebookAccount.fetch(
      userFacebookAddress
    )
    console.log(
      `Created a new account with following details \n Name :: ${userDetails.name} \n Status :: ${userDetails.status} \n Twitter :: ${userDetails.twitter}`
    )
  })

  it("Find Someone's Facebook", async () => {
    const userAddress = new anchor.web3.PublicKey(
      'Gz2k7789kKnoeDo9TWXpCmSudp5DW22u8FtnRcFS5aS6'
    )
    const [userFacebookAccount, _] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode('self-custodial-facebook2'),
          userAddress.toBuffer(),
        ],
        program.programId
      )


    try {
      let userDetails = await program.account.facebookAccount.fetch(userFacebookAccount);
      console.log(
        `Created a new account with following details \n Name :: ${userDetails.name} \n Status :: ${userDetails.status} \n Twitter :: ${userDetails.twitter}`
      )
    } catch (error) {
      console.log("Users account does not exist :: ", error) 
    }
  })

  it('Close My Facebook Account', async () => {
    const ix = await program.methods.deleteAccount()
    const userFacebookAddress = (await ix.pubkeys()).facebookAccount
    console.log('usrFaceBook Address :: ', userFacebookAddress.toString())

    // Create user's facebook address
    const tx = await ix.rpc()
    console.log('Your transaction signature', tx)

    // User Details Not found, 'cuz we close the account
    try {
      let userDetails = await program.account.facebookAccount.fetch(
        userFacebookAddress
      )
      console.log(
        `Created a new account with following details \n Name :: ${userDetails.name} \n Status :: ${userDetails.status} \n Twitter :: ${userDetails.twitter}`
      )
    } catch {
      console.log("User Details Not found, 'cuz we close the account")
    }
  })
})