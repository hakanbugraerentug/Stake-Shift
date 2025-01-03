import { useState, useEffect } from 'react';
import { StakeTransfer, CycleInfo, DashboardStats } from '../types/transaction';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { parseTransferFromAccountInfo, findDirectCycles, findTriangleCycles, updateStats } from '../utils/cycle-detection';
import { mockTransfers } from '../utils/mock-data';
import { Tooltip } from './ui/tooltip';

export function TransactionDashboard() {
  const [transfers, setTransfers] = useState<StakeTransfer[]>(mockTransfers);
  const [cycles, setCycles] = useState<CycleInfo[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    directCycles: 0,
    triangleCycles: 0,
    potentialSavings: 0
  });

  const { connection } = useConnection();

  useEffect(() => {
    const subscribeToProgram = async () => {
      // Subscribe to program events
      const programId = new PublicKey("YrN37FF9AdJZrqxSeWsrLWJ6UEp2ZEZPwqkPcUu3YQY");
      
      connection.onProgramAccountChange(programId, 
        ({ accountInfo }) => {
          // Handle new transactions
          const newTransfer = parseTransferFromAccountInfo(accountInfo);
          if (newTransfer) {
            setTransfers(prev => [...prev, newTransfer]);
            analyzeCycles([...transfers, newTransfer]);
          }
        }
      );
    };

    subscribeToProgram();
  }, [connection]);

  useEffect(() => {
    analyzeCycles(transfers);
  }, [transfers]);

  const analyzeCycles = (currentTransfers: StakeTransfer[]) => {
    // Similar to the offchain.ts logic
    const directCycles = findDirectCycles(currentTransfers);
    const triangleCycles = findTriangleCycles(currentTransfers);
    
    setCycles([...directCycles, ...triangleCycles]);
    setStats(updateStats(directCycles, triangleCycles));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-white dark:bg-dark-card rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 dark:text-dark-text">Transaction Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="Total Transactions" 
            value={stats.totalTransactions} 
          />
          <StatCard 
            title="Direct Cycles" 
            value={stats.directCycles}
            className="text-blue-600"
          />
          <StatCard 
            title="Triangle Cycles" 
            value={stats.triangleCycles}
            className="text-green-600"
          />
          <Tooltip
            content={
              <div className="max-w-xs">
                <p>Amount of SOL that could be saved by optimizing stake movements.</p>
                <p className="mt-2">Example:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>A → B: 100 SOL</li>
                  <li>B → A: 150 SOL</li>
                  <li>Can be optimized to: B → A: 50 SOL</li>
                  <li>Saving: 100 SOL in movements</li>
                </ul>
              </div>
            }
          >
            <div>
              <StatCard 
                title="Potential Savings" 
                value={`${stats.potentialSavings.toFixed(2)} SOL`}
                className="text-purple-600"
              />
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-dark-card rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 dark:text-dark-text">Recent Cycles</h2>
        <div className="space-y-4">
          {cycles.slice(0, 5).map((cycle, index) => (
            <CycleCard key={index} cycle={cycle} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  className?: string;
}

function StatCard({ title, value, className = '' }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-dark-hover">
      <h3 className="text-sm text-gray-500 dark:text-gray-400">{title}</h3>
      <p className={`text-2xl font-semibold ${className}`}>{value}</p>
    </div>
  );
}

function CycleCard({ cycle }: { cycle: CycleInfo }) {
  return (
    <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-hover">
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${
          cycle.type === 'direct' ? 'text-blue-600' : 'text-green-600'
        }`}>
          {cycle.type === 'direct' ? 'Direct Cycle' : 'Triangle Cycle'}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(cycle.timestamp).toLocaleString()}
        </span>
      </div>
      <div className="mt-2 text-sm">
        {cycle.nodes.map((node, i) => (
          <span key={i}>
            {node.slice(0, 4)}...{node.slice(-4)}
            {i < cycle.nodes.length - 1 ? ' → ' : ''}
          </span>
        ))}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Total Flow: {cycle.amounts.reduce((a, b) => Number(a) + Number(b), 0)} SOL
      </div>
    </div>
  );
} 