import { useEffect } from 'react';
import { ToastContainer } from '../ui/Toast';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';

type LayoutProps = {
  children: any;
  title?: string;
};

function Layout({ 
  children, 
  title = 'Dappr - Escrow Platform' 
}: LayoutProps) {
  // Set the page title
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Meta tags should be in your index.html */}

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Dappr</span>
              </Link>
              <nav className="hidden md:ml-10 md:flex space-x-8">
                <Link to="/escrow" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Escrows
                </Link>
                <Link to="/create" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Create Escrow
                </Link>
                <Link to="/docs" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Documentation
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            &copy; {new Date().getFullYear()} Dappr. All rights reserved.
          </p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default Layout;
