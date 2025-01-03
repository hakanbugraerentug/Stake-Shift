import { createContext, useContext } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl, type ShiftStakeBookkeeper } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { IDL } from '../types/shift_stake_bookkeeper';
import { BN } from '@coral-xyz/anchor';

const PROGRAM_ID = new PublicKey("YrN37FF9AdJZrqxSeWsrLWJ6UEp2ZEZPwqkPcUu3YQY");

interface SolanaContextType {
  program: Program<ShiftStakeBookkeeper> | null;
  createStakeRequest: (params: {
    fromValidator: string;
    toValidator: string;
    amount: number;
  }) => Promise<string>;
}

const SolanaContext = createContext<SolanaContextType>({
  program: null,
  createStakeRequest: async () => { throw new Error('Context not initialized'); }
});

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const getProgram = () => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      console.log('Wallet requirements not met:', { publicKey, signTransaction, signAllTransactions });
      return null;
    }

    try {
      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment: 'confirmed', preflightCommitment: 'confirmed' }
      );

      return new Program<ShiftStakeBookkeeper>(
        IDL as ShiftStakeBookkeeper,
        provider
      );
    } catch (error) {
      console.error('Failed to initialize program:', error);
      return null;
    }
  };

  const createStakeRequest = async (params: {
    fromValidator: string;
    toValidator: string;
    amount: number;
  }) => {
    const program = getProgram();
    if (!program || !publicKey) throw new Error('Wallet not connected');

    try {
      console.log('Creating request with params:', {
        from: params.fromValidator,
        to: params.toValidator,
        amount: params.amount,
        programId: program.programId.toString()
      });

      // Validate public keys first
      let sourceKey: PublicKey, destKey: PublicKey;
      try {
        sourceKey = new PublicKey(params.fromValidator.trim());
        destKey = new PublicKey(params.toValidator.trim());
      } catch (e) {
        console.error('Invalid public key:', e);
        throw new Error('Invalid validator public key');
      }

      const moveStakeInstruction = {
        sourceStakePubkey: sourceKey,
        destinationStakePubkey: destKey,
        authorizedPubkey: publicKey,
        lamportsToMove: new BN(params.amount),
      };

      const [bookkeeperPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("solana_beach"), Buffer.from("user_4234989")],
        program.programId
      );

      const requestKeypair = Keypair.generate();

      const tx = await program.methods
        .createRequest(moveStakeInstruction)
        .accounts({
          bookkeeper: bookkeeperPDA,
          request: requestKeypair.publicKey,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([requestKeypair])
        .rpc();

      return tx;
    } catch (error) {
      console.error('Failed to create stake request:', error);
      throw error;
    }
  };

  return (
    <SolanaContext.Provider value={{
      program: getProgram(),
      createStakeRequest,
    }}>
      {children}
    </SolanaContext.Provider>
  );
}

// Hook to use the Solana context
export const useSolana = () => useContext(SolanaContext); 