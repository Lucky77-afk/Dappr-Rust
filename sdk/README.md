# Dappr SDK

TypeScript SDK for interacting with the Dappr Solana program. This SDK provides a clean, type-safe interface for working with DAPPR_GOV and DAPPR_USD tokens.

## Installation

```bash
# Using npm
npm install @dappr/sdk

```

## Prerequisites

- Node.js 16 or later
- Yarn or npm
- Solana CLI (for local development)

## Features

- **Token Management**: Mint, burn, and transfer DAPPR tokens
- **Escrow System**: Create and manage milestone-based token escrows
- **Multi-signature Support**: Secure emergency withdrawal functionality
- **TypeScript Support**: Fully typed API for better developer experience
- **Event System**: Subscribe to on-chain events

## Usage

### Initializing the Client

```typescript
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { DapprClient } from '@dappr/sdk';

// Initialize connection
const connection = new Connection(clusterApiUrl('devnet'));
const wallet = Keypair.generate(); // Use your wallet here

// Create client
const dapprClient = new DapprClient({
  connection,
  wallet: {
    publicKey: wallet.publicKey,
    signTransaction: (tx) => wallet.signTransaction(tx),
    signAllTransactions: (txs) => Promise.all(txs.map(tx => wallet.signTransaction(tx))),
  },
});
```

### Initializing Tokens

```typescript
// Initialize the token mints
const { dapprGovMint, dapprUsdMint } = await dapprClient.initializeTokens();
console.log('DAPPR_GOV Mint:', dapprGovMint.toString());
console.log('DAPPR_USD Mint:', dapprUsdMint.toString());
```

### Minting Tokens

```typescript
// Mint DAPPR_GOV tokens to a recipient
const recipient = new PublicKey('recipient-public-key-here');
const amount = 1000; // Amount in token's smallest unit (wei/lamports)

const txSignature = await dapprClient.mintTokens(
  dapprGovMint,
  recipient,
  amount
);
console.log('Mint transaction:', txSignature);
```

### Burning Tokens

```typescript
// Burn DAPPR_GOV tokens
const amount = 500; // Amount in token's smallest unit (wei/lamports)

const txSignature = await dapprClient.burnTokens(
  dapprGovMint,
  amount
);
console.log('Burn transaction:', txSignature);
```

## Token Information

### DAPPR_GOV (Governance Token)
- **Name**: DAPPR Governance Token
- **Symbol**: DAPPR_GOV
- **Decimals**: 9
- **Purpose**: Used for voting on governance proposals

### DAPPR_USD (Utility Token)
- **Name**: DAPPR USD
- **Symbol**: DAPPR_USD
- **Decimals**: 6
- **Purpose**: Used for transactions and payments within the platform

## Development

### Building the SDK

```bash
yarn install
yarn build
```

### Running Tests

```bash
yarn test
```

### Linting

```bash
yarn lint
```

## License

MIT
