interface MatchResult {
  matchedAmount: number;
  remainingAmount: number;
}

interface Transaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
}

export class MatchingService {
  private transactions: Transaction[] = [];
  private matches: Map<string, MatchResult> = new Map();

  updateTransactions(transactions: Transaction[]) {
    this.transactions = transactions;
    this.calculateMatches();
  }

  private calculateMatches() {
    this.matches.clear();
    
    // First handle direct cycles
    this.transactions.forEach(tx => {
      const directMatch = this.transactions.find(t => 
        t !== tx && 
        t.from === tx.to && 
        t.to === tx.from
      );

      if (directMatch) {
        const matchedAmount = Math.min(tx.amount, directMatch.amount);
        const remainingAmount = Math.abs(tx.amount - directMatch.amount);
        const isLargerTx = tx.amount > directMatch.amount;

        this.matches.set(this.getTransactionKey(tx), {
          matchedAmount,
          remainingAmount: isLargerTx ? remainingAmount : 0
        });
        return; // Skip triangle check if direct match found
      }

      // Check for triangle matches
      const triangleMatch = this.findTriangleMatch(tx);
      if (triangleMatch) {
        const { matchedAmount, remainingAmount } = triangleMatch;
        this.matches.set(this.getTransactionKey(tx), {
          matchedAmount,
          remainingAmount
        });
      } else {
        this.matches.set(this.getTransactionKey(tx), {
          matchedAmount: 0,
          remainingAmount: tx.amount
        });
      }
    });
  }

  private findTriangleMatch(tx: Transaction): MatchResult | null {
    // Look for A->B->C->A pattern
    const secondLeg = this.transactions.find(t => t.from === tx.to);
    if (!secondLeg) return null;

    const thirdLeg = this.transactions.find(t => 
      t.from === secondLeg.to && 
      t.to === tx.from
    );
    if (!thirdLeg) return null;

    // Found a triangle, calculate matched amount
    const minAmount = Math.min(tx.amount, secondLeg.amount, thirdLeg.amount);
    return {
      matchedAmount: minAmount,
      remainingAmount: tx.amount - minAmount
    };
  }

  getMatchResult(tx: Transaction): MatchResult {
    return this.matches.get(this.getTransactionKey(tx)) || {
      matchedAmount: 0,
      remainingAmount: tx.amount
    };
  }

  private getTransactionKey(tx: Transaction): string {
    return `${tx.from}-${tx.to}-${tx.amount}-${tx.timestamp}`;
  }
}

export const matchingService = new MatchingService(); 