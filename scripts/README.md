# Dappr Deployment Scripts

This directory contains scripts to deploy and initialize the Dappr program and tokens.

## Prerequisites

- Node.js 16 or later
- Yarn or npm
- Solana CLI installed and configured
- Local Solana validator running (for local development)

## Setup

1. Install dependencies:

```bash
cd scripts
npm install
# or
yarn install
```

2. Build the SDK (from the project root):

```bash
cd ..
cd sdk
yarn install
yarn build
```

## Deployment

### Local Deployment

1. Start a local Solana validator:

```bash
solana-test-validator
```

2. In a new terminal, deploy the program (from the project root):

```bash
# Build the program
anchor build

# Deploy the program
anchor deploy --program-name dappr --provider.cluster localnet

# Run the deployment script
cd scripts
npm run deploy
```

### Devnet Deployment

1. Configure Solana CLI for devnet:

```bash
solana config set --url devnet
```

2. Request devnet SOL:

```bash
solana airdrop 2
```

3. Deploy the program:

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --program-name dappr --provider.cluster devnet

# Run the deployment script (update the cluster URL in the script first)
cd scripts
npm run deploy
```

## Scripts

- `deploy.ts`: Main deployment script that initializes token mints and mints initial supply

## Deployment Output

After successful deployment, a `deployment.json` file will be created in the project root with the following structure:

```json
{
  "timestamp": "2023-03-15T12:00:00.000Z",
  "programId": "YOUR_PROGRAM_ID",
  "tokens": {
    "DAPPR_GOV": {
      "mint": "GOV_MINT_ADDRESS",
      "name": "DAPPR Governance Token",
      "symbol": "DAPPR_GOV",
      "decimals": 9
    },
    "DAPPR_USD": {
      "mint": "USD_MINT_ADDRESS",
      "name": "DAPPR USD",
      "symbol": "DAPPR_USD",
      "decimals": 6
    }
  },
  "network": "localnet"
}
```

## Verifying the Deployment

You can verify the token mints using the Solana Explorer:

1. For localnet: Open `http://localhost:3000/account/GOV_MINT_ADDRESS` (replace with your mint address)
2. For devnet: Open `https://explorer.solana.com/address/USD_MINT_ADDRESS?cluster=devnet`

## Troubleshooting

- **Insufficient SOL**: Make sure your wallet has enough SOL for transaction fees
- **Program not deployed**: Ensure you've run `anchor deploy` before running the scripts
- **RPC errors**: Check that your local validator is running (for localnet) or that you're connected to the correct cluster

For more information, refer to the main [README](../README.md).
