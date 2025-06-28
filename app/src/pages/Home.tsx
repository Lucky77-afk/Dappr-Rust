import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Button from '../components/ui/Button';

const Home = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-indigo-300">
      <div className="p-10 bg-white/90 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-2xl border border-purple-100 backdrop-blur-md">
        <h1 className="text-5xl font-extrabold mb-5 text-purple-700 drop-shadow-sm tracking-tight text-center">Welcome to <span className="text-blue-700">DAPPR</span> Escrow</h1>
        <p className="text-xl mb-8 text-gray-700 text-center">
          {connected
            ? <span className="font-semibold text-green-600">Your wallet is connected! 🎉</span>
            : 'Please connect your Solana wallet to get started.'}
        </p>
        {!connected && (
          <div className="mb-8">
            <WalletMultiButton />
          </div>
        )}
        {connected && (
          <div className="w-full space-y-8 mt-2">
            <div className="p-7 bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-md border border-purple-100 hover:shadow-xl transition-shadow duration-200 group">
              <h3 className="text-2xl font-bold mb-2 text-purple-700 group-hover:text-purple-900 transition-colors">Create a new escrow</h3>
              <p className="mb-5 text-gray-600">Create a new milestone-based escrow agreement</p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/create')}
                className="w-full sm:w-auto font-semibold text-lg group-hover:scale-105 transition-transform"
              >
                <span className="inline-block align-middle">➕</span> Create Escrow
              </Button>
            </div>
            <div className="p-7 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md border border-blue-100 hover:shadow-xl transition-shadow duration-200 group">
              <h3 className="text-2xl font-bold mb-2 text-blue-700 group-hover:text-blue-900 transition-colors">View your escrows</h3>
              <p className="mb-5 text-gray-600">View and manage your existing escrow agreements</p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/escrow')}
                className="w-full sm:w-auto font-semibold text-lg group-hover:scale-105 transition-transform"
              >
                <span className="inline-block align-middle">📄</span> View Escrows
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
