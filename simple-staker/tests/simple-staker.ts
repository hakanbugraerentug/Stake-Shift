import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { SimpleStaker } from "../target/types/simple_staker";
import { join } from "path";
import { readFileSync } from "fs";

import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("simple-staker", () => {
  // Configure the client to use the local cluster.

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SimpleStaker as Program<SimpleStaker>;

  // Add your test here.
  const WALLET_PATH = join(process.env["HOME"]!, ".config/solana/id.json");
  console.log("Your wallet Path:", WALLET_PATH);

  const admin = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(readFileSync(WALLET_PATH, { encoding: "utf-8" })))
  );
  console.log("admin (in our localhost)", admin.publicKey.toString());

  let adminTokenAccount: PublicKey;
  const user = Keypair.generate();
  const poolInfo = Keypair.generate();
  const userInfo = Keypair.generate();
  const MINT_AMOUNT = 10;

  // Minting Steps
  // Confirm airdrop occured.
  it("Airdrops SOL to the payer account", async () => {
    const airdropSignature = await provider.connection.requestAirdrop(
      user.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    const latestBlockHash = await provider.connection.getLatestBlockhash();

    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    let balance = await provider.connection.getBalance(user.publicKey);
    console.log(`Balance for ${user.publicKey}: ${balance} SOL`);

    assert.strictEqual(
      balance,
      10 * LAMPORTS_PER_SOL,
      "Something is wrong with airdrop amount."
    );
  });

  // it("Creates a new SPL token mint", async () => {
  //   // Create a new mint
  //   const mint = await createMint(
  //     provider.connection, // Connection to Solana
  //     provider.wallet.payer as Keypair, // Payer of the transaction fees
  //     admin.publicKey, // Authority for minting tokens
  //     null, // Freeze authority (optional, here it’s not used)
  //     9 // Number of decimal places for the token
  //   );
  //
  //   console.log("Token Mint Address:", mint.toBase58());
  //
  //   adminTokenAccount = await getOrCreateAssociatedTokenAccount(
  //     provider.connection,
  //     admin,
  //     mint,
  //     admin.publicKey
  //   );
  //   console.log("Token Account Address:", adminTokenAccount.address.toBase58());
  //
  //   // Mint tokens to the token account
  //   await mintTo(
  //     provider.connection,
  //     admin,
  //     mint,
  //     adminTokenAccount.address,
  //     admin,
  //     MINT_AMOUNT * 10 ** 9 // Amount in smallest units
  //   );
  //
  //   console.log(
  //     `Minted ${MINT_AMOUNT} tokens to account: ${adminTokenAccount.address.toBase58()}`
  //   );
  // });
  //
  // it("Initialize", async () => {
  //   let adminTokenAccountBalance =
  //     await provider.connection.getTokenAccountBalance(
  //       adminTokenAccount.address
  //     );
  //   console.log("adminTokenAccountBalance: ", adminTokenAccountBalance);
  //   assert.strictEqual(
  //     adminTokenAccountBalance.value.amount.toString(),
  //     "10000000000"
  //   );
  //
  //   const tx = await program.methods
  //     .initialize(new BN(1), new BN(1e10))
  //     .accounts({
  //       admin: admin.publicKey,
  //       poolInfo: poolInfo.publicKey,
  //       stakingToken: token.publicKey,
  //       adminStakingWallet: adminTokenAccount,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .signers([admin, poolInfo])
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  // });
});
