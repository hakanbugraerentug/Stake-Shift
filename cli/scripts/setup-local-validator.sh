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


