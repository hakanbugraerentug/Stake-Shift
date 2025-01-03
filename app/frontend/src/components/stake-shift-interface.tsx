import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validators, userStakes, type Validator } from '../data/validators';
import { useSolana } from '../contexts/SolanaContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToken } from '../contexts/TokenContext';

type EstimatedRewards = {
  daily: string;
  monthly: string;
  yearly: string;
  apy: string;
};

export function StakeShiftInterface() {
  const { createStakeRequest } = useSolana();
  const { connected } = useWallet();
  const { balance, useTokensForStake } = useToken();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedFromValidator, setSelectedFromValidator] = React.useState<Validator | null>(null);
  const [selectedToValidator, setSelectedToValidator] = React.useState<Validator | null>(null);
  const [amount, setAmount] = React.useState('');
  const [showPreview, setShowPreview] = React.useState(false);
  const [estimatedRewards, setEstimatedRewards] = React.useState<EstimatedRewards | null>(null);

  const calculateEstimatedRewards = (validator: Validator, stakeAmount: number): EstimatedRewards | null => {
    if (!validator || !stakeAmount) return null;

    const commission = parseFloat(validator.commission) / 100;
    const apy = 0.071;
    const netApy = apy * (1 - commission);
    
    const dailyReward = (stakeAmount * netApy) / 365;
    const monthlyReward = dailyReward * 30;
    const yearlyReward = stakeAmount * netApy;

    return {
      daily: dailyReward.toFixed(4),
      monthly: monthlyReward.toFixed(4),
      yearly: yearlyReward.toFixed(4),
      apy: (netApy * 100).toFixed(2)
    };
  };

  const handleQuickSelect = (percentage: number) => {
    if (!selectedFromValidator?.amount) return;
    const baseAmount = parseFloat(selectedFromValidator.amount);
    const newAmount = (baseAmount * percentage).toFixed(2);
    setAmount(newAmount);
  };

  React.useEffect(() => {
    if (selectedFromValidator?.amount) {
      setAmount(selectedFromValidator.amount);
    }
  }, [selectedFromValidator]);

  React.useEffect(() => {
    if (selectedToValidator && amount) {
      const rewards = calculateEstimatedRewards(selectedToValidator, parseFloat(amount));
      setEstimatedRewards(rewards);
    }
  }, [selectedToValidator, amount]);

  const handleValidatorSelect = (validator: Validator) => {
    setSelectedToValidator(validator);
  };

  const handleStakeSubmit = async () => {
    if (!selectedFromValidator || !selectedToValidator || !amount || !connected) {
      return;
    }

    const tokenAmount = parseFloat(amount);
    const success = await useTokensForStake(tokenAmount);
    
    if (!success) {
      alert('Insufficient SHIFT tokens. Please purchase more tokens.');
      return;
    }

    try {
      const tx = await createStakeRequest({
        fromValidator: selectedFromValidator.voteAccount,
        toValidator: selectedToValidator.voteAccount,
        amount: parseFloat(amount) * 1e9,
      });

      console.log('Transaction submitted:', tx);
      setIsModalOpen(false);
      setShowPreview(false);
    } catch (error) {
      console.error('Failed to submit stake movement:', error);
      return;
    }
  };

  const renderPreview = () => {
    if (!selectedFromValidator || !selectedToValidator) return null;

    return (
      <div className="space-y-6">
        <div className="p-4 bg-gray-100 dark:bg-dark-hover rounded-lg space-y-4">
          <h3 className="font-medium dark:text-dark-text">Transaction Preview</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Token Balance: {balance.amount.toFixed(2)} SHIFT</p>
            <p className="dark:text-dark-text">From: {selectedFromValidator.validator}</p>
            <p className="dark:text-dark-text">To: {selectedToValidator.validator}</p>
            <p className="dark:text-dark-text">Amount: {amount} SHIFT</p>
            <p className="dark:text-dark-text">Timestamp: {new Date().toLocaleString()}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Back
          </Button>
          <Button 
            onClick={handleStakeSubmit}
            disabled={!connected || !selectedFromValidator || !selectedToValidator || !amount}
          >
            {connected ? 'Confirm Stake Shift' : 'Connect Wallet First'}
          </Button>
        </DialogFooter>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow dark:shadow-none current-stakes">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-dark-text">Your Current Stakes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4 text-gray-500 dark:text-gray-400">Validator</th>
                  <th className="text-left p-4 text-gray-500 dark:text-gray-400">Public Key</th>
                  <th className="text-left p-4 text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-left p-4 text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {userStakes.map((stake) => (
                  <tr key={stake.voteAccount} className="border-t dark:border-dark-border">
                    <td className="p-4 dark:text-dark-text">{stake.validator}</td>
                    <td className="p-4 font-mono dark:text-dark-text">{stake.voteAccount}</td>
                    <td className="p-4 dark:text-dark-text">{stake.amount} SOL</td>
                    <td className="p-4">
                      <Button 
                        variant="outline"
                        className="move-stake-btn"
                        onClick={() => {
                          setSelectedFromValidator(stake);
                          setIsModalOpen(true);
                        }}
                      >
                        Move Stake
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Stake</DialogTitle>
          </DialogHeader>
          
          {!showPreview ? (
            <div className="space-y-4 py-4">
              {selectedFromValidator && (
                <div className="bg-gray-100 dark:bg-dark-hover p-4 rounded-lg">
                  <p className="dark:text-dark-text">From: {selectedFromValidator.validator}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available: {selectedFromValidator.amount} SOL</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2 dark:text-dark-text">Amount to Move</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount in SOL"
                  className="mb-2 dark:bg-dark-card dark:border-dark-border dark:text-dark-text dark:placeholder-gray-500"
                />
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(1)}
                  >
                    Full Amount
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(0.5)}
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(0.25)}
                  >
                    25%
                  </Button>
                </div>
              </div>

              {estimatedRewards && selectedToValidator && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-3">
                  <h3 className="font-medium text-green-800 dark:text-green-400">Estimated Rewards at New Validator</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">Net APY</p>
                      <p className="font-medium dark:text-green-300">{estimatedRewards.apy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">Daily</p>
                      <p className="font-medium dark:text-green-300">{estimatedRewards.daily} SOL</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">Monthly</p>
                      <p className="font-medium dark:text-green-300">{estimatedRewards.monthly} SOL</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">Yearly</p>
                      <p className="font-medium dark:text-green-300">{estimatedRewards.yearly} SOL</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2 dark:text-dark-text">
                  Search Validators
                  {!selectedToValidator && (
                    <span className="text-sm text-red-500 dark:text-red-400 ml-2">
                      Please select a validator
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or public key"
                    className="pl-8 dark:bg-dark-card dark:border-dark-border dark:text-dark-text dark:placeholder-gray-500"
                  />
                </div>
                <div className={cn(
                  "border rounded-lg max-h-60 overflow-y-auto custom-scrollbar",
                  "dark:border-dark-border",
                  !selectedToValidator && "border-red-300 dark:border-red-800/50"
                )}>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-dark-hover">
                        <th className="text-left p-4 text-gray-500 dark:text-gray-400">Validator</th>
                        <th className="text-left p-4 text-gray-500 dark:text-gray-400">Score</th>
                        <th className="text-left p-4 text-gray-500 dark:text-gray-400">Commission</th>
                        <th className="text-left p-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                      {validators
                        .filter(v => 
                          v.validator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.voteAccount.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((validator) => (
                          <tr 
                            key={validator.voteAccount} 
                            className={`border-t dark:border-dark-border ${
                              selectedToValidator?.voteAccount === validator.voteAccount ? 
                              'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <td className="p-4 dark:text-dark-text">
                              <div>{validator.validator}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{validator.voteAccount}</div>
                            </td>
                            <td className="p-4 dark:text-dark-text">{validator.score}</td>
                            <td className="p-4 dark:text-dark-text">{validator.commission}</td>
                            <td className="p-4">
                              <Button
                                variant={selectedToValidator?.voteAccount === validator.voteAccount ? "default" : "outline"}
                                onClick={() => handleValidatorSelect(validator)}
                              >
                                Select
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  disabled={!amount}
                  onClick={() => {
                    if (!selectedToValidator) {
                      // Just scroll to the validator table instead of showing warning
                      const table = document.querySelector('.validator-table');
                      table?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      return;
                    }
                    setShowPreview(true);
                  }}
                >
                  Preview Transaction
                </Button>
              </DialogFooter>
            </div>
          ) : (
            renderPreview()
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
