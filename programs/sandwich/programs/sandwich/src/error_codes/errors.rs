use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("Expected Instruction to be Zero")]
    ExpectedInstructionToBeZero,
    #[msg("Unexpected Program Instruction")]
    UnexpectedProgramInstruction,
    #[msg("Failed to Read Number Of Instructions")]
    FailedToReadNumberOfInstructions,
    #[msg("Expected Only One Instruction")]
    ExpectedOnlyOneInstruction,
    #[msg("Program Not Allowed")]
    ProgramNotAllowed,
}
