import { runDirectCycleTest, runTriangleCycleTest } from '../utils/test-utils';

export function TestControls({ onTestComplete }: { onTestComplete: (results: any) => void }) {
  return (
    <div className="flex gap-4">
      <button
        onClick={async () => {
          const results = await runDirectCycleTest('complexProfile');
          onTestComplete(results);
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Test Direct Cycles
      </button>

      <button
        onClick={async () => {
          const results = await runTriangleCycleTest('complexProfile');
          onTestComplete(results);
        }}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Add Test Triangle Cycles
      </button>
    </div>
  );
} 