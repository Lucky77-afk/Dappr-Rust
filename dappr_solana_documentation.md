# DAPPR Solana Implementation - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Development Guide](#development-guide)
5. [Program Documentation](#program-documentation)
6. [Frontend Documentation](#frontend-documentation)
7. [API Documentation](#api-documentation)
8. [Testing Guide](#testing-guide)
9. [Deployment Guide](#deployment-guide)
10. [User Guides](#user-guides)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)

---

## Project Overview

### What is DAPPR?
DAPPR (Decentralized Academic Publishing and Patent Registry) is a blockchain-based platform that facilitates collaboration between academic researchers and industry partners. Built on Solana, it provides transparent, immutable records of research publications, intellectual property licensing, and milestone-based funding.

### Key Features
- **Dual Token System**: Governance (DAPPR_GOV) and utility (DAPPR_USD) tokens
- **Publication Registry**: Immutable academic publication records
- **IP Licensing**: Smart contract-based intellectual property licensing
- **Milestone Funding**: Escrow-based project funding with milestone releases
- **AI Governance**: AI-assisted decision making and dispute resolution
- **Citation Tracking**: Transparent academic impact measurement

### Technology Stack
- **Blockchain**: Solana
- **Smart Contracts**: Rust with Anchor framework
- **Frontend**: React with TypeScript
- **Backend Services**: Node.js with Express
- **Database**: PostgreSQL
- **Storage**: IPFS for document storage
- **AI**: OpenAI API integration

---

## Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Solana        │
│   (React/TS)    │◄──►│   (Node.js)     │◄──►│   Programs      │
│                 │    │                 │    │   (Rust/Anchor) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Wallet        │    │   Database      │    │   Token Mints   │
│   (Phantom)     │    │   (PostgreSQL)  │    │   (SPL Tokens)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Program Architecture
```
Solana Programs:
├── token_system/
│   ├── governance_token.rs
│   └── utility_token.rs
├── collaboration/
│   ├── agreement.rs
│   └── milestone.rs
├── publication/
│   ├── registry.rs
│   └── citation.rs
├── licensing/
│   ├── ip_license.rs
│   └── royalty.rs
└── governance/
    ├── proposals.rs
    └── voting.rs
```

### Data Flow
1. **User Authentication**: Wallet connection via Phantom/Solflare
2. **Role Assignment**: Academic or Industry user classification
3. **Token Management**: DAPPR_GOV for governance, DAPPR_USD for transactions
4. **Content Creation**: Publications, collaborations, licenses
5. **AI Processing**: Governance decisions and recommendations
6. **Blockchain Storage**: Immutable records on Solana

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Solana CLI 1.16+
- Anchor CLI 0.28+
- Git
- PostgreSQL 14+

### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-org/dappr-solana.git
cd dappr-solana

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Build programs
anchor build

# Run tests
anchor test

# Start local validator
solana-test-validator

# Deploy programs (in another terminal)
anchor deploy

# Start frontend
cd app
npm start
```

### Environment Configuration
```bash
# .env file
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
ANCHOR_WALLET=~/.config/solana/id.json

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dappr

# AI Service
OPENAI_API_KEY=your_openai_key
AI_SERVICE_URL=http://localhost:3001

# IPFS
IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_API_KEY=your_pinata_key
```

### Local Development Setup
```bash
# 1. Start PostgreSQL
sudo service postgresql start

# 2. Create database
createdb dappr

# 3. Run migrations
npm run db:migrate

# 4. Generate keypairs
solana-keygen new --outfile ~/.config/solana/id.json
solana-keygen new --outfile keypairs/academic.json
solana-keygen new --outfile keypairs/industry.json

# 5. Fund accounts (devnet)
solana airdrop 2 ~/.config/solana/id.json --url devnet
solana airdrop 2 keypairs/academic.json --url devnet
solana airdrop 2 keypairs/industry.json --url devnet

# 6. Start services
npm run dev  # Starts all services concurrently
```

---

## Development Guide

### Project Structure
```
dappr-solana/
├── programs/                 # Solana programs (Rust)
│   ├── token-system/
│   ├── collaboration/
│   ├── publication/
│   ├── licensing/
│   └── governance/
├── app/                      # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   └── utils/
│   └── public/
├── backend/                  # Backend services (Node.js)
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   └── migrations/
├── tests/                    # Test files
├── scripts/                  # Deployment scripts
└── docs/                     # Documentation
```

### Development Workflow
1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Write Tests**: Test-driven development approach
3. **Implement Feature**: Programs first, then frontend
4. **Run Tests**: `anchor test` and `npm test`
5. **Code Review**: Submit PR for review
6. **Deploy**: Merge to main triggers deployment

### Coding Standards
- **Rust**: Follow Rust conventions, use `clippy` for linting
- **TypeScript**: Use ESLint + Prettier, strict type checking
- **Git**: Conventional commits format
- **Documentation**: JSDoc for functions, README for modules

---

## Program Documentation

### Token System Program

#### Overview
Manages the dual-token economy of DAPPR with governance and utility tokens.

#### Account Structures
```rust
#[account]
pub struct TokenConfig {
    pub authority: Pubkey,
    pub governance_mint: Pubkey,
    pub utility_mint: Pubkey,
    pub total_supply_gov: u64,
    pub total_supply_util: u64,
    pub bump: u8,
}

#[account]
pub struct UserTokenAccount {
    pub owner: Pubkey,
    pub governance_balance: u64,
    pub utility_balance: u64,
    pub reputation_score: u64,
    pub last_activity: i64,
}
```

#### Instructions
```rust
// Initialize token system
pub fn initialize_tokens(
    ctx: Context<InitializeTokens>,
    governance_supply: u64,
    utility_supply: u64,
) -> Result<()>

// Mint tokens to user
pub fn mint_tokens(
    ctx: Context<MintTokens>,
    amount: u64,
    token_type: TokenType,
) -> Result<()>

// Transfer tokens between users
pub fn transfer_tokens(
    ctx: Context<TransferTokens>,
    amount: u64,
    token_type: TokenType,
) -> Result<()>
```

### Collaboration Program

#### Overview
Manages collaboration agreements between academic and industry partners.

#### Account Structures
```rust
#[account]
pub struct CollaborationAgreement {
    pub id: u64,
    pub academic: Pubkey,
    pub industry: Pubkey,
    pub title: String,
    pub description: String,
    pub total_funding: u64,
    pub milestones: Vec<Milestone>,
    pub status: CollaborationStatus,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Milestone {
    pub id: u8,
    pub title: String,
    pub description: String,
    pub funding_amount: u64,
    pub deadline: i64,
    pub status: MilestoneStatus,
    pub deliverables: Vec<String>,
}
```

#### Key Functions
- `create_collaboration()`: Create new collaboration agreement
- `add_milestone()`: Add milestone to existing collaboration
- `complete_milestone()`: Mark milestone as completed
- `dispute_milestone()`: Raise dispute for milestone
- `resolve_dispute()`: AI-assisted dispute resolution

### Publication Registry Program

#### Overview
Manages academic publication records and citation tracking.

#### Account Structures
```rust
#[account]
pub struct Publication {
    pub id: u64,
    pub author: Pubkey,
    pub title: String,
    pub abstract_text: String,
    pub doi: String,
    pub ipfs_hash: String,
    pub citation_count: u64,
    pub impact_score: u64,
    pub published_at: i64,
    pub category: PublicationCategory,
    pub keywords: Vec<String>,
}

#[account]
pub struct Citation {
    pub citing_publication: u64,
    pub cited_publication: u64,
    pub context: String,
    pub created_at: i64,
}
```

#### Features
- Immutable publication records
- Automatic citation tracking
- Impact score calculation
- Search and discovery
- Plagiarism detection

### Licensing Program

#### Overview
Handles intellectual property licensing agreements and royalty payments.

#### Account Structures
```rust
#[account]
pub struct LicenseAgreement {
    pub id: u64,
    pub licensor: Pubkey,
    pub licensee: Pubkey,
    pub ip_asset: Pubkey,
    pub license_type: LicenseType,
    pub terms: LicenseTerms,
    pub royalty_rate: u16,
    pub total_paid: u64,
    pub status: LicenseStatus,
    pub created_at: i64,
    pub expires_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct LicenseTerms {
    pub exclusive: bool,
    pub territory: String,
    pub usage_rights: Vec<String>,
    pub restrictions: Vec<String>,
    pub payment_schedule: PaymentSchedule,
}
```

---

## Frontend Documentation

### Component Architecture
```
src/
├── components/
│   ├── common/           # Reusable UI components
│   ├── academic/         # Academic-specific components
│   ├── industry/         # Industry-specific components
│   └── governance/       # Governance components
├── hooks/                # Custom React hooks
├── contexts/             # React contexts
├── utils/                # Utility functions
└── types/                # TypeScript type definitions
```

### Key Components

#### WalletProvider
```typescript
interface WalletContextType {
  wallet: Wallet | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => Promise<void>;
  userRole: UserRole | null;
  tokenBalances: TokenBalances;
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Implementation
};
```

#### ProgramProvider
```typescript
interface ProgramContextType {
  program: Program<Dappr>;
  collaborationProgram: Program<Collaboration>;
  publicationProgram: Program<Publication>;
  licensingProgram: Program<Licensing>;
  isLoading: boolean;
  error: string | null;
}
```

### Custom Hooks

#### useTokens
```typescript
export const useTokens = () => {
  const { publicKey } = useWallet();
  const { program } = useProgram();

  const mintTokens = useCallback(async (amount: number, tokenType: TokenType) => {
    // Implementation
  }, [program, publicKey]);

  const transferTokens = useCallback(async (
    recipient: PublicKey,
    amount: number,
    tokenType: TokenType
  ) => {
    // Implementation
  }, [program, publicKey]);

  return { mintTokens, transferTokens, balances, loading, error };
};
```

#### useCollaboration
```typescript
export const useCollaboration = () => {
  const createCollaboration = useCallback(async (data: CollaborationData) => {
    // Implementation
  }, []);

  const getCollaborations = useCallback(async () => {
    // Implementation
  }, []);

  return { createCollaboration, getCollaborations, collaborations, loading };
};
```

---

## API Documentation

### Authentication
All API endpoints require wallet signature authentication.

```typescript
// Authentication header
headers: {
  'Authorization': 'Bearer <wallet_signature>',
  'Content-Type': 'application/json'
}
```

### Endpoints

#### User Management
```
GET    /api/users/profile           # Get user profile
PUT    /api/users/profile           # Update user profile
POST   /api/users/verify-role       # Verify user role
```

#### Publications
```
GET    /api/publications            # List publications
POST   /api/publications            # Create publication
GET    /api/publications/:id        # Get publication details
PUT    /api/publications/:id        # Update publication
POST   /api/publications/:id/cite   # Create citation
```

#### Collaborations
```
GET    /api/collaborations          # List collaborations
POST   /api/collaborations          # Create collaboration
GET    /api/collaborations/:id      # Get collaboration details
PUT    /api/collaborations/:id      # Update collaboration
POST   /api/collaborations/:id/milestones  # Add milestone
```

#### AI Governance
```
POST   /api/ai/analyze-dispute      # Analyze dispute
POST   /api/ai/suggest-match        # Suggest collaboration match
GET    /api/ai/recommendations      # Get AI recommendations
POST   /api/ai/governance-decision  # AI governance decision
```

### Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Testing Guide

### Test Structure
```
tests/
├── unit/              # Unit tests
│   ├── programs/      # Program unit tests
│   └── frontend/      # Frontend unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── fixtures/         # Test data and fixtures
```

### Running Tests

#### Program Tests
```bash
# Run all program tests
anchor test

# Run specific program tests
anchor test --skip-build programs/collaboration

# Run with coverage
anchor test --coverage
```

#### Frontend Tests
```bash
# Run unit tests
cd app && npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- --testNamePattern="WalletProvider"
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- --grep "collaboration flow"
```

#### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed
```

### Test Examples

#### Program Test
```rust
#[tokio::test]
async fn test_create_collaboration() {
    let mut context = program_test().start_with_context().await;
    
    let collaboration_account = Keypair::new();
    let academic = Keypair::new();
    let industry = Keypair::new();
    
    let instruction = create_collaboration(
        &collaboration_program::id(),
        &collaboration_account.pubkey(),
        &academic.pubkey(),
        &industry.pubkey(),
        "Test Collaboration".to_string(),
        1000000, // 1 DAPPR_USD
    );
    
    let transaction = Transaction::new_signed_with_payer(
        &[instruction],
        Some(&context.payer.pubkey()),
        &[&context.payer, &collaboration_account],
        context.last_blockhash,
    );
    
    context.banks_client.process_transaction(transaction).await.unwrap();
    
    // Verify collaboration was created
    let account = context.banks_client
        .get_account(collaboration_account.pubkey())
        .await
        .unwrap()
        .unwrap();
    
    assert_eq!(account.owner, collaboration_program::id());
}
```

#### Frontend Test
```typescript
describe('PublicationForm', () => {
  test('should create publication successfully', async () => {
    const mockCreatePublication = jest.fn();
    
    render(
      <PublicationForm onSubmit={mockCreatePublication} />
    );
    
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Publication' }
    });
    
    fireEvent.change(screen.getByLabelText('Abstract'), {
      target: { value: 'Test abstract content' }
    });
    
    fireEvent.click(screen.getByText('Publish'));
    
    await waitFor(() => {
      expect(mockCreatePublication).toHaveBeenCalledWith({
        title: 'Test Publication',
        abstract: 'Test abstract content'
      });
    });
  });
});
```

---

## Deployment Guide

### Environment Setup

#### Development
```bash
# Use local validator
solana config set --url localhost
solana-test-validator

# Deploy programs
anchor deploy --provider.cluster localnet
```

#### Devnet
```bash
# Configure for devnet
solana config set --url devnet

# Fund deployment account
solana airdrop 2

# Deploy programs
anchor deploy --provider.cluster devnet
```

#### Mainnet
```bash
# Configure for mainnet
solana config set --url mainnet-beta

# Deploy programs (requires SOL for fees)
anchor deploy --provider.cluster mainnet-beta
```

### Deployment Scripts

#### Deploy All Programs
```bash
#!/bin/bash
# scripts/deploy-all.sh

set -e

echo "Building programs..."
anchor build

echo "Deploying token system..."
anchor deploy --program-name token-system

echo "Deploying collaboration..."
anchor deploy --program-name collaboration

echo "Deploying publication..."
anchor deploy --program-name publication

echo "Deploying licensing..."
anchor deploy --program-name licensing

echo "Deploying governance..."
anchor deploy --program-name governance

echo "Initializing programs..."
node scripts/initialize-programs.js

echo "Deployment complete!"
```

#### Initialize Programs
```javascript
// scripts/initialize-programs.js
const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey } = require('@solana/web3.js');

async function initializePrograms() {
  const connection = new Connection(process.env.SOLANA_RPC_URL);
  const wallet = anchor.Wallet.local();
  const provider = new anchor.AnchorProvider(connection, wallet);
  
  // Initialize token system
  await initializeTokenSystem(provider);
  
  // Initialize other programs
  await initializeCollaboration(provider);
  await initializePublication(provider);
  await initializeLicensing(provider);
  await initializeGovernance(provider);
  
  console.log('All programs initialized successfully!');
}

initializePrograms().catch(console.error);
```

### CI/CD Pipeline

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy DAPPR

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          
      - name: Install Solana CLI
        run: |
          sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
          echo "$HOME/.local/share/solana/install/active_release/bin" >> $GITHUB_PATH
          
      - name: Install Anchor
        run: npm install -g @coral-xyz/anchor-cli
        
      - name: Install dependencies
        run: npm install
        
      - name: Run tests
        run: anchor test
        
      - name: Run frontend tests
        run: cd app && npm test
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to devnet
        run: |
          echo "${{ secrets.SOLANA_PRIVATE_KEY }}" > keypair.json
          solana config set --url devnet --keypair keypair.json
          anchor deploy --provider.cluster devnet
          
      - name: Deploy frontend
        run: |
          cd app
          npm run build
          # Deploy to Vercel/Netlify
```

---

## User Guides

### Academic User Guide

#### Getting Started
1. **Connect Wallet**: Use Phantom or Solflare wallet
2. **Select Role**: Choose "Academic" user type
3. **Get Tokens**: Request initial DAPPR tokens from faucet
4. **Complete Profile**: Add academic credentials and research interests

#### Publishing Research
1. **Navigate to Publications**: Click "Publish Research" in sidebar
2. **Fill Details**: Enter title, abstract, DOI, keywords
3. **Upload Document**: Upload PDF to IPFS
4. **Set Metadata**: Configure access permissions and licensing
5. **Submit**: Transaction will be recorded on blockchain

#### Managing Collaborations
1. **Browse Opportunities**: View available funding opportunities
2. **Apply for Funding**: Submit collaboration proposals
3. **Track Milestones**: Monitor progress and milestone completions
4. **Receive Payments**: Automatic token release upon milestone completion

#### Citation Tracking
1. **View Impact**: Check citation count and impact metrics
2. **Track Citations**: See who cited your work
3. **Earn Rewards**: Receive tokens for high-impact publications

### Industry User Guide

#### Getting Started
1. **Connect Wallet**: Use business wallet address
2. **Select Role**: Choose "Industry" user type
3. **Purchase Tokens**: Buy DAPPR_USD tokens for transactions
4. **Company Verification**: Complete KYC process for large transactions

#### Finding Research
1. **Browse Publications**: Search by keywords, category, or author
2. **Filter Results**: Use advanced filters for specific research
3. **Contact Authors**: Initiate collaboration discussions
4. **Propose Licensing**: Submit IP licensing proposals

#### Funding Projects
1. **Create Funding Opportunity**: Define project requirements and budget
2. **Set Milestones**: Configure milestone-based payment schedule
3. **Escrow Funds**: Lock tokens in smart contract
4. **Monitor Progress**: Track project development
5. **Approve Milestones**: Release payments upon completion

#### IP Management
1. **License Assets**: Acquire rights to academic IP
2. **Manage Portfolio**: Track licensed assets and payments
3. **Royalty Payments**: Automatic royalty distribution
4. **Compliance Reporting**: Generate compliance reports

---

## Troubleshooting

### Common Issues

#### Program Deployment Errors
```
Error: Account does not have enough SOL to perform this operation
```
**Solution**: Fund your wallet with SOL
```bash
solana airdrop 2  # For devnet
```

#### Transaction Failures
```
Error: Transaction simulation failed
```
**Solution**: Check account permissions and program state
```bash
solana logs  # View transaction logs
```

#### Frontend Connection Issues
```
Error: Failed to connect to wallet
```
**Solution**: 
1. Install wallet extension
2. Check network configuration
3. Verify RPC endpoint is accessible

#### Token Transfer Errors
```
Error: Insufficient token balance
```
**Solution**: 
1. Check token account balance
2. Ensure associated token account exists
3. Verify token mint configuration

### Debug Tools

#### Solana CLI Commands
```bash
# Check account balance
solana balance <address>

# View account information
solana account <address>

# Check program logs
solana logs --url devnet

# Verify program deployment
solana program show <program_id>
```

#### Anchor Debug Commands
```bash
# Show program IDL
anchor idl fetch <program_id>

# Test with verbose output
anchor test --skip-build --verbose

# Show program accounts
anchor account <account_type> <address>
```

### Performance Optimization

#### Program Optimization
- Use efficient data structures
- Minimize compute units
- Optimize account layouts
- Use PDAs efficiently

#### Frontend Optimization
- Implement lazy loading
- Cache blockchain data
- Optimize re-renders
- Use Web Workers for heavy computations

---

## Contributing

### Development Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### Code Standards
- Follow Rust conventions for programs
- Use TypeScript strict mode
- Write comprehensive tests
- Document all public APIs
- Use conventional commits

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Release Process
1. Create release branch
2. Update version numbers
3. Generate changelog
4. Test on devnet
5. Deploy to mainnet
6. Tag release
7. Update documentation

---

## Appendix

### Useful Links
- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://anchor-lang.com/)
- [SPL Token Documentation](https://spl.solana.com/token)
- [Metaplex Documentation](https://docs.metaplex.com/)

### Glossary
- **PDA**: Program Derived Address
- **SPL**: Solana Program Library
- **ATA**: Associated Token Account
- **IDL**: Interface Definition Language
- **CPI**: Cross-Program Invocation

### License
MIT License - see LICENSE file for details

### Support
For support, please open an issue on GitHub or contact the development team.