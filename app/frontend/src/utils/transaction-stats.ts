import { StakeTransfer } from '../types/transaction';

interface Transaction {
  amount: number;
}

export function updateTransactionStats(transactions: Transaction[]) {
  return {
    totalTransactions: transactions.length,
    totalValue: transactions.reduce((sum, tx) => sum + tx.amount, 0),
    averageAmount: transactions.length ? 
      transactions.reduce((sum, tx) => sum + tx.amount, 0) / transactions.length : 
      0
  };
} 