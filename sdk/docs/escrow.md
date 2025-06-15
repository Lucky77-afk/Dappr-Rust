# Dappr Escrow Module

The Escrow module provides a secure way to manage milestone-based token escrows on Solana. It allows for the creation of escrow accounts, adding milestones, funding, completing milestones, and releasing funds. It also includes emergency withdrawal functionality with multi-signature support.

## Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [EscrowClient](#escrowclient)
  - [Types](#types)
  - [Errors](#errors)
- [Examples](#examples)
  - [Creating an Escrow](#creating-an-escrow)
  - [Adding Milestones](#adding-milestones)
  - [Funding an Escrow](#funding-an-escrow)
  - [Completing a Milestone](#completing-a-milestone)
  - [Releasing Funds](#releasing-funds)
  - [Emergency Withdrawal](#emergency-withdrawal)

## Installation

```bash
npm install @dappr/sdk
```

## Getting Started

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { DapprClient } from '@dappr/sdk';

// Initialize connection and wallet
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate(); // Use your wallet here

// Initialize Dappr client
const dapprClient = new DapprClient({
  connection,
  wallet,
});

// Get the Escrow client
const escrowClient = dapprClient.escrow;
```

## API Reference

### EscrowClient

#### `initializeEscrow(recipient: PublicKey, milestonesCount: number): Promise<{ escrow: PublicKey; tx: string }>`
Initialize a new escrow with the specified recipient and number of milestones.

#### `addMilestone(escrow: PublicKey, milestoneIndex: number, amount: number, deadline: number): Promise<{ milestone: PublicKey; tx: string }>`
Add a milestone to an existing escrow.

#### `fundEscrow(escrow: PublicKey, tokenMint: PublicKey, amount: number): Promise<string>`
Fund an escrow with tokens.

#### `completeMilestone(escrow: PublicKey, milestoneIndex: number): Promise<string>`
Mark a milestone as completed.

#### `releaseFunds(escrow: PublicKey, milestoneIndex: number, tokenMint: PublicKey, recipient: PublicKey): Promise<string>`
Release funds for a completed milestone.

#### `initiateEmergencyWithdrawal(escrow: PublicKey, creator: PublicKey, signers: PublicKey[]): Promise<{ multisig: PublicKey; tx: string }>`
Initiate an emergency withdrawal process with multi-signature support.

#### `signEmergencyWithdrawal(escrow: PublicKey): Promise<string>`
Sign an emergency withdrawal request.

#### `getEscrow(escrow: PublicKey): Promise<Escrow>`
Get escrow account data.

#### `getMilestone(milestone: PublicKey): Promise<Milestone>`
Get milestone account data.

#### `getMultisig(multisig: PublicKey): Promise<Multisig>`
Get multisig account data.

### Types

#### `Escrow`
```typescript
interface Escrow {
  creator: PublicKey;
  recipient: PublicKey;
  tokenMint: PublicKey;
  tokenAccount: PublicKey;
  totalAmount: BN;
  releasedAmount: BN;
  milestonesCount: number;
  status: EscrowStatus;
  createdAt: BN;
  updatedAt: BN;
}
```

#### `Milestone`
```typescript
interface Milestone {
  index: number;
  amount: BN;
  deadline: BN;
  status: MilestoneStatus;
  completedAt: BN | null;
  paidAt: BN | null;
}
```

#### `Multisig`
```typescript
interface Multisig {
  escrow: PublicKey;
  signers: PublicKey[];
  signatures: boolean[];
  threshold: number;
  createdAt: BN;
  executed: boolean;
}
```

### Errors

- `EscrowError`: Base error class for all escrow-related errors.
- `EscrowNotFundedError`: Thrown when trying to perform actions on an unfunded escrow.
- `MilestoneNotCompletedError`: Thrown when trying to release funds for an incomplete milestone.
- `DeadlineNotReachedError`: Thrown when trying to complete a milestone before its deadline.
- `InsufficientSignaturesError`: Thrown when not enough signatures are provided for an operation.
- `UnauthorizedSignerError`: Thrown when an unauthorized signer tries to sign a transaction.

## Examples

### Creating an Escrow

```typescript
const { escrow } = await escrowClient.initializeEscrow(
  recipient.publicKey,
  3 // Number of milestones
);
```

### Adding Milestones

```typescript
const now = Math.floor(Date.now() / 1000);
const oneWeek = 7 * 24 * 60 * 60;

// Add 3 milestones with 1-week intervals
for (let i = 0; i < 3; i++) {
  await escrowClient.addMilestone(
    escrow,
    i,
    (i + 1) * 100_000, // 0.1, 0.2, 0.3 tokens
    now + (i + 1) * oneWeek
  );
}
```

### Funding an Escrow

```typescript
const tx = await escrowClient.fundEscrow(
  escrow,
  tokenMint,
  600_000 // 0.6 tokens (0.1 + 0.2 + 0.3)
);
```

### Completing a Milestone

```typescript
// Complete the first milestone
const tx = await escrowClient.completeMilestone(escrow, 0);
```

### Releasing Funds

```typescript
// Release funds for the first milestone
const tx = await escrowClient.releaseFunds(
  escrow,
  0, // First milestone
  tokenMint,
  recipient.publicKey
);
```

### Emergency Withdrawal

```typescript
// Initiate emergency withdrawal with 2-of-3 multisig
const { multisig } = await escrowClient.initiateEmergencyWithdrawal(
  escrow,
  creator.publicKey,
  [signer1.publicKey, signer2.publicKey, signer3.publicKey]
);

// Sign with first signer
await escrowClient.signEmergencyWithdrawal(escrow);

// Sign with second signer (using a different wallet)
// Note: In a real app, you would switch to the second signer's wallet
// For demonstration, we're just showing the API call
// await escrowClient.signEmergencyWithdrawal(escrow);
```

## Events

The escrow module emits various events that can be subscribed to:

```typescript
// Subscribe to escrow account changes
escrowClient.program.account.escrow.subscribe(escrow, 'processed', (escrowAccount) => {
  console.log('Escrow updated:', escrowAccount);
});

// Subscribe to milestone events
escrowClient.program.addEventListener('MilestoneCompleted', (event) => {
  console.log('Milestone completed:', event);
});

// Subscribe to funds released events
escrowClient.program.addEventListener('FundsReleased', (event) => {
  console.log('Funds released:', event);
});
```

## Security Considerations

1. **Multi-signature Security**: The emergency withdrawal feature uses a multi-signature scheme that requires a threshold of signatures to execute.
2. **Time Locks**: Milestones have deadlines that must be respected before funds can be released.
3. **Access Control**: Only authorized parties (creator, recipient, verifiers) can perform certain actions on the escrow.
4. **Fund Safety**: Funds are held in a program-derived address (PDA) and can only be released according to the escrow terms.

## Testing

Run the test suite:

```bash
npm test
```

For development with watch mode:

```bash
npm run test:watch
```

## License

MIT
