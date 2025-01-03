import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "./button";
import { program, counterPDA } from "../../anchor/setup";

export default function IncrementButton() {
  const { publicKey } = useWallet();

  const increment = async () => {
    if (!publicKey) {
      console.log("No wallet connected");
      return;
    }
    
    try {
      console.log("Starting increment transaction...");
      console.log("Counter PDA:", counterPDA.toBase58());
      console.log("User pubkey:", publicKey.toBase58());
      
      const tx = await program.methods
        .increment()
        .accounts({
          counter: counterPDA,
          user: publicKey,
        })
        .rpc();
      
      console.log("Transaction signature:", tx);
    } catch (error) {
      console.error("Error incrementing counter:", error);
      console.dir(error, { depth: null });
    }
  };

  return (
    <Button 
      onClick={increment}
      className="bg-gray-700 hover:bg-gray-600 text-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      Increment
    </Button>
  );
} 