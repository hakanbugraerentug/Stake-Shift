use anchor_lang::prelude::*;
use std::str::FromStr;
use anchor_lang::solana_program::{
    program::invoke_signed,
    pubkey::Pubkey,
    stake::instruction as stake_instruction,
    stake::state::{Authorized, Lockup, StakeStateV2},
    stake::program::ID as STAKE_PROGRAM_ID,
    system_instruction,
};

declare_id!("5Zu7m2csVoiKPAFkqBjPkW3Gs7PGDkLktg9DopbD8Jty");

// Hardcoded public key for the Stake Config Sysvar
const STAKE_CONFIG_PUBKEY: &str = "StakeConfig11111111111111111111111111111111";


#[program]
mod stakeshift {
    use super::*;

    pub fn create_stake_account(
        ctx: Context<CreateStakeAccount>,
        lamports: u64,
    ) -> Result<()> {
        let initializer = &ctx.accounts.initializer;
        let stake_account = &ctx.accounts.stake_account;
        let program_pda = &ctx.accounts.program_pda;

        let initializer_key = initializer.key();
        let (stake_account_key, bump_seed) = Pubkey::find_program_address(
            &[b"stake17", initializer_key.as_ref()],
            ctx.program_id,
        );
        let seeds = &[b"stake17", initializer_key.as_ref(), &[bump_seed]];

        let create_account_instruction = system_instruction::create_account(
            &initializer_key,
            &stake_account_key,
            lamports,
            std::mem::size_of::<StakeStateV2>() as u64,
            &STAKE_PROGRAM_ID,
        );
}
}
#[derive(Accounts)]
pub struct CreateStakeAccount<'info> {
    #[account(mut)]
    pub staker: Signer<'info>,
    /// CHECK: This is safe because we're only using it as a key
    #[account(mut)]
    pub validator_vote_account: UncheckedAccount<'info>,
    #[account(mut)]
    pub stake_account: Signer<'info>,
    pub system_program: Program<'info, System>,
}
