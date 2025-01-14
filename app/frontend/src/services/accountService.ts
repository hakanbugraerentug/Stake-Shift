import { useWallet } from '@solana/wallet-adapter-react';
import { useToken } from '../contexts/TokenContext';
import { useUser } from '../contexts/UserContext';

interface AccountData {
  publicKey: string | null;
  shiftBalance: {
    amount: number;
    symbol: string;
  };
  stakes: {
    validator: string;
    voteAccount: string;
    amount: string;
    commission: string;
  }[];
  totalStaked: number;
  lastLogin: Date | null;
}

export async function fetchAccountData(): Promise<AccountData> {
  const { publicKey } = useWallet();
  const { balance } = useToken();
  const { user } = useUser();

  const formattedStakes = (user?.stakes || []).map(stake => ({
    validator: stake.validator,
    voteAccount: stake.validator, // Using validator as voteAccount temporarily
    amount: stake.amount.toString(),
    commission: "0%" // Default commission
  }));

  return {
    publicKey: publicKey?.toString() || null,
    shiftBalance: {
      amount: balance.amount,
      symbol: balance.symbol
    },
    stakes: formattedStakes,
    totalStaked: user?.totalStaked || 0,
    lastLogin: user?.lastLogin || null
  };
} 