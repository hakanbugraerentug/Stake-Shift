import React, { useEffect, useState } from 'react';
import { fetchAccountData } from '../../services/accountService';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function AccountPage() {
  const { connected } = useWallet();
  const [accountData, setAccountData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected) {
      loadAccountData();
    }
  }, [connected]);

  const loadAccountData = async () => {
    try {
      const data = await fetchAccountData();
      setAccountData(data);
    } catch (error) {
      console.error('Failed to load account data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-2xl font-semibold dark:text-dark-text">Connect Wallet to View Account</h1>
        <WalletMultiButton />
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-card rounded-lg p-6 shadow-sm">
        <pre className="overflow-auto p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
          {JSON.stringify(accountData, null, 2)}
        </pre>
      </div>
    </div>
  );
} 