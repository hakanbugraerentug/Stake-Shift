use anchor_lang::prelude::*;
use anchor_spl::token::{self, MintTo, Transfer};
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

declare_id!("77ym1pwWp4aMpBm9U3QQhJT8W3ntY1CSmehGjaBeVddm");

#[program]
pub mod simple_staker {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>start_slot: u64, end_slot: u64) -> Result<()> {
        msg!("Instruction: Initialize");

        let pool_info = &mut ctx.accounts.pool_info;

        pool_info.admin = ctx.accounts.admin.key();
        pool_info.start_slot = start_slot;
        pool_info.end_slot = end_slot;
        pool_info.token = ctx.accounts.staking_token.key();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
