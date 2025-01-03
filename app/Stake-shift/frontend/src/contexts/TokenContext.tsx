import React, { createContext, useContext, useState, useEffect } from 'react';
import { TokenBalance, TokenPrice } from '../types/token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { TREASURY_PUBKEY } from '../constants/treasury';

interface TokenContextType {
  balance: TokenBalance;
  price: TokenPrice;
  buyTokens: (solAmount: number) => Promise<boolean>;
  useTokensForStake: (amount: number) => Promise<boolean>;
}

const TokenContext = createContext<TokenContextType>({
  balance: { amount: 0, symbol: 'SHIFT', decimals: 9 },
  price: { solPrice: 0.01, usdPrice: 0.2 },
  buyTokens: async () => false,
  useTokensForStake: async () => false,
});

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState<TokenBalance>({ 
    amount: 0, 
    symbol: 'SHIFT', 
    decimals: 9 
  });
  
  const [price] = useState<TokenPrice>({ 
    solPrice: 1,
    usdPrice: 20
  });

  // Initialize treasury connection
  React.useEffect(() => {
    if (connection) {
      connection.getBalance(TREASURY_PUBKEY).then(balance => {
        console.log('Treasury balance:', balance / LAMPORTS_PER_SOL, 'SOL');
      });
    }
  }, [connection]);

  const buyTokens = async (solAmount: number) => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return false;
    }

    try {
      // Create a transaction to send SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_PUBKEY, // We need to create this
          lamports: solAmount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // If transaction successful, update token balance
      const tokenAmount = solAmount / price.solPrice;
      setBalance(prev => ({ ...prev, amount: prev.amount + tokenAmount }));
      
      return true;
    } catch (error) {
      console.error('Failed to purchase tokens:', error);
      alert('Failed to purchase tokens. Please try again.');
      return false;
    }
  };

  const useTokensForStake = async (amount: number) => {
    if (balance.amount < amount) return false;
    setBalance(prev => ({ ...prev, amount: prev.amount - amount }));
    return true;
  };

  return (
    <TokenContext.Provider value={{
      balance,
      price,
      buyTokens,
      useTokensForStake,
    }}>
      {children}
    </TokenContext.Provider>
  );
}

export const useToken = () => useContext(TokenContext); 