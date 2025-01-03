import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToken } from '../contexts/TokenContext';

export function TokenPurchase() {
  const { balance, price, buyTokens } = useToken();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      const success = await buyTokens(parseFloat(amount));
      if (success) {
        setAmount('');
        alert('Successfully purchased SHIFT tokens!');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Failed to purchase tokens. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-dark-card rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 dark:text-dark-text">Purchase SHIFT Tokens</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm mb-2 dark:text-dark-text">Current Balance: {balance.amount.toFixed(2)} SHIFT</p>
          <p className="text-sm mb-4 dark:text-dark-text">Rate: 1 SOL = 1 SHIFT</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in SOL"
            className="flex-1"
            disabled={loading}
          />
          <Button 
            onClick={handlePurchase}
            disabled={loading || !amount}
          >
            {loading ? 'Exchanging...' : 'Exchange Tokens'}
          </Button>
        </div>
      </div>
    </div>
  );
} 