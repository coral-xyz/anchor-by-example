// This is a module file. This file declares module and it's content.
// lib.rs imports only this particular file, 'mod.rs'.
// Since we want to introduce content of './initialize.rs' and './close.rs' files
// We 'use" them in this file and declare them as modules with 'mod'

pub use initialize::*;
pub use close::*;

pub mod initialize;
pub mod close;

// We keep all instructions logic and context here.