import { StakeTransfer } from '../types/transaction';
import { findDirectCycles, findTriangleCycles } from './cycle-detection';

export async function findAndProcessCycles(transfers: StakeTransfer[]) {
  // Find all cycles
  const directCycles = findDirectCycles(transfers);
  const triangleCycles = findTriangleCycles(transfers);

  // Calculate stats
  const stats = {
    totalDirectCycles: directCycles.length,
    totalTriangleCycles: triangleCycles.length,
    potentialSavings: calculatePotentialSavings(directCycles, triangleCycles)
  };

  return {
    directCycles,
    triangleCycles,
    stats
  };
}

function calculatePotentialSavings(directCycles: any[], triangleCycles: any[]): number {
  let savings = 0;

  // Calculate savings from direct cycles
  for (const cycle of directCycles) {
    savings += Math.min(...cycle.amounts);
  }

  // Calculate savings from triangle cycles
  for (const cycle of triangleCycles) {
    savings += Math.min(...cycle.amounts);
  }

  return savings;
} 