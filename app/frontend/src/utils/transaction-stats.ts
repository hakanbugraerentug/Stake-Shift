import { StakeTransfer } from '../types/transaction';

export function updateTransactionStats(transactions: StakeTransfer[]) {
  const totalTransactions = transactions.length;
  const totalValue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const averageAmount = totalValue / totalTransactions;

  return {
    totalTransactions,
    totalValue,
    averageAmount,
    lastUpdated: Date.now()
  };
} 