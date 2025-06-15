import React from 'react';
import Head from 'next/head';
import { ToastContainer } from '../ui/Toast';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Dappr - Escrow Platform' }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Dappr - A decentralized escrow platform on Solana" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">Dappr</span>
              </Link>
              <nav className="hidden md:ml-10 md:flex space-x-8">
                <Link href="/escrow" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Escrows
                </Link>
                <Link href="/create" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Create Escrow
                </Link>
                <Link href="/docs" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
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
