import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program, counterPDA } from "../anchor/setup";
 
export default function IncrementButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
 
  const onClick = async () => {
    if (!publicKey) return;
 
    setIsLoading(true);
 
    try {
      // Create a transaction to invoke the increment function
      const transaction = await program.methods
        .increment()
        .accounts({
          counter: counterPDA,
        })
        .transaction();
 
      const transactionSignature = await sendTransaction(
        transaction,
        connection,
      );
 
      console.log(
        `View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`,
      );
    } catch (error: any) {
      if (error.message === 'User rejected the request.') {
        console.log('Transaction cancelled by user');
      } else {
        console.error('Transaction failed:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <button className="w-24" onClick={onClick} disabled={!publicKey}>
      {isLoading ? "Loading" : "Increment"}
    </button>
  );
}