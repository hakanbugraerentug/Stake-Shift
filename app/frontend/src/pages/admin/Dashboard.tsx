import { useState } from 'react';
import { TransactionDashboard } from '../../components/transaction-dashboard'
import ValidatorsTable from '../../components/ValidatorsTable'
import { Buffer } from 'buffer'
import { runTestProfile } from '../../utils/test-utils'
import { TestResultsView } from '../../components/TestResultsView'
globalThis.Buffer = Buffer

export function AdminDashboard() {
  const [testResults, setTestResults] = useState(null);

  const runTest = async () => {
    try {
      const results = await runTestProfile('complexProfile');
      setTestResults(results);
      
      // Update your transaction dashboard with new data
      // You might need to implement an update method in TransactionDashboard
      console.log('Test completed:', results);
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Transactions Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-dark-text">Transaction Overview</h2>
        <TransactionDashboard testData={testResults} />
      </section>

      {/* Validators Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-dark-text">Validators</h2>
        <ValidatorsTable />
      </section>

      <button 
        onClick={runTest}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Run Test Profile
      </button>

      {testResults && <TestResultsView results={testResults} />}
    </div>
  )
} 