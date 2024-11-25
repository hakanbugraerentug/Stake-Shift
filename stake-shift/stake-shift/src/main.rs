#[allow(unused_imports)]
use solana_program::{
    instruction::{AccountMeta, Instruction},
    program_pack::Pack,
    pubkey::Pubkey,
    pubkey,
    system_instruction,
    system_program,
    stake::{
        instruction::{create_account,delegate_stake,move_stake},
        state::{Authorized, Lockup},
    }
};
#[allow(unused_imports)]
use solana_sdk::{
    signature::{Keypair, Signer, read_keypair_file},
    transaction::Transaction,
    stake::{state::{Stake}}
};

use solana_client::rpc_client::RpcClient;


// Function to print a Vec<Instruction>
fn print_instructions(instructions: &Vec<Instruction>) {

    println!("================ INSTRUCTIONS ================");

    for (i, instruction) in instructions.iter().enumerate() {
        println!("Instruction {}:", i);
        println!("  Program ID: {}", instruction.program_id);
        println!("  Data: {:?}", instruction.data);
        println!("  Accounts: {:?}", instruction.accounts);
    }
}

fn main() {

    // Connect to RPC client. (devnet)
    const RPC_URL: &str = "https://api.devnet.solana.com ";
    let client = RpcClient::new(RPC_URL);

    // 1. Define keypairs for wallets
    // dont forget to put your PATH
    let payer = read_keypair_file("/home/cypher/.config/solana/id.json").expect("Failed to read keypair file");
    let stake_account = Keypair::new(); // Yeni stake hesabı

    println!("Payer Public Key: {}", payer.pubkey());
    println!("Stake Account: {}", stake_account.pubkey());


    // 2. Take public key from Stake Program
    let stake_program_id = solana_program::stake::program::id();
    println!("stake_program_id: {}", stake_program_id);

    //println!("stake_program_id", stake_program_id);
    // 3. set lamport required (included rent)
    let lamports_required = 1_000_000_000; // for example 1 SOL
    let lamports_to_move = 500_000_000; // for example 0.5 SOL

    // 4. set authorizations
    let authorized = Authorized {
        staker: payer.pubkey(),     // stake manager
        withdrawer: payer.pubkey(), // withdraw manager
    };

    // DONT LOCK UP.
    let lockup = Lockup::default();

    // 6. create_account_instructions
    let create_account_instructions = create_account(
        &payer.pubkey(),            // payer
        &stake_account.pubkey(),    // new stake account
        &authorized,                // auth
        &lockup,                    // lockup time
        lamports_required,          // Lamports amount
    );

    let validator_vote_pubkey = pubkey!("i7NyKBMJCA9bLM2nsGyAGCKHECuR2L5eh4GqFciuwNT");
    let destination_stake_pubkey = pubkey!("vgcDar2pryHvMgPkKaZfh8pQy4BJxv7SpwUG7zinWjG");
    
    println!("validator_vote_pubkey: {}", validator_vote_pubkey);
    println!("destination_stake_pubkey: {}", destination_stake_pubkey);


    // 7. delegate_stake_instruction
    let delegate_stake_instruction = delegate_stake(
        &stake_account.pubkey(), // stake account
        &payer.pubkey(),      // authenticated account
        &validator_vote_pubkey //validator vote account
    );
    

    // 8. Create Move Stake Instruction
    let move_stake_instruction = move_stake(
            &validator_vote_pubkey, // source_stake_pubkey
            &destination_stake_pubkey, // destination_stake_pubkey
            &payer.pubkey(),      // authorized_pubkey
            lamports_to_move // lamports
        );


    // Create the transaction with both instructions
    let mut instructions: Vec<Instruction> = Vec::new();
    
    // Extend the create_account_instructions into the instructions vector
    instructions.extend(create_account_instructions);  // Add the create_account instructions
    instructions.push(delegate_stake_instruction);  // Add the delegate_stake instruction
    instructions.push(move_stake_instruction);  // Add the move_stake instruction

    print_instructions(&instructions);
    
    // Create a transaction
    let transaction = Transaction::new_signed_with_payer(
        &instructions,
        Some(&payer.pubkey()),  // payer as the transaction's payer
        &[&payer, &stake_account],  // Signers for the transaction
        client.get_latest_blockhash().unwrap(),  // Get recent blockhash for the transaction
    );


    // Send the transaction
    let result = client.send_and_confirm_transaction(&transaction);

    match result {
        Ok(signature) => println!("Transaction successful, signature: {}", signature),
        Err(err) => println!("Error sending transaction: {:?}", err),
    };
    
}
