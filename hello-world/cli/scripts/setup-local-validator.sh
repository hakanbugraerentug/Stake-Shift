#!/bin/bash
## Solana Local Validator Setup
# @author: hakanbugraerentug
# 4 Nov 2024


## VERSION CONTROL
# Expected version of solana-cli
EXPECTED_VERSION="1.18.23"

# Get the installed version of solana-cli
INSTALLED_VERSION=$(solana --version | awk '{print $2}')

# Check if the installed version matches the expected version
if [ "$INSTALLED_VERSION" == "$EXPECTED_VERSION" ]; then
    echo "solana-cli version is correct: $INSTALLED_VERSION"
else
    echo "solana-cli version is incorrect. Expected: $EXPECTED_VERSION, but found: $INSTALLED_VERSION"
fi

## KEY CONTROL
# Path to the keypair file
KEYPAIR_PATH="$HOME/.config/solana/id.json"  # Change this to your actual keypair path if different

# Check if the keypair file exists
if [ -f "$KEYPAIR_PATH" ]; then
    echo "Keypair file exists at: $KEYPAIR_PATH"
else
    echo "Keypair file does not exist at: $KEYPAIR_PATH"
    echo "Generating a new keypair..."
    
    # Generate a new keypair and save it to the specified path
    solana-keygen new --no-passphrase --outfile "$KEYPAIR_PATH" --force
    if [ $? -eq 0 ]; then
        echo "New keypair generated and saved to: $KEYPAIR_PATH"
    else
        echo "Failed to generate a new keypair."
        exit 1
    fi
fi


## SUBNET CONTROL
# Get the current Solana configuration
CURRENT_URL=$(solana config get | grep "RPC URL" | awk '{print $3}')

# Check if the current URL is localhost
if [ "$CURRENT_URL" != "http://127.0.0.1:8899" ]; then
    echo "Current RPC URL is not localhost: $CURRENT_URL"
    echo "Setting RPC URL to localhost..."
    
    # Set the RPC URL to localhost
    solana config set --url http://127.0.0.1:8899
    if [ $? -eq 0 ]; then
        echo "RPC URL successfully set to localhost."
    else
        echo "Failed to set RPC URL to localhost."
        exit 1
    fi
else
    echo "RPC URL is already set to localhost: $CURRENT_URL"
fi


# Check balance
echo "Checking balance..."
BALANCE=$(solana balance --keypair "$KEYPAIR_PATH")
echo "Balance: $BALANCE"

# Request airdrop (1 SOL in this example)
#echo "Requesting airdrop of 500_000 SOL..."
#AIRDROP_OUTPUT=$(solana airdrop 500000 --keypair "$KEYPAIR_PATH")

#if [[ $AIRDROP_OUTPUT == *"Airdropped"* ]]; then
#    echo "$AIRDROP_OUTPUT"
#else
#    echo "Failed to request airdrop. Output: $AIRDROP_OUTPUT"
#    exit 1
#fi


# Print account-related information
echo "Fetching account-related information..."
ACCOUNT_INFO=$(solana account "$(solana-keygen pubkey "$KEYPAIR_PATH")")

# Print the account information
echo "Account Information:"
echo "$ACCOUNT_INFO"