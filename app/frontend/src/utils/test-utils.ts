import { testProfiles } from '../data/test-profiles';
import { findAndProcessCycles } from './cycle-processor';
import { updateTransactionStats } from './transaction-stats';

let runCount = 0;

const sortByTimestamp = (a: any, b: any) => {
  // For cycles, use the most recent transaction timestamp
  const aTime = Array.isArray(a.transactions) ? 
    Math.max(...a.transactions.map(t => t.timestamp)) : 
    a.timestamp;
  const bTime = Array.isArray(b.transactions) ? 
    Math.max(...b.transactions.map(t => t.timestamp)) : 
    b.timestamp;
  return bTime - aTime;
};

export async function runDirectCycleTest(profileKey: string) {
  runCount++;
  const profile = testProfiles[profileKey];
  
  if (runCount > 1) {
    const baseTimestamp = Date.now();
    const timestamp = baseTimestamp - (runCount * 60000);
    
    const newValidator = `Validator${runCount}`;
    const baseAmount = 10.00;

    // Create new direct cycle
    const amount1 = Number((baseAmount + (runCount * 1.5)).toFixed(2));
    const amount2 = Number((baseAmount + (runCount * 2)).toFixed(2));

    const newCycle: DirectCycle = {
      type: 'direct',
      addresses: [newValidator, "Validator1"] as [string, string],
      amounts: [amount1, amount2] as [number, number],
      timestamp: Date.now(),
      transactions: [
        {
          from: newValidator,
          to: "Validator1",
          amount: amount1,
          timestamp: Date.now(),
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

  const transactionStats = updateTransactionStats(profile.transactions);

  // Sort everything before returning
  const sortedDirectCycles = [...profile.cycles.direct].sort(sortByTimestamp);
  const sortedTriangleCycles = [...profile.cycles.triangle].sort(sortByTimestamp);
  const sortedTransactions = [...profile.transactions].sort(sortByTimestamp);

  return {
    cycles: {
      directCycles: sortedDirectCycles,
      triangleCycles: sortedTriangleCycles,
      stats: {
        totalDirectCycles: sortedDirectCycles.length,
        totalTriangleCycles: sortedTriangleCycles.length,
        potentialSavings: calculatePotentialSavings(sortedDirectCycles, sortedTriangleCycles)
      }
    },
    stats: {
      ...transactionStats,
      totalDirectCycles: sortedDirectCycles.length,
      totalTriangleCycles: sortedTriangleCycles.length,
      potentialSavings: calculatePotentialSavings(sortedDirectCycles, sortedTriangleCycles)
    },
    recentTransactions: sortedTransactions.slice(0, 5),
    timestamp: Date.now(),
    runNumber: runCount
  };
}

export async function runTriangleCycleTest(profileKey: string) {
  runCount++;
  const profile = testProfiles[profileKey];
  
  if (runCount > 1) {
    const baseTimestamp = Date.now();
    const timestamp = baseTimestamp - (runCount * 60000);
    const baseAmount = 10.00;

    // Create amounts for A->B->C->A cycle
    const amount1 = Number((baseAmount + (runCount * 1.0)).toFixed(2));
    const amount2 = Number((baseAmount + (runCount * 1.5)).toFixed(2));
    const amount3 = Number((baseAmount + (runCount * 2.0)).toFixed(2));

    const newCycle: TriangleCycle = {
      type: 'triangle',
      addresses: [`Validator${runCount}`, "Validator1", "Validator2"] as [string, string, string],
      amounts: [amount1, amount2, amount3] as [number, number, number],
      timestamp,
      transactions: [
        {
          from: `Validator${runCount}`,
          to: "Validator1",
          amount: amount1,
          timestamp,
          status: 'confirmed',
          signature: `new-tx-${timestamp}`
        },
        {
          from: "Validator1",
          to: "Validator2",
          amount: amount2,
          timestamp: timestamp + 1000,
          status: 'confirmed',
          signature: `new-tx-${timestamp + 1}`
        },
        {
          from: "Validator2",
          to: `Validator${runCount}`,
          amount: amount3,
          timestamp: timestamp + 2000,
          status: 'confirmed',
          signature: `new-tx-${timestamp + 2}`
        }
      ]
    };

    profile.transactions.push(...newCycle.transactions);
    profile.cycles.triangle.push(newCycle);
  }

  // Sort everything before returning
  const sortedDirectCycles = [...profile.cycles.direct].sort(sortByTimestamp);
  const sortedTriangleCycles = [...profile.cycles.triangle].sort(sortByTimestamp);
  const sortedTransactions = [...profile.transactions].sort(sortByTimestamp);
  const transactionStats = updateTransactionStats(profile.transactions);

  return {
    cycles: {
      directCycles: sortedDirectCycles,
      triangleCycles: sortedTriangleCycles,
      stats: {
        totalDirectCycles: sortedDirectCycles.length,
        totalTriangleCycles: sortedTriangleCycles.length,
        potentialSavings: calculatePotentialSavings(sortedDirectCycles, sortedTriangleCycles)
      }
    },
    stats: {
      ...transactionStats,
      totalDirectCycles: sortedDirectCycles.length,
      totalTriangleCycles: sortedTriangleCycles.length,
      potentialSavings: calculatePotentialSavings(sortedDirectCycles, sortedTriangleCycles)
    },
    recentTransactions: sortedTransactions.slice(0, 5),
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