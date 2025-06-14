# DAPPR - Solana DApp Starter

A modern Solana DApp built with Anchor (Rust) and React/TypeScript, featuring wallet connection and basic program interaction.

## 🚀 Features

- **Solana Program**: Built with Anchor framework in Rust
- **React Frontend**: Modern UI with TypeScript and Tailwind CSS
- **Wallet Integration**: Connect with Phantom and other Solana wallets
- **Devnet Ready**: Pre-configured for Solana devnet deployment

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

# Install Node dependencies
cd app
yarn install
```

### 2. Configure Solana CLI

```bash
# Set to devnet
solana config set --url devnet

# Create a new wallet (if needed)
solana-keygen new

# Airdrop SOL (devnet)
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
