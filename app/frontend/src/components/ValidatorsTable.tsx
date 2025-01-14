import * as React from 'react';
import { useState } from 'react';
import { AutoStake } from './auto-stake';
import * as ValidatorData from '../data/validators';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const { validators, userStakes } = ValidatorData;
const ITEMS_PER_PAGE = 4;

export function ValidatorsTable({ isAdmin = false }) {
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(validators.length / ITEMS_PER_PAGE);
  
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentValidators = validators.slice(indexOfFirstItem, indexOfLastItem);

  // Now you can access user data
  const userStakes = user?.stakes || [];
  
  // Calculate total staked amount with debugging
  const totalStaked = userStakes.reduce((sum, stake) => {
    const amount = parseFloat(stake.amount || '0');
    console.log(`Stake amount for ${stake.validator}:`, amount);
    return sum + amount;
  }, 0);
  
  console.log('Total staked amount:', totalStaked);
  console.log('Current user stakes:', userStakes);

  return (
    <div className="space-y-8">
      {/* My Current Stakes Table - Only show in client view */}
      {!isAdmin && userStakes && userStakes.length > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
            <h3 className="font-medium dark:text-dark-text">My Current Stakes</h3>
            <div className="text-sm text-gray-500">
              Total Staked: <span className="font-medium">{totalStaked.toFixed(2)} SHIFT</span>
            </div>
          </div>
          <div className="p-4">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-gray-500 dark:text-gray-400">
                  <th className="text-left pb-2">Validator</th>
                  <th className="text-left pb-2">Score</th>
                  <th className="text-right pb-2">Commission</th>
                  <th className="text-right pb-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {userStakes.map((stake) => (
                  <tr key={stake.voteAccount}>
                    <td className="py-2">{stake.validator}</td>
                    <td className="py-2">{stake.score}</td>
                    <td className="py-2 text-right">{stake.commission}</td>
                    <td className="py-2 text-right">{stake.amount} SHIFT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Validators Table */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="font-medium dark:text-dark-text">Available Validators</h3>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-sm text-gray-500 dark:text-gray-400">
                <th className="text-left pb-2">Validator</th>
                <th className="text-left pb-2">Score</th>
                <th className="text-right pb-2">Commission</th>
                {!isAdmin && <th className="text-right pb-2">Action</th>}
              </tr>
            </thead>
            <tbody className="dark:text-gray-300">
              {currentValidators.map((validator) => (
                <tr key={validator.voteAccount}>
                  <td className="py-2 dark:text-gray-300">{validator.validator}</td>
                  <td className="py-2 dark:text-gray-300">{validator.score}</td>
                  <td className="py-2 text-right dark:text-gray-300">{validator.commission}</td>
                  {!isAdmin && (
                    <td className="py-2 text-right">
                      <AutoStake validator={validator.validator} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm"
                variant="outline"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              
              <div className="flex items-center px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPage} / {totalPages}
                </span>
              </div>

              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm"
                variant="outline"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 