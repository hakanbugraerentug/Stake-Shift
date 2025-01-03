import type { TransactionHistory } from "../types/transaction";
import { useState } from "react";

export function TransactionHistory() {
  const [transactions] = useState<TransactionHistory[]>([]);
  
  return (
    <div className="p-4 bg-white dark:bg-dark-card rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th>Date</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.signature}>
              <td>{tx.date}</td>
              <td>{tx.from}</td>
              <td>{tx.to}</td>
              <td>{tx.amount} SHIFT</td>
              <td>{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 