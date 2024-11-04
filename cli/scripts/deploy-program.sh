#!/bin/bash

# Set the path to the program's target directory
PROGRAM_DIR="../program/target/deploy"
PROGRAM_NAME="hello_world" 

# Check if the local validator is running
#if ! solana ping; then
#    echo "Local validator is not running. Please start it using 'solana-test-validator'."
#    exit 1
#fi

# Build the program
echo "Building the Solana program..."
cargo build-bpf --manifest-path="../../program/Cargo.toml" --bpf-out-dir="$PROGRAM_DIR"

# Check if the build was successful
if [[ $? -ne 0 ]]; then
    echo "Build failed. Please check the error messages above."
    exit 1
fi

# Deploy the program to the Solana cluster
echo "Deploying the Solana program..."
solana program deploy "$PROGRAM_DIR/$PROGRAM_NAME.so"

# Check if the deployment was successful
if [[ $? -eq 0 ]]; then
    echo "Program deployed successfully."
else
    echo "Deployment failed. Please check the error messages above."
    exit 1
fi
