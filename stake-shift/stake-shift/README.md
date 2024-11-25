# StakeShift

### 1. Check for your configuration

```sh
$ >> solana config get
Config File: /home/cypher/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com 
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/cypher/.config/solana/id.json 
Commitment: confirmed 
```
### 2.1 - Airdrop - Devnet

```sh
solana airdrop 5
```

### 2.2 - Run your test validator - Localhost

- Remove your test-ledger folder if exist
- Change your slots per epoch on your preference about epoch lenght.
- One slot appx 0.4 seconds. 400 miliseconds
- 3000 slot == 20 minute

```sh
solana-test-validator --slots-per-epoch 3000
```


## Explaination of the code

### Phase 0 - Configuration

- Set RPC URL
```rust
   40 const RPC_URL: &str = "https://api.devnet.solana.com ";
```
- Set keypair file path
```rust
   45 let payer = read_keypair_file("/home/cypher/.config/solana/id.json").expect("Failed to read keypair file");
```
- Set SOL amount for delegating
```rust
   58 let lamports_required = 1_000_000_000; // For example 1 SOL
   59 let lamports_to_move = 500_000_000; // for example 0.5 SOL
```

- Check validators by `solana validators`
- set one validator to delegate and one validator to move your delegation
```rust
    79 let validator_vote_pubkey = pubkey!("i7NyKBMJCA9bLM2nsGyAGCKHECuR2L5eh4GqFciuwNT");
    80 let destination_stake_pubkey = pubkey!("vgcDar2pryHvMgPkKaZfh8pQy4BJxv7SpwUG7zinWjG");
```

### Phase 1 - Creating Stake Account

```rust
    // 6. create_account_instructions
    let create_account_instructions = create_account(
        &payer.pubkey(),            // payer
        &stake_account.pubkey(),    // new stake account
        &authorized,                // auth
        &lockup,                    // lockup time
        lamports_required,          // Lamports amount
    );
```

### Phase 2 - Delegate

```rust
    // 7. delegate_stake_instruction
    let delegate_stake_instruction = delegate_stake(
        &stake_account.pubkey(), // stake account
        &payer.pubkey(),      // authenticated account
        &validator_vote_pubkey //validator vote account
    );
```

### Phase 3 - Create MoveStake Instruction

```rust
    // 8. Create Move Stake Instruction
    let move_stake_instruction = move_stake(
            &validator_vote_pubkey, // source_stake_pubkey
            &destination_stake_pubkey, // destination_stake_pubkey
            &payer.pubkey(),      // authorized_pubkey
            lamports_to_move // lamports
        );
```

### Phase 4 - Create Single Transaction by Instructions

```rust
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
```

### Phase 5 - Send Tx FINALLY

```rust
    // Send the transaction
    let result = client.send_and_confirm_transaction(&transaction);

    match result {
        Ok(signature) => println!("Transaction successful, signature: {}", signature),
        Err(err) => println!("Error sending transaction: {:?}", err),
    };
```
