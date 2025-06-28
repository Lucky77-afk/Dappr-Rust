# Dappr Escrow Platform

A decentralized, milestone-based escrow platform built on the Solana blockchain using React, TypeScript, Vite, and Tailwind CSS.

## Features
- Connect with your Solana wallet (Phantom, Solflare, Torus, Ledger, etc.)
- Create new escrow agreements with customizable milestones
- View and manage your active escrows
- Release or cancel escrows securely
- Real-time notifications and status updates
- Modern, responsive UI

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- A supported Solana wallet extension (e.g. Phantom)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
```

### Lint & Format
```bash
npm run lint
npm run format
```

## Deployment
See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for deployment instructions.

## Continuous Integration
See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the CI pipeline.

## Documentation
- [Project Documentation](./src/pages/Documentation.tsx)
- [Business Requirement Specification](../BRS.docx)

## License
MIT
