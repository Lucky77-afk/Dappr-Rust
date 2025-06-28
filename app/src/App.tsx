import React from 'react';
import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter, 


  TorusWalletAdapter,
  LedgerWalletAdapter,

} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Home from './pages/Home';
import EscrowPage from './pages/EscrowPage';
import Documentation from './pages/Documentation';
import Layout from './components/layout/Layout';

// Styles
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

const App = () => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = 'devnet';
  const endpoint = useMemo(() => clusterApiUrl(network as any), [network]);
  
  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),


      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),

    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/escrow" element={<EscrowPage />} />
                <Route path="/escrow/:escrowAddress" element={<EscrowPage />} />
                <Route path="/create" element={<EscrowPage createNew />} />
                <Route path="/docs" element={<React.Suspense fallback={<div>Loading...</div>}><Documentation /></React.Suspense>} />
              </Routes>
            </Layout>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
