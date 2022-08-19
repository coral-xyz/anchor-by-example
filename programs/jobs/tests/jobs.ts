import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Jobs } from "../target/types/jobs";

describe("Integration Tests", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Jobs as Program<Jobs>;

  it("Is initialized!", async () => {
    // Add your test here.
  });
});
