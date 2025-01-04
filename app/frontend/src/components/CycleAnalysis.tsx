import React from 'react';
import { TestProfile } from '../data/test-profiles';

interface CycleAnalysisProps {
  profile: TestProfile;
  onProcessCycles?: (cycles: any) => Promise<void>;
}

export function CycleAnalysis({ profile, onProcessCycles }: CycleAnalysisProps) {
  const totalDirectCycles = profile.cycles.direct.length;
  const totalTriangleCycles = profile.cycles.triangle.length;
  const potentialSavings = calculatePotentialSavings(profile);

  async function handleProcessCycles() {
    if (onProcessCycles && (totalDirectCycles > 0 || totalTriangleCycles > 0)) {
      try {
        await onProcessCycles({
          direct: profile.cycles.direct,
          triangle: profile.cycles.triangle
        });
      } catch (error) {
        console.error('Failed to process cycles:', error);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium">Direct Cycles</h3>
          <p className="text-2xl">{totalDirectCycles}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium">Triangle Cycles</h3>
          <p className="text-2xl">{totalTriangleCycles}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium">Potential Savings</h3>
          <p className="text-2xl">{potentialSavings} SOL</p>
        </div>
      </div>

      {(totalDirectCycles > 0 || totalTriangleCycles > 0) && (
        <button
          onClick={handleProcessCycles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Process Cycles
        </button>
      )}
    </div>
  );
}

function calculatePotentialSavings(profile: TestProfile): number {
  let savings = 0;

  // Calculate savings from direct cycles
  for (const cycle of profile.cycles.direct) {
    const [amount1, amount2] = cycle.amounts;
    savings += Math.min(amount1, amount2);
  }

  // Calculate savings from triangle cycles
  for (const cycle of profile.cycles.triangle) {
    const minAmount = Math.min(...cycle.amounts);
    savings += minAmount;
  }

  return savings;
} 