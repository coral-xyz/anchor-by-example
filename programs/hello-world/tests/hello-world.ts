import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { HelloWorld } from "../target/types/hello_world";

describe("hello-world", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.HelloWorld as Program<HelloWorld>;

  it("Mic testing - Hello world", async () => {
    const tx = await program.methods.helloWorld().rpc();
    console.log("Your transaction signature", tx);
  });
});
