import { useState } from 'react'
import { validators } from '../data/validators';
import { cn } from "../lib/utils";

const ITEMS_PER_PAGE = 10;

export default function ValidatorsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(validators.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentValidators = validators.slice(startIndex, endIndex);

  return (
    <div className="overflow-x-auto validators-table">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
        <thead className="bg-gray-50 dark:bg-dark-hover">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Validator
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Vote Account
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Stake
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Commission
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              APY
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
          {currentValidators.map((validator, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-hover">
              <td className="px-6 py-4 whitespace-nowrap dark:text-dark-text">
                <div className="flex items-center">
                  {validator.icon ? (
                    <img 
                      src={validator.icon} 
                      alt={`${validator.validator} logo`}
                      className={cn(
                        "w-6 h-6 rounded-full mr-2",
                        "bg-gray-200 dark:bg-gray-700",
                        "object-contain"
                      )}
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full mr-2 bg-gray-200 dark:bg-gray-700" />
                  )}
                  {validator.validator}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-mono text-sm dark:text-dark-text">
                {validator.voteAccount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap dark:text-dark-text">
                {validator.stake}
              </td>
              <td className="px-6 py-4 whitespace-nowrap dark:text-dark-text">
                {validator.commission}
              </td>
              <td className="px-6 py-4 whitespace-nowrap dark:text-dark-text">
                {validator.apy}
              </td>
              <td className="px-6 py-4 whitespace-nowrap dark:text-dark-text">
                {validator.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-dark-border">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-border dark:text-dark-text"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700 dark:text-dark-text">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-border dark:text-dark-text"
        >
          Next
        </button>
      </div>
    </div>
  );
} 