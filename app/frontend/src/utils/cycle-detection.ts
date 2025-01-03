import { StakeTransfer, CycleInfo } from '../types/transaction';
import { AccountInfo, ParsedAccountData } from '@solana/web3.js';

export function parseTransferFromAccountInfo(
  accountInfo: AccountInfo<Buffer | ParsedAccountData>
): StakeTransfer | null {
  try {
    const data = accountInfo.data as Buffer;
    // Parse your program's account data structure
    return {
      from: data.slice(0, 32).toString('hex'),
      to: data.slice(32, 64).toString('hex'),
      amount: data.readBigUInt64LE(64).toString(),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Failed to parse transfer:', error);
    return null;
  }
}

export function findDirectCycles(transfers: StakeTransfer[]): CycleInfo[] {
  const cycles: CycleInfo[] = [];
  const seen = new Set<string>();

  transfers.forEach(t1 => {
    transfers.forEach(t2 => {
      if (t1.from === t2.to && t1.to === t2.from) {
        const key = [t1.from, t1.to].sort().join('-');
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push({
            type: 'direct',
            nodes: [t1.from, t1.to],
            amounts: [t1.amount, t2.amount],
            timestamp: Math.max(t1.timestamp, t2.timestamp)
          });
        }
      }
    });
  });

  return cycles;
}

export function findTriangleCycles(transfers: StakeTransfer[]): CycleInfo[] {
  const cycles: CycleInfo[] = [];
  const seen = new Set<string>();

  transfers.forEach(t1 => {
    transfers.forEach(t2 => {
      if (t1.to === t2.from) {
        transfers.forEach(t3 => {
          if (t2.to === t3.from && t3.to === t1.from) {
            const key = [t1.from, t2.from, t3.from].sort().join('-');
            if (!seen.has(key)) {
              seen.add(key);
              cycles.push({
                type: 'triangle',
                nodes: [t1.from, t2.from, t3.from],
                amounts: [t1.amount, t2.amount, t3.amount],
                timestamp: Math.max(t1.timestamp, t2.timestamp, t3.timestamp)
              });
            }
          }
        });
      }
    });
  });

  return cycles;
}

export function updateStats(directCycles: CycleInfo[], triangleCycles: CycleInfo[]) {
  return {
    totalTransactions: directCycles.length + triangleCycles.length,
    directCycles: directCycles.length,
    triangleCycles: triangleCycles.length,
    potentialSavings: directCycles.reduce((total, cycle) => {
      // For direct cycles, savings is the minimum amount that could be avoided
      const [amount1, amount2] = cycle.amounts.map(a => Number(a));
      return total + Math.min(amount1, amount2) / 1e9;
    }, 0)
  };
} 