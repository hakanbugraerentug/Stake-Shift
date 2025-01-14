# Stake Shift Frontend

## Installation Guide

### 1. Install Node.js
First, install Node.js (v16 or higher):
```bash
# Using Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install Yarn
Install Yarn package manager:
```bash
# Using npm
npm install --global yarn

# Verify installation
yarn --version
```

### 3. Project Setup
Clone and set up the project:
```bash
# Navigate to frontend directory
cd Stake-Shift/app/frontend

# Install dependencies
yarn install

# Install additional required packages
yarn add @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui
yarn add @coral-xyz/anchor
yarn add clsx tailwind-merge
yarn add lucide-react
yarn add date-fns
```

### 4. Development

Start the development server:
```bash
yarn dev
```
The application will be available at `http://localhost:5173`

### 5. Build

Create a production build:
```bash
yarn build
```

### Common Issues

1. If you get node-gyp errors:
```bash
sudo apt-get install -y python3 make g++
```

2. If you get permission errors:
```bash
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ~/.config
```

3. If Vite complains about missing dependencies:
```bash
yarn add -D @types/node
```