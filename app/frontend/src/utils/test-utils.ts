import { testProfiles } from '../data/test-profiles';
import { findAndProcessCycles } from './cycle-processor';
import { updateTransactionStats } from './transaction-stats';

let runCount = 0;

export async function runTestProfile(profileKey: string) {
  runCount++;
  const profile = testProfiles[profileKey];
  
  if (runCount > 1) {
    const newValidator = `Validator${runCount}`;
    const timestamp = Date.now();
    const baseAmount = 10.00;

    // Create new cycle with different amounts
    const amount1 = Number((baseAmount + (runCount * 1.5)).toFixed(2));
    const amount2 = Number((baseAmount + (runCount * 2)).toFixed(2));

    const newCycle = {
      type: 'direct',
      addresses: [newValidator, "Validator1"],
      amounts: [amount1, amount2],
      timestamp,
      transactions: [
        {
          from: newValidator,
          to: "Validator1",
          amount: amount1,
          timestamp,
          status: 'confirmed',
          signature: `new-tx-${timestamp}`
        },
        {
          from: "Validator1",
          to: newValidator,
          amount: amount2,
          timestamp: timestamp + 1000,
          status: 'confirmed',
          signature: `new-tx-${timestamp + 1}`
        }
      ]
    };

    profile.transactions.push(...newCycle.transactions);
    profile.cycles.direct.push(newCycle);
    profile.cycles.direct.sort((a, b) => b.timestamp - a.timestamp);
  }

  const cycleResults = {
    directCycles: profile.cycles.direct.slice().sort((a, b) => b.timestamp - a.timestamp),
    triangleCycles: profile.cycles.triangle,
    stats: {
      totalDirectCycles: profile.cycles.direct.length,
      totalTriangleCycles: profile.cycles.triangle.length,
      potentialSavings: calculatePotentialSavings(profile.cycles.direct, profile.cycles.triangle)
    }
  };

  const transactionStats = updateTransactionStats(profile.transactions);

  return {
    cycles: cycleResults,
    stats: {
      ...transactionStats,
      totalDirectCycles: cycleResults.stats.totalDirectCycles,
      totalTriangleCycles: cycleResults.stats.totalTriangleCycles,
      potentialSavings: cycleResults.stats.potentialSavings
    },
    recentTransactions: profile.transactions.slice(-5).reverse(),
    timestamp: Date.now(),
    runNumber: runCount
  };
}

function calculatePotentialSavings(directCycles: any[], triangleCycles: any[]): number {
  let savings = 0;
  
  // For direct cycles, take the minimum amount from each cycle
  for (const cycle of directCycles) {
    if (cycle?.amounts?.length >= 2) {
      const minAmount = Math.min(...cycle.amounts);
      console.log('Direct cycle savings:', { cycle, minAmount });
      savings += minAmount;
    }
  }

  // For triangle cycles, take the minimum amount from each cycle
  for (const cycle of triangleCycles) {
    if (cycle?.amounts?.length >= 3) {
      const minAmount = Math.min(...cycle.amounts);
      console.log('Triangle cycle savings:', { cycle, minAmount });
      savings += minAmount;
    }
  }

  return Number(savings.toFixed(2)); // Round to 2 decimal places
} 