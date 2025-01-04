import { useState, useEffect } from 'react';
import { StakeTransfer, CycleInfo, DashboardStats } from '../types/transaction';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { parseTransferFromAccountInfo, findDirectCycles, findTriangleCycles, updateStats } from '../utils/cycle-detection';
import { mockTransfers } from '../utils/mock-data';

export function TransactionDashboard({ testData }: { testData?: any }) {
  const [transfers, setTransfers] = useState<StakeTransfer[]>(testData?.recentTransactions || mockTransfers);

  const stats = testData?.stats || {
    totalTransactions: 0,
    totalValue: 0,
    averageAmount: 0,
    potentialSavings: 0
  };

  const { connection } = useConnection();

  useEffect(() => {
    if (testData) {
      setTransfers(testData.recentTransactions);
    }
  }, [testData]);

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
          }
        }
      );
    };

    subscribeToProgram();
  }, [connection]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <StatCard 
          title="Total Transactions" 
          value={stats.totalTransactions.toString()}
          className="text-blue-600"
        />
      </div>
      <div>
        <StatCard 
          title="Total Value" 
          value={`${stats.totalValue.toFixed(2)} SOL`}
          className="text-green-600"
        />
      </div>
      <div>
        <StatCard 
          title="Average Amount" 
          value={`${stats.averageAmount.toFixed(2)} SOL`}
          className="text-orange-600"
        />
      </div>
      <div>
        <StatCard 
          title="Potential Savings" 
          value={`${stats.potentialSavings.toFixed(2)} SOL`}
          className="text-purple-600"
        />
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

// function CycleCard({ cycle }: { cycle: CycleInfo }) {
//   return (
//     <div className="p-3 rounded-lg bg-gray-50 dark:bg-dark-hover">
//       <div className="flex justify-between items-center">
//         <span className={`text-sm font-medium ${
//           cycle.type === 'direct' ? 'text-blue-600' : 'text-green-600'
//         }`}>
//           {cycle.type === 'direct' ? 'Direct Cycle' : 'Triangle Cycle'}
//         </span>
//         <span className="text-xs text-gray-500">
//           {new Date(cycle.timestamp).toLocaleString()}
//         </span>
//       </div>
//       <div className="mt-2 text-sm">
//         {cycle.nodes.map((node, i) => (
//           <span key={i}>
//             {node.slice(0, 4)}...{node.slice(-4)}
//             {i < cycle.nodes.length - 1 ? ' → ' : ''}
//           </span>
//         ))}
//       </div>
//       <div className="mt-1 text-xs text-gray-500">
//         Total Flow: {cycle.amounts.reduce((a, b) => Number(a) + Number(b), 0)} SOL
//       </div>
//     </div>
//   );