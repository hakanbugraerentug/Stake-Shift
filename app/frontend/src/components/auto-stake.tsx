import { useState } from 'react';
import { Button } from './ui/button';
import { useToken } from '../contexts/TokenContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { userStakes } from '../data/validators';

export function AutoStake({ validator }: { validator: string }) {
  const { balance, buyTokens, useTokensForStake } = useToken();
  const { connected } = useWallet();
  const [loading, setLoading] = useState(false);

  const STAKE_AMOUNT = 1.0;

  // Check if user has existing stakes to move from
  const existingStake = userStakes.find(stake => stake.validator === validator);
  const canMoveStake = existingStake !== undefined;

  const handleStake = async () => {
    setLoading(true);
    try {
      if (canMoveStake) {
        // Handle moving existing stake
        // Here you would implement the stake movement logic
        alert(`Successfully moved stake to ${validator}`);
        return;
      }

      // Regular staking process for new stakes
      if (balance.amount >= STAKE_AMOUNT) {
        const success = await useTokensForStake(STAKE_AMOUNT);
        if (success) {
          alert('Successfully staked!');
        } else {
          throw new Error('Failed to stake tokens');
        }
      } else {
        const neededAmount = STAKE_AMOUNT - balance.amount;
        const success = await buyTokens(neededAmount);
        if (!success) {
          throw new Error('Failed to exchange SOL for SHIFT');
        }
        
        const stakeSuccess = await useTokensForStake(STAKE_AMOUNT);
        if (!stakeSuccess) {
          throw new Error('Failed to stake tokens');
        }
        
        alert('Successfully exchanged SOL and staked SHIFT!');
      }
    } catch (error) {
      console.error('Staking failed:', error);
      alert('Failed to stake. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStake}
      disabled={loading || !connected}
      className="w-full"
    >
      {!connected ? 'Connect Wallet' : 
       loading ? 'Processing...' : 
       canMoveStake ? 'Move Stake' :
       balance.amount >= STAKE_AMOUNT ? 'Stake Now' : 
       'Exchange & Stake'}
    </Button>
  );
} 