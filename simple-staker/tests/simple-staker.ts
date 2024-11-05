import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SimpleStaker } from "../target/types/simple_staker";
import { join } from "path";
import { readFileSync } from "fs";

import { Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

describe("simple-staker", () => {
  // Configure the client to use the local cluster.

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SimpleStaker as Program<SimpleStaker>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);

    const WALLET_PATH = join(process.env["HOME"]!, ".config/solana/id.json");
    console.log("Your wallet Path:", WALLET_PATH);

    const admin = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(readFileSync(WALLET_PATH, { encoding: "utf-8" })))
    );
    console.log("admin (in our localhost)", admin.publicKey);

    const user = Keypair.generate();
    const poolInfo = Keypair.generate();
    const userInfo = Keypair.generate();

    let token: Token;
    let adminTokenAccount: PublicKey;
    let userTokenAccount: PublicKey;

    // Minting Steps
    before(async () => {
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(
          user.publicKey,
          10 * LAMPORTS_PER_SOL
        ),
        "confirmed"
      );

      // create our first spl token
      token = await Token.createMint(
        provider.connection, // Connections
        admin, // Our localhost admin will be payer
        admin.publicKey, // mint Authority is admin
        null, // No freezeAuthority
        9, // 9 decimal 1_000_000_000
        TOKEN_PROGRAM_ID // SPL token progra id
      );

      adminTokenAccount = await token.createAccount(admin.publicKey);
      userTokenAccount = await token.createAccount(user.publicKey);

      // give our use 10 SPL => 10_000_000_000
      await token.mintTo(userTokenAccount, admin.publicKey, [admin], 1e10);

      console.log("Minting is successfull");
    });
  });
});
