// Ensure provider and Anchor program are initialized correctly
const { PublicKey } = require("@solana/web3.js");
const anchor = require("@coral-xyz/anchor");

// Anchor provider setup
const provider = anchor.AnchorProvider.local();
anchor.setProvider(provider);

// Ensure the program is loaded properly
const programId = new PublicKey("Your_Program_ID");
const program = new anchor.Program(idl, programId, provider);

async function sendAndSimulateTransactions(transactions: any[]) {
  try {
    // Send the transaction using `rpc()` and get the signature
    const txSignature = await program.methods
      .processTransactions(transactions)
      .accounts({
        authority: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Transaction successfully sent. Signature:", txSignature);

    // Simulate the transaction to see how it behaves before sending
    const simulationResult = await program.methods
      .processTransactions(transactions)
      .accounts({
        authority: provider.wallet.publicKey,
      })
      .simulate();

    console.log("Remaining minimized transactions:");
    console.log(simulationResult);
  } catch (error) {
    console.error("Error during transaction or simulation:", error);
  }
}

// Example call to the function (pass appropriate transaction data)
const transactions = [
  // Example: Replace with actual transaction objects
];
sendAndSimulateTransactions(transactions);
