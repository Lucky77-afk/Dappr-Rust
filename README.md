# Dappr - Solana DApp for Academic and Industry Collaboration

A decentralized application built on Solana blockchain for connecting academic researchers with industry partners.

## 🚀 Features

- **Solana Program**: Built with Anchor framework in Rust
- **React Frontend**: Modern UI with TypeScript and Tailwind CSS
- **Wallet Integration**: Connect with Phantom and Solflare wallets
- **Multi-Environment**: Test on localnet, devnet, and mainnet-beta
- **Comprehensive Testing**: End-to-end testing with Anchor and TypeScript
- **Developer Friendly**: Pre-configured with useful scripts and tooling

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (latest stable)
- [Yarn](https://yarnpkg.com/) or npm
- [Anchor](https://www.anchor-lang.com/docs/installation) (latest)

## 🛠️ Setup

### 1. Install Dependencies

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI (if not already installed)
sh -c "$(curl -sSfL https://release.solana.com/v1.10.32/install)"

# Install Anchor (if not already installed)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Install Node.js (v18+ required)
# Download from https://nodejs.org/ or use nvm

# Install Yarn (if not using npm)
npm install -g yarn
```

### 2. Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/Lucky77-afk/Dappr-Rust.git
cd Dappr-Rust

# Install root dependencies
yarn install

# Install app dependencies
cd app
yarn install
cd ..
```

### 3. Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Generate test keypairs:
   ```bash
   mkdir -p test-keys
   solana-keygen new --no-bip39-passphrase --outfile test-keys/academic.json
   solana-keygen new --no-bip39-passphrase --outfile test-keys/industry.json
   ```

3. Update `.env` with your configuration:
   ```env
   NEXT_PUBLIC_NETWORK=devnet
   NEXT_PUBLIC_RPC_DEVNET=https://api.devnet.solana.com
   NEXT_PUBLIC_RPC_LOCAL=http://127.0.0.1:8899
   NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
   ACADEMIC_WALLET=test-keys/academic.json
   INDUSTRY_WALLET=test-keys/industry.json
   ```

### 4. Configure Solana CLI

```bash
# Set to devnet
solana config set --url devnet

# Check your configuration
solana config get

# Airdrop SOL (devnet - request multiple times if needed)
solana airdrop 2

# Check your balance
solana balance
solana airdrop 1

# Verify configuration
solana config get
```

### 3. Build and Deploy the Program

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# After deployment, update the program ID in:
# - Anchor.toml
# - programs/dappr/src/lib.rs
# - app/src/constants/programId.ts (if applicable)
```

### 4. Run the Frontend

```bash
# From the app directory
cd app
yarn dev

# The app will be available at http://localhost:3000
```

## 📁 Project Structure

```
.
├── app/                  # Frontend React application (Vite + TypeScript)
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── types/        # TypeScript type definitions
│   │   ├── App.tsx       # Main App component
│   │   └── main.tsx      # Entry point
│   └── ...               # Configuration files
│
├── programs/            # Solana programs (Rust)
│   └── dappr/           # Main program
│       ├── src/          # Program source code
│       └── Cargo.toml    # Rust dependencies
│
├── tests/               # Integration tests
├── migrations/           # Deployment scripts
├── Anchor.toml           # Anchor configuration
└── README.md             # This file
```

## 🔧 Development

### Available Scripts

From the root directory:

```bash
# Build the program
anchor build

# Run tests
anchor test

# Format code
cargo fmt
```

From the `app` directory:

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Run tests
yarn test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Development

- Run tests: `anchor test`
- Start local validator: `solana-test-validator`
- Deploy to devnet: `anchor deploy --provider.cluster devnet`

## License

MIT
