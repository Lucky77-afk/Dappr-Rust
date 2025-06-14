import { useWallet } from '@solana/wallet-adapter-react';
import '../types/global.d';

export const Home = () => {
  const { connected } = useWallet();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to DAPPR</h1>
      <p className="text-xl mb-8">
        {connected
          ? 'Your wallet is connected! 🎉'
          : 'Connect your wallet to get started'}
      </p>
      
      <div className="mt-12 p-6 bg-gray-800 rounded-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <ol className="text-left list-decimal pl-6 space-y-2">
          <li>Connect your Solana wallet</li>
          <li>Interact with the DApp</li>
          <li>Build amazing things on Solana!</li>
        </ol>
      </div>
    </div>
  );
};
