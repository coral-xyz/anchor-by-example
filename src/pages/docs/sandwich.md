---
title: Sandwich
description: Sandwiching Instructions
---
> [Program Code](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/sandwich)

## Background

In some cases, you want to ensure your instructions aren't accompanied by other unexpected ones.

**For example**, if you want to close an account, you want to ensure that no instruction after you close it is reopneing it.

We'll show a simple example how to allow only specific programs to accompany an instruction.

* For ease of use we use [Allowed](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/sandwich/src/states/allowed.rs)
`PDA` with no constraints on the `Signer`, in a real `program` will need to have a more strict mechanism to set the allowed `programs`.


## [One Instruction Only](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/sandwich/src/instructions/self_only.rs)

Here we allow only the current `instruction` to be executed.

We're confirming both that our `instruction` `index` is `0` and that we only have `1` `instructions` in total.

We start by passing the [instructions](https://docs.solana.com/developing/runtime-facilities/sysvars#instructions) account.

```rust
#[account(address = sysvar::instructions::id())]
instruction_sysvar_account: AccountInfo<'info>,
```

Extracting the current `instruction` `index`.

```rust
let current_index = load_current_index_checked(&instruction_sysvar_account)?;
```

Next we extract the total number of `instructions`.

```rust
read_u16(&mut current, &**data)
```

And finally we assert both requirements.

```rust
require!(current_index == 0, Errors::ExpectedInstructionToBeZero);
require!(num_instructions == 1, Errors::ExpectedOnlyOneInstruction);
```

## [Allowed Only](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/sandwich/src/instructions/allowed_only.rs)

Here we iterate all the `instructions` being passed and check each is included in `allowed` `programs`.

We start by extracting the number of total `instructions`.

```rust
read_u16(&mut current, &**data)
```

Next, we iterate all the `instructions`.

```rust
for index in 0..num_instructions
```

For each `instruction` we assert that it's in our `allowed` `programs`.

```rust
if !allowed.allowed.contains(&instruction.program_id) {
    return Err(Errors::ProgramNotAllowed.into());
}
```

## [Testing](https://github.com/coral-xyz/anchor-by-example/tree/master/programs/sandwich/tests/sandwich.ts)
