# Stake-Shift Program

## Installation Guide

### 1. Install ts-node and TypeScript globally
```bash
npm install -g ts-node typescript @types/node
```

### 2. Install Program Dependencies
```bash
# Navigate to program directory
cd Stake-Shift/app/program

# Install dependencies
npm install

# Install required packages for client
npm install \
  @solana/web3.js \
  @coral-xyz/anchor \
  @types/bn.js \
  bn.js \
  dotenv
```

### 3. Configure Solana
```bash
# Install Solana CLI tools
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Set up CLI
solana-keygen new -o id.json
solana config set --url https://api.devnet.solana.com
solana airdrop 2 $(solana-keygen pubkey id.json)
```

### 4. Run Client Scripts
```bash
# Navigate to client directory
cd client

# Run event listener
ts-node event-listener.ts

# Run main client
ts-node client.ts
```

### Common Issues

1. If you get TS-Node errors:
```bash
# Ensure typescript is installed
npm install -g typescript

# Check ts-node version
ts-node --version
```

2. If you get module not found errors:
```bash
# Install missing types
npm install -D @types/node @types/bn.js
```

3. If you get Solana connection errors:
```bash
# Verify Solana connection
solana config get
solana balance
``` 
![image](https://github.com/user-attachments/assets/3446edfe-d85a-491c-acbd-96c30961b6be)
![image](https://github.com/user-attachments/assets/8a3a6cf6-666a-460b-8c59-9d11d6eadade)
![image](https://github.com/user-attachments/assets/1965e043-3a8e-4909-9df1-282657f6ace3)


