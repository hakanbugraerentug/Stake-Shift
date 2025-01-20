use anchor_lang::prelude::*;
use anchor_lang::solana_program::log::sol_log;

#[program]
mod transaction_manager {
    use super::*;

    pub fn add_transaction(ctx: Context<AddTransaction>, giver: String, receiver: String, amount: u64) -> Result<()> {
        let transaction = Transaction {
            giver,
            receiver,
            amount,
        };

        let account = &mut ctx.accounts.transaction_account;
        account.transactions.push(transaction);

        Ok(())
    }

    pub fn resolve_transactions(ctx: Context<ResolveTransactions>) -> Result<()> {
        let account = &mut ctx.accounts.transaction_account;

        for transaction in &account.transactions {
            sol_log(&format!(
                "Giver: {}, Receiver: {}, Amount: {}",
                transaction.giver, transaction.receiver, transaction.amount
            ));
        }

        account.transactions.clear();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct AddTransaction<'info> {
    #[account(mut)]
    pub transaction_account: Account<'info, TransactionAccount>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveTransactions<'info> {
    #[account(mut)]
    pub transaction_account: Account<'info, TransactionAccount>,
    pub user: Signer<'info>,
}

#[account]
pub struct TransactionAccount {
    pub transactions: Vec<Transaction>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Transaction {
    pub giver: String,
    pub receiver: String,
    pub amount: u64,
}
