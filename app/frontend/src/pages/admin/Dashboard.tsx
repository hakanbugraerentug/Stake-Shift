import { useState } from 'react';
import { TransactionDashboard } from '../../components/transaction-dashboard'
import { ValidatorsTable } from '../../components/ValidatorsTable'
import { Buffer } from 'buffer'
import { runDirectCycleTest, runTriangleCycleTest } from '../../utils/test-utils'
import { TestResultsView } from '../../components/TestResultsView'
import { TestControls } from '../../components/TestControls'
globalThis.Buffer = Buffer

export function AdminDashboard() {
  const [testResults, setTestResults] = useState<any>(null);

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
        <ValidatorsTable isAdmin={true} />
      </section>

      <TestControls onTestComplete={setTestResults} />

      {testResults && <TestResultsView results={testResults} />}
    </div>
  )
} 