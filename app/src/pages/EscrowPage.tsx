import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEscrow } from '../hooks/useEscrow';
import { ToastContainer } from '../components/ui/Toast';
import CreateEscrowForm from '../components/escrow/CreateEscrowForm';
import EscrowDetails from '../components/escrow/EscrowDetails';

const EscrowPage = () => {
  const { publicKey, connected } = useWallet();
  const [view, setView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedEscrow, setSelectedEscrow] = useState<string | null>(null);
  const [escrows, setEscrows] = useState<Array<{ address: string; creator: string; recipient: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock function to fetch user's escrows
  const fetchUserEscrows = async () => {
    if (!publicKey) return;
    
    try {
      setIsLoading(true);
      // In a real app, you would fetch escrows from the blockchain
      // This is a placeholder for demonstration
      const mockEscrows = [];
      setEscrows(mockEscrows);
    } catch (error) {
      console.error('Failed to fetch escrows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (connected) {
      fetchUserEscrows();
    }
  }, [connected, publicKey]);

  const handleCreateEscrow = () => {
    setView('create');
  };

  const handleViewEscrow = (escrowAddress: string) => {
    setSelectedEscrow(escrowAddress);
    setView('details');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedEscrow(null);
    fetchUserEscrows();
  };

  const handleEscrowCreated = () => {
    setView('list');
    fetchUserEscrows();
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            Please connect your Solana wallet to manage escrows.
          </p>
          <w3m-connect-button />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      
      <main className="container mx-auto px-4 py-8">
        {view === 'list' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Escrows</h1>
              <button
                onClick={handleCreateEscrow}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create New Escrow
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : escrows.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No escrows yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new escrow agreement.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleCreateEscrow}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    New Escrow
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {escrows.map((escrow) => (
                    <li key={escrow.address}>
                      <button
                        onClick={() => handleViewEscrow(escrow.address)}
                        className="block hover:bg-gray-50 w-full text-left"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {escrow.address}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <span className="font-medium">Creator:</span>{' '}
                                <span className="ml-1 font-mono text-xs">
                                  {escrow.creator}
                                </span>
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <span className="font-medium">Recipient:</span>{' '}
                                <span className="ml-1 font-mono text-xs">
                                  {escrow.recipient}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {view === 'create' && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleBackToList}
              className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
            >
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Escrows
            </button>
            <CreateEscrowForm onSuccess={handleEscrowCreated} />
          </div>
        )}

        {view === 'details' && selectedEscrow && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleBackToList}
              className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
            >
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Escrows
            </button>
            <EscrowDetails 
              escrowAddress={selectedEscrow} 
              tokenMint="" // Pass the actual token mint address
              onBack={handleBackToList} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default EscrowPage;
