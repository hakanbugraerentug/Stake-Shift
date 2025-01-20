import { BN, AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import idl from "../target/idl/splitwise_sol.json"; // Your program's IDL file
import { readFileSync } from "fs";

// Load your program ID (update with the correct program key)
const programId = new PublicKey("2h8AUNUnGPg1RBLEhi6K82rLBypBmp5gHoSAGwBArp3X");

// Load keypair (this assumes a keypair file exists)
const secretKey = JSON.parse(
  readFileSync("/home/cypher/.config/solana/id.json", "utf-8")
);
const keypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));

// Create connection to localnet
const connection = new Connection("http://127.0.0.1:8899", "processed");

// Set up Anchor provider
const wallet = new Wallet(keypair);
const provider = new AnchorProvider(connection, wallet, {
  commitment: "processed",
});
const program = new Program(idl as any, programId, provider);

// Example transactions (converted to `BN`)
/*
const transactions = [
  { giver: "A", receiver: "B", amount: new BN(6) }, // Convert to BN
  { giver: "A", receiver: "B", amount: new BN(4) }, // Convert to BN
  { giver: "B", receiver: "C", amount: new BN(1) }, // Convert to BN
  { giver: "B", receiver: "C", amount: new BN(4) }, // Convert to BN
  { giver: "C", receiver: "A", amount: new BN(5) }, // Convert to BN
];
*/
/*
const transactions = [
  { giver: "A", receiver: "B", amount: new BN(3) },
  { giver: "A", receiver: "B", amount: new BN(4) },
  { giver: "B", receiver: "D", amount: new BN(4) },
  { giver: "C", receiver: "D", amount: new BN(2) },
  { giver: "C", receiver: "A", amount: new BN(1) },
  { giver: "D", receiver: "A", amount: new BN(5) },
  { giver: "A", receiver: "D", amount: new BN(3) },
  { giver: "B", receiver: "C", amount: new BN(3) },
];
*/

const transactions = [
  { giver: "A", receiver: "B", amount: new BN(10) },
  { giver: "A", receiver: "C", amount: new BN(5) },
  { giver: "B", receiver: "D", amount: new BN(8) },
  { giver: "C", receiver: "D", amount: new BN(12) },
  { giver: "D", receiver: "A", amount: new BN(15) },
  { giver: "B", receiver: "A", amount: new BN(7) },
  { giver: "D", receiver: "E", amount: new BN(20) },
  { giver: "E", receiver: "A", amount: new BN(5) },
  { giver: "F", receiver: "D", amount: new BN(9) },
  { giver: "C", receiver: "F", amount: new BN(7) },
  { giver: "E", receiver: "F", amount: new BN(11) },
  { giver: "B", receiver: "F", amount: new BN(4) },
  { giver: "F", receiver: "G", amount: new BN(16) },
  { giver: "G", receiver: "H", amount: new BN(10) },
  { giver: "H", receiver: "E", amount: new BN(7) },
  { giver: "A", receiver: "G", amount: new BN(6) },
  { giver: "G", receiver: "B", amount: new BN(3) },
  { giver: "F", receiver: "A", amount: new BN(10) },
  { giver: "H", receiver: "B", amount: new BN(8) },
  { giver: "D", receiver: "C", amount: new BN(4) },
  { giver: "E", receiver: "B", amount: new BN(9) },
  { giver: "A", receiver: "H", amount: new BN(12) },
  { giver: "C", receiver: "G", amount: new BN(2) },
  { giver: "G", receiver: "D", amount: new BN(11) },
  { giver: "H", receiver: "C", amount: new BN(14) },
];

async function main() {
  try {
    // Send the actual transaction
    const txSignature = await program.methods
      .processTransactions(transactions)
      .accounts({
        authority: provider.wallet.publicKey, // Use the local wallet's public key
      })
      .rpc();

    console.log("Transaction successfully sent. Signature:", txSignature);

    // Simulate the transaction to see potential results before sending
    const result = await program.methods
      .processTransactions(transactions)
      .accounts({
        authority: provider.wallet.publicKey,
      })
      .simulate();

    console.log("Remaining minimized transactions:");
    console.log(result); // Logs simulation result
  } catch (error) {
    console.error("Error during transaction or simulation:", error);
  }
}

main();
