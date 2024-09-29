---
title: Hello World
description: Anchor - Hello World
---
> [Program Code](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/hello-world)

This program will `log` our hello world message into program's on-chain transaction log. We will simply use `msg!()` macro for logging the hello world.

To initialize the project, simply run:
```shell
anchor init hello-world
```
## Program's Code
Let's write our first hello world program a.k.a smart contract in anchor or just copy-pasta the following code into your `lib.rs` file 😉.
```rust
use anchor_lang::prelude::*;
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
#[program]
pub mod hello_world {
    use super::*;
    pub fn hello_world(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello world, from solana smart contract");
        Ok(())
    }
}
#[derive(Accounts)]
pub struct Initialize {}

```
Now compile and build this program, by simply running:
```shell
anchor build
```
## Test
Now It's time to write a test for our program! Copy-pasta the following code into your `hello-world.ts` file in tests folder in the root directory.
```typescript
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
```

## Deployment 🎉
Time to deploy and test our first hello world smart contract, yay! 

We are going to deploy on `devnet`. Here is our deployment checklist 🚀

1. Run `anchor build`. Your program keypair is now in `target/deploy`. Keep this keypair secret 🤫.
2. Run `anchor keys list` to display the keypair's public key and copy it into your `declare_id!` macro at the top of `lib.rs`.
3. Run `anchor build` again. This step is necessary to include the new program id in the binary.
4. Change the `provider.cluster` variable in `Anchor.toml` to `devnet`.
5. Run `anchor deploy`
6. Run `anchor test`

## On-Chain Result
```shell
> Program logged: "Instruction: HelloWorld"
> Program logged: "Hello world, from solana smart contract"
> Program consumed: 452 of 200000 compute units
> Program returned success
```

[Program's transaction log](https://explorer.solana.com/tx/2ojq4hG1fUJqxw4t4qBkbW2WFPyxoj2FkVvTuTvguVFLCwFgxTfJdAanhgQjLpNpuP7p1Hsy6E4f2G7u9ZZn9goB?cluster=devnet#ix-1)