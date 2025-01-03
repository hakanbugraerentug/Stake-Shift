import { StakeShiftInterface } from './components/stake-shift-interface'
import { TokenPurchase } from './components/token-purchase'
import { TransactionDashboard } from './components/transaction-dashboard'
import Header from './components/Header'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
      <Header />
      <div className="pt-20 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <TokenPurchase />
          <TransactionDashboard />
          <StakeShiftInterface />
        </div>
      </div>
    </div>
  )
}

export default App
