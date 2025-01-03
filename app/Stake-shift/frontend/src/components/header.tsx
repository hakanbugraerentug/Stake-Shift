import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useToken } from '../contexts/TokenContext';

export function Header() {
  const { balance } = useToken();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-dark-card shadow z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold dark:text-dark-text">Stake Shift</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm dark:text-dark-text">
            <span className="font-medium">{balance.amount.toFixed(2)}</span>
            <span className="ml-1 text-gray-500">{balance.symbol}</span>
          </div>
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
} 