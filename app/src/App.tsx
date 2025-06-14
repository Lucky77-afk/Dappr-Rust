import React, { useMemo } from 'react';
import './types/global.d';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';

// Styles
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';

const App = () => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = 'devnet';
  const endpoint = useMemo(() => clusterApiUrl(network as any), [network]);
  
  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of the wallets that your users connect to will be loaded.
  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider
          className="wallet-modal"
          logo="/logo.png"
          featuredWallets={2}
        >
          <Router>
            <div className="min-h-screen bg-gray-900 text-white">
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  {/* Add more routes as needed */}
                </Routes>
              </main>
            </div>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
