const solanaWeb3 = require("@solana/web3.js");

const connection = new solanaWeb3.Connection("https://api.devnet.solana.com", {
  wsEndpoint: "wss://api.devnet.solana.com/",
});

const stakeAccount = solanaWeb3.Keypair.generate();
const mainWallet = solanaWeb3.Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(require("fs").readFileSync("./hakan.json", "utf-8"))
  )
);

async function stakeSOL(stakeAmount, validatorPubKey) {
  const lamports = stakeAmount * solanaWeb3.LAMPORTS_PER_SOL; // Convert SOL to lamports

  // Create the stake account
  const createStakeAccountInstruction = solanaWeb3.StakeProgram.createAccount({
    fromPubkey: mainWallet.publicKey,
    stakePubkey: stakeAccount.publicKey,
    authorized: new solanaWeb3.Authorized(
      mainWallet.publicKey,
      mainWallet.publicKey
    ),
    lockup: new solanaWeb3.Lockup(0, 0, mainWallet.publicKey),
    lamports,
  });

  // Delegate the stake
  const delegateInstruction = solanaWeb3.StakeProgram.delegate({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: mainWallet.publicKey,
    votePubkey: validatorPubKey,
  });

  const transaction = new solanaWeb3.Transaction().add(
    createStakeAccountInstruction,
    delegateInstruction
  );

  // Sign transaction
  const signature = await solanaWeb3.sendAndConfirmTransaction(
    connection,
    transaction,
    [mainWallet, stakeAccount]
  );

  console.log("Transaction signature", signature);
}

const validatorPubKey = new solanaWeb3.PublicKey(
  "dv2eQHeP4RFrJZ6UeiZWoc3XTtmtZCUKxxCApCDcRNV"
);
const stakeAmount = 0.2; // Amount in SOL

stakeSOL(stakeAmount, validatorPubKey).catch(console.error);
