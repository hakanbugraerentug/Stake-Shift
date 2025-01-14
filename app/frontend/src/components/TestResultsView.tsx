import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { PubkeyDisplay } from './PubkeyDisplay';
import { matchingService } from '../services/matching-service';

interface TestResultsProps {
  results: {
    cycles: {
      directCycles: any[];
      triangleCycles: any[];
      stats: {
        totalDirectCycles: number;
        totalTriangleCycles: number;
        potentialSavings: number;
      };
    };
    stats: {
      totalTransactions: number;
      totalValue: number;
      averageAmount: number;
      lastUpdated: number;
    };
    recentTransactions: any[];
    timestamp: number;
    runNumber: number;
  };
}

export function TestResultsView({ results }: TestResultsProps) {
  console.log('Test Results Data:', results);

  // Get cycles directly from results
  const directCycles = results?.cycles?.directCycles || [];
  const triangleCycles = results?.cycles?.triangleCycles || [];
  const recentTransactions = results?.recentTransactions || [];

  const stats = {
    totalDirectCycles: results?.cycles?.stats?.totalDirectCycles || 0,
    totalTriangleCycles: results?.cycles?.stats?.totalTriangleCycles || 0,
    potentialSavings: results?.cycles?.stats?.potentialSavings || 0,
    totalTransactions: results?.stats?.totalTransactions || 0,
    totalValue: results?.stats?.totalValue || 0,
    averageAmount: results?.stats?.averageAmount || 0,
  };

  const safeFormat = (timestamp: number) => {
    try {
      return format(timestamp || Date.now(), 'HH:mm:ss');
    } catch (e) {
      return '--:--:--';
    }
  };

  function CycleVisualizer({ cycle, type }: { cycle: any, type: 'direct' | 'triangle' }) {
    // Add safety checks for cycle structure
    if (!cycle?.addresses?.length || !cycle?.amounts?.length) {
      return null;
    }

    // Validate cycle type matches number of nodes
    if ((type === 'direct' && cycle.addresses.length !== 2) || 
        (type === 'triangle' && cycle.addresses.length !== 3)) {
      console.error('Invalid cycle type or number of nodes:', { type, cycle });
      return null;
    }

    const bgColor = type === 'direct' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20';
    const textColor = type === 'direct' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400';

    // Get the most recent timestamp from the cycle or its transactions
    const cycleTimestamp = Array.isArray(cycle.transactions) 
      ? Math.max(...cycle.transactions.map(t => t.timestamp))
      : cycle.timestamp;

    const isNew = Date.now() - cycleTimestamp < 5000;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-3 ${bgColor} rounded-lg ${isNew ? 'ring-2 ring-yellow-400' : ''}`}
      >
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${textColor}`}>
            {type === 'direct' ? 'Direct Cycle' : 'Triangle Cycle'}
            {isNew && <span className="ml-2 text-xs text-yellow-600">New</span>}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {safeFormat(cycle.timestamp)}
          </span>
        </div>
        <div className="mt-2 text-sm flex items-center gap-2">
          {cycle.addresses?.map((addr: string, j: number) => (
            addr ? (
              <React.Fragment key={j}>
                <PubkeyDisplay pubkey={addr} />
                {j < cycle.addresses.length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </React.Fragment>
            ) : null
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Total Flow: {cycle.amounts?.reduce((a: number, b: number) => a + b, 0)} SOL
          </div>
          <div className="text-right">
            Optimization: {Math.min(...(cycle.amounts || []))} SOL
          </div>
        </div>
      </motion.div>
    );
  }

  useEffect(() => {
    // Update matching service when transactions change
    matchingService.updateTransactions(recentTransactions);
  }, [recentTransactions]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 dark:text-gray-100"
    >
      {/* Add run counter */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4 text-sm text-gray-500 dark:text-gray-400"
      >
        Test Run #{results.runNumber}
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        <motion.div 
          variants={{
            hidden: { opacity: 0, x: -20 },
            show: { opacity: 1, x: 0 }
          }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cycles Found</h3>
          <div className="mt-2 flex justify-between items-end">
            <div>
              <p className="text-2xl font-semibold dark:text-white">
                {stats.totalDirectCycles + stats.totalTriangleCycles}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cycles</p>
            </div>
            <div className="text-right dark:text-gray-300">
              <p className="text-sm">{stats.totalDirectCycles} Direct</p>
              <p className="text-sm">{stats.totalTriangleCycles} Triangle</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={{
            hidden: { opacity: 0, x: -20 },
            show: { opacity: 1, x: 0 }
          }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Potential Optimization</h3>
          <p className="mt-2 text-2xl font-semibold dark:text-white">
            {stats.potentialSavings.toFixed(2)} SOL
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            From {stats.totalTransactions} Transactions
          </p>
        </motion.div>

        <motion.div 
          variants={{
            hidden: { opacity: 0, x: -20 },
            show: { opacity: 1, x: 0 }
          }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Value</h3>
          <p className="mt-2 text-2xl font-semibold dark:text-white">
            {stats.totalValue.toFixed(2)} SOL
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Avg: {stats.averageAmount.toFixed(2)} SOL
          </p>
        </motion.div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium dark:text-white">Recent Transactions</h3>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-sm text-gray-500 dark:text-gray-400">
                <th className="text-left pb-2">From</th>
                <th className="text-left pb-2">To</th>
                <th className="text-right pb-2">Amount</th>
                <th className="text-right pb-2">Matched</th>
                <th className="text-right pb-2">Left</th>
                <th className="text-right pb-2">Time</th>
              </tr>
            </thead>
            <tbody className="dark:text-gray-300">
              <AnimatePresence>
                {recentTransactions.map((tx, i) => {
                  const { matchedAmount, remainingAmount } = matchingService.getMatchResult(tx);
                  return (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="py-2"><PubkeyDisplay pubkey={tx.from} /></td>
                      <td className="py-2"><PubkeyDisplay pubkey={tx.to} /></td>
                      <td className="py-2 text-right">{tx.amount.toFixed(2)} SOL</td>
                      <td className={`py-2 text-right ${matchedAmount > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                        {matchedAmount > 0 ? `${matchedAmount.toFixed(2)} SOL` : '-'}
                      </td>
                      <td className={`py-2 text-right ${remainingAmount > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {remainingAmount > 0 ? `${remainingAmount.toFixed(2)} SOL` : '-'}
                      </td>
                      <td className="py-2 text-right text-gray-500 dark:text-gray-400">
                        {safeFormat(tx.timestamp)}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Cycle Details */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium dark:text-white">Detected Cycles</h3>
        </div>
        <div className="p-4 space-y-4">
          <AnimatePresence>
            {[...directCycles, ...triangleCycles]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((cycle, i) => {
                // Determine the actual cycle type based on the cycle object
                const actualType = cycle.type || (cycle.addresses?.length === 3 ? 'triangle' : 'direct');
                
                return cycle && cycle.addresses && cycle.amounts ? (
                  <CycleVisualizer 
                    key={`${actualType}-${i}`}
                    cycle={cycle}
                    type={actualType as 'direct' | 'triangle'}
                  />
                ) : null;
              })}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
} 