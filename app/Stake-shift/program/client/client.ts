import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import type { ShiftStakeBookkeeper } from "../target/types/shift_stake_bookkeeper";

// Configure the client to use the local cluster
const connection = new web3.Connection("https://api.devnet.solana.com", "confirmed");
const wallet = new anchor.Wallet(
  Keypair.fromSecretKey(
    Buffer.from(
      JSON.parse(
        require('fs').readFileSync(
          '/root/.config/solana/id.json',
          'utf-8'
        )
      )
    )
  )
);
const provider = new anchor.AnchorProvider(connection, wallet, {});
anchor.setProvider(provider);

const idl = require("../target/idl/shift_stake_bookkeeper.json");
const programId = new PublicKey("YrN37FF9AdJZrqxSeWsrLWJ6UEp2ZEZPwqkPcUu3YQY");

// Replace this line:
// const program = anchor.workspace.ShiftStakeBookkeeper as anchor.Program<ShiftStakeBookkeeper>;
// With:
const program = new anchor.Program(idl, provider) as anchor.Program<ShiftStakeBookkeeper>;

let accountInfo: Buffer | null = null;
const systemProgram = anchor.web3.SystemProgram;
let onRequestAddedEventListener: number | null = null;

// Client
console.log("My address:", program.provider.publicKey.toString());
console.log("Program_ID:", program.programId.toString());
// const balance = await program.provider.connection.getBalance(program.provider.publicKey);
// console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

//Example of using. Default call without finding cycles
// ShiftStake(
//   new PublicKey("CimoAGumRFTdNvcmh8KhpTnZM5WCPryYVLqRSKh6CDft"),
//   new PublicKey("AfxNMBuApFSqNR39U2eqX1pJajmj2ai31dtTorMtQn3i"),
//   new BN(123456789) 
// );

console.log("\n=== Starting basic cycle test ===");
testSimpleCycle().catch(console.error);

async function testSimpleCycle() {
    const validator1 = new PublicKey("CimoAGumRFTdNvcmh8KhpTnZM5WCPryYVLqRSKh6CDft");
    const validator2 = new PublicKey("AfxNMBuApFSqNR39U2eqX1pJajmj2ai31dtTorMtQn3i");

    try {
        console.log("\nStep 1: A -> B");
        await ShiftStake(
            validator1,
            validator2,
            new BN(100000000)
        );
        
        // Wait for transaction to be confirmed
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log("\nStep 2: B -> A");
        await ShiftStake(
            validator2,
            validator1,
            new BN(150000000)
        );

        console.log("\nCycle test completed!");
    } catch (error) {
        console.error("Cycle test failed:", error);
    }
}

console.log("\n=== Starting triangle cycle test ===");
testTriangleCycle().catch(console.error);

async function testTriangleCycle() {
    const validator1 = new PublicKey("CimoAGumRFTdNvcmh8KhpTnZM5WCPryYVLqRSKh6CDft");
    const validator2 = new PublicKey("AfxNMBuApFSqNR39U2eqX1pJajmj2ai31dtTorMtQn3i");
    const validator3 = new PublicKey("HzqnaMjWFbK2io6WgF2LF2WXxvwZrRKLHxwspkJvYFiU");

    try {
        console.log("\nStep 1: A -> B");
        await ShiftStake(
            validator1,
            validator2,
            new BN(200000000)
        );
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log("\nStep 2: B -> C");
        await ShiftStake(
            validator2,
            validator3,
            new BN(250000000)
        );
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log("\nStep 3: C -> A (completing the cycle)");
        await ShiftStake(
            validator3,
            validator1,
            new BN(300000000)
        );

        console.log("\nTriangle cycle test completed!");
    } catch (error) {
        console.error("Triangle cycle test failed:", error);
    }
}

async function ShiftStake(
  From_Validator_PK: PublicKey,
  To_Validator_PK: PublicKey,
  lamport_amount: BN
) {
  const [bookkeeperPublicKey, bump] =
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("solana_beach"), Buffer.from("user_4234989")],
      program.programId
    );

  console.log("Checking account . . . ");
  const accountInfoResponse = await program.provider.connection.getAccountInfo(bookkeeperPublicKey);
  accountInfo = accountInfoResponse?.data ?? null;

  if (!accountInfoResponse) {
    console.log("Bookkeeper-account does not exist yet!");
  } else {
    console.log(`Bookkeeper PDA address is ${accountInfo}`);
  }
  
  console.log("Bookkeeper PDA:", bookkeeperPublicKey.toString());

  let bookkeeper_result = await CreateBookkeeper(bookkeeperPublicKey);
  let request_result = await AddRequest(
    From_Validator_PK,
    To_Validator_PK,
    lamport_amount,
    bookkeeperPublicKey
  );
}

async function CreateBookkeeper(bookkeeperPublicKey: PublicKey) {
//   const accountInfo = await program.provider.connection.getAccountInfo(
//     bookkeeperPublicKey
//   );
  console.log("- - -  call from CreateBookkeeper()")


  if (!accountInfo) {
    try {
      const tx = await program.methods
        .createBookkeeper()
        .accounts([
          { authority: program.provider.publicKey },
          { bookkeeper: bookkeeperPublicKey.toString() },
          { systemProgram: web3.SystemProgram.programId },
        ])
        .rpc();
      console.log("Created bookkeeper");
      console.log("Bookeeper_pubkey: ", bookkeeperPublicKey.toString());
      console.log("Transaction successful:", tx);
      console.log("Your transaction signature", tx);
      onRequestAddedEventListener = await AddEventListenerOnRequestAdded();

    } catch (error) {  //switch to .catch(error) instead?
      if (
        error.message.includes(
          "failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0"
        )
      ) {
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  }
  else {
    console.info(
        //then just add to a bookkeeper
      "Bookkeeper account already exists at this address. Just adding a request to existing Bookkeeper"
    );
    let bookkeeper_state = await program.account.bookkeeper.fetch(bookkeeperPublicKey);
    console.log(`Current number of requests in a Bookkeeper: ${bookkeeper_state.requestCount.toNumber()}`)
  }
}

async function AddRequest(
  From_Validator_PK: PublicKey,
  To_Validator_PK: PublicKey,
  lamport_amount: BN,
  bookkeeper_pubkey: PublicKey
) {
  const moveStakeInstruction = {
    sourceStakePubkey: new PublicKey(From_Validator_PK),
    destinationStakePubkey: new PublicKey(To_Validator_PK),
    authorizedPubkey: new PublicKey(program.provider.publicKey),
    lamportsToMove: lamport_amount, // Use BN for u64
  };
  let request_keypair = web3.Keypair.generate(); //<------------- this is just a stub, put a real one
  console.log(`- - -  call from AddRequest(), bookkeeper_status ${bookkeeper_pubkey}`)
  let tx;
  try {
    tx = await program.methods
      .createRequest(moveStakeInstruction)
      .accountsPartial({
        request: request_keypair.publicKey,
        user: program.provider.publicKey,
        systemProgram: systemProgram.programId,
        bookkeeper: bookkeeper_pubkey,
      })
      .signers([request_keypair])
      .rpc();

    console.log("Added a new request: " + request_keypair.publicKey);
    console.log("Your transaction signature", tx);
  }

  catch (error) { console.error(`Creating Request failed: ${error}`); }

}

async function AddEventListenerOnRequestAdded() {
  const eventListener = program.addEventListener("onRequestAdded", (event, slot) => {
    console.log(
      `OnRequestAdded Event Fired:\n` +
      `Slot: ${slot}\n` +
      `Message: ${event.message}\n` +
      `Request Pubkey: ${event.requestPubkey}\n` +
      `Request Count: ${event.requestCount}\n` +
      `Authorized Pubkey: ${event.authorizedPubkey}\n` +
      `Source Stake Pubkey: ${event.sourceStakePubkey}\n` +
      `Destination Stake Pubkey: ${event.destinationStakePubkey}\n` +
      `Lamports to Move: ${event.lamportsToMove}\n` +
      `Timestamp: ${new Date(event.timestamp.toNumber() * 1000).toISOString()}`
    );
  });
  console.log("Initialized Event Listener");
  return eventListener;
}


async function RemoveEventListenerOnRequestAdded(){
  program.removeEventListener(onRequestAddedEventListener);
}

// async function startDaemon(){
//   while(true){
//     console.log("Waiting for new events...";
//     await delay(2000);  // Wait for 2 seconds
//   console.log("After delay");
// }
// //doesn't workin web IDE because of setTimeout()
// function delay(ms: number): Promise<void> {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }