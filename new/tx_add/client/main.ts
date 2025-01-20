const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;

(async () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.TransactionManager;

  // Create a keypair for the transaction account
  const transactionAccount = anchor.web3.Keypair.generate();

  // Create the transaction account on-chain
  await program.rpc.initialize({
    accounts: {
      transactionAccount: transactionAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    signers: [transactionAccount],
  });

  console.log(
    "Transaction account created:",
    transactionAccount.publicKey.toBase58()
  );

  // Add transactions
  const transactions = [
    { giver: "Alice", receiver: "Bob", amount: new anchor.BN(10) },
    { giver: "Charlie", receiver: "Diana", amount: new anchor.BN(20) },
  ];

  for (const tx of transactions) {
    await program.rpc.addTransaction(tx.giver, tx.receiver, tx.amount, {
      accounts: {
        transactionAccount: transactionAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    });

    console.log(
      `Added transaction: ${tx.giver} -> ${tx.receiver} (${tx.amount})`
    );
  }

  // Resolve transactions
  console.log("Resolving transactions...");
  await program.rpc.resolveTransactions({
    accounts: {
      transactionAccount: transactionAccount.publicKey,
      user: provider.wallet.publicKey,
    },
  });

  console.log("Transactions resolved and cleared.");
})();
