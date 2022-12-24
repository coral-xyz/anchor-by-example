// This is a module file. This file declares module and it's content.
// lib.rs imports only this particular file, 'mod.rs'.
// Since we want to introduce content of './my_account.rs' file
// We 'use" it in this file and declare it as modules with 'mod'

pub use my_account::*;

pub mod my_account;


// We keep all static structs declarations here. These include Program Account structs and instructions data structs.