use anchor_lang::prelude::*;
use std::collections::HashMap;

declare_id!("2h8AUNUnGPg1RBLEhi6K82rLBypBmp5gHoSAGwBArp3X");

#[program]
pub mod splitwise_sol {
    use super::*;

    pub fn process_transactions(
        ctx: Context<ProcessTransactions>,
        transactions: Vec<TransactionInput>,
    ) -> Result<Vec<TransactionOutput>> {
        let mut balances: HashMap<String, i64> = HashMap::new();

        // Step 1: Calculate net balances from transactions
        for transaction in transactions.iter() {
            let giver = transaction.giver.clone();
            let receiver = transaction.receiver.clone();
            let amount = transaction.amount;

            *balances.entry(giver).or_insert(0) -= amount;
            *balances.entry(receiver).or_insert(0) += amount;
        }

        // Step 2: Create vectors of creditors and debtors
        let mut creditors: Vec<(String, i64)> = balances
            .iter()
            .filter(|(_, &balance)| balance > 0)
            .map(|(person, &balance)| (person.clone(), balance))
            .collect();
        let mut debtors: Vec<(String, i64)> = balances
            .iter()
            .filter(|(_, &balance)| balance < 0)
            .map(|(person, &balance)| (person.clone(), balance.abs()))
            .collect();

        let mut minimized_transactions: Vec<TransactionOutput> = vec![];

        // Step 3: Match debtors and creditors to minimize transactions
        let mut i = 0;
        let mut j = 0;

        while i < debtors.len() && j < creditors.len() {
            let debtor = &mut debtors[i];
            let creditor = &mut creditors[j];
            let settle_amount = debtor.1.min(creditor.1);

            minimized_transactions.push(TransactionOutput {
                from: debtor.0.clone(),
                to: creditor.0.clone(),
                amount: settle_amount,
            });

            debtor.1 -= settle_amount;
            creditor.1 -= settle_amount;

            if debtor.1 == 0 {
                i += 1;
            }
            if creditor.1 == 0 {
                j += 1;
            }
        }

        // Log minimized transactions
        for tx in minimized_transactions.iter() {
            msg!(
                "Transaction: {} pays {} {} lamports",
                tx.from,
                tx.to,
                tx.amount
            );
        }

        Ok(minimized_transactions)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TransactionInput {
    pub giver: String,
    pub receiver: String,
    pub amount: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct TransactionOutput {
    pub from: String,
    pub to: String,
    pub amount: i64,
}

#[derive(Accounts)]
pub struct ProcessTransactions<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
}
