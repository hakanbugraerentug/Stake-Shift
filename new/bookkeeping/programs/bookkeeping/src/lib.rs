use anchor_lang::prelude::*;

declare_id!("BtSZDMEWUNjHi38dqbxf1qxBahf4vtUn8HurZxSE85px");

#[program]
pub mod bookkeeping {
    use super::*;

    pub fn create_ledger(
        ctx: Context<CreateLedger>,
        validator_pk: String,
    ) -> Result<()> {

        let ledger_account = &mut ctx.accounts.ledger_account;
        ledger_account.validator_pk = validator_pk;
        ledger_account.balance = 0;
        
        Ok(())
    }

    pub fn modify_ledger(
        ctx: Context<ModifyLedger>,
        new_balance: u32,
    ) -> Result<()> {

        let ledger_account = &mut ctx.accounts.ledger_account;
        
        ledger_account.balance = new_balance;
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(validator_pk: String)]
pub struct CreateLedger<'info> {
    #[account(
        init,
        payer = wallet,
        space = 8 + 32 + 32 + 8,
        seeds = [
            wallet.key().as_ref(),
            b"_",
            validator_pk.as_ref(),
        ],
        bump
    )]
    pub ledger_account: Account<'info, Ledger>,
    #[account(mut)]
    pub wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ModifyLedger<'info> {
    #[account(mut)]
    pub ledger_account: Account<'info, Ledger>,
    #[account(mut)]
    pub wallet: Signer<'info>,
}

#[account]
pub struct Ledger {
    pub validator_pk: String,
    pub balance: u32,
}

// Custom errors
#[error_code]
pub enum CustomError {
    #[msg("Unauthorized user attempting to update balance.")]
    UnauthorizedUser,

    #[msg("Balance cannot be zero.")]
    InvalidBalance,
}
