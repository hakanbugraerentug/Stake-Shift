const solanaWeb3 = require("@solana/web3.js");
const bs58 = require("bs58");

async function main() {
  const connection = new solanaWeb3.Connection(
    "https://api.devnet.solana.com",
    {
      wsEndpoint: "wss://api.devnet.solana.com/",
    }
  );

  const walletKeyPair = solanaWeb3.Keypair.fromSecretKey(
    new Uint8Array([
      // PUT YOUR WALLET KEYPAIR HERE
    ])
  );

  // Create Stake Account
  const stakeAccount = solanaWeb3.Keypair.generate();
  const createStakeAccountInstruction = solanaWeb3.StakeProgram.createAccount({
    fromPubkey: walletKeyPair.publicKey,
    stakePubkey: stakeAccount.publicKey,
    authorized: new solanaWeb3.Authorized(
      walletKeyPair.publicKey,
      walletKeyPair.publicKey
    ),
    lamports: solanaWeb3.LAMPORTS_PER_SOL * 0.2,
  });

  let createStakeAccountTransaction = new solanaWeb3.Transaction().add(
    createStakeAccountInstruction
  );
  createStakeAccountTransaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  createStakeAccountTransaction.feePayer = walletKeyPair.publicKey;
  createStakeAccountTransaction.partialSign(stakeAccount);
  await solanaWeb3.sendAndConfirmTransaction(
    connection,
    createStakeAccountTransaction,
    [walletKeyPair, stakeAccount]
  );

  console.log("stakePubkey: ", stakeAccount.publicKey.toString());
  console.log("walletKeyPair.publicKey: ", walletKeyPair.publicKey.toString());

  // Delegate Stake
  const votePubkey = new solanaWeb3.PublicKey(
    "dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV"
  );
  const delegateInstruction = solanaWeb3.StakeProgram.delegate({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: walletKeyPair.publicKey,
    votePubkey,
  });

  let delegateTransaction = new solanaWeb3.Transaction().add(
    delegateInstruction
  );
  delegateTransaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  delegateTransaction.feePayer = walletKeyPair.publicKey;
  delegateTransaction.sign(walletKeyPair);
  await solanaWeb3.sendAndConfirmTransaction(connection, delegateTransaction, [
    walletKeyPair,
  ]);
}

main();
