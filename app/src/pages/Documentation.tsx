import React from 'react';

const Documentation: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4 text-gray-900 dark:text-gray-100 font-sans">
    <h1 className="text-4xl font-extrabold mb-8 text-purple-700 dark:text-purple-400 tracking-tight">Dappr Documentation</h1>
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">What is Dappr?</h2>
      <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
        <span className="font-semibold text-purple-600 dark:text-purple-300">Dappr</span> is a decentralized escrow platform built on the Solana blockchain. It allows users to securely create, manage, and participate in escrow transactions using their Solana wallets.
      </p>
    </section>
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">Features</h2>
      <ul className="list-disc list-inside space-y-1 text-base text-gray-700 dark:text-gray-300 pl-6">
        <li><span className="font-medium text-purple-600 dark:text-purple-300">Connect</span> with your Solana wallet (Phantom, Solflare, Torus, Ledger, etc.)</li>
        <li>Create new escrow agreements with customizable terms</li>
        <li>View and manage your active escrows</li>
        <li>Release or cancel escrows securely</li>
        <li>Real-time notifications and status updates</li>
      </ul>
    </section>
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">How to Use</h2>
      <ol className="list-decimal list-inside space-y-1 text-base text-gray-700 dark:text-gray-300 pl-6">
        <li>Connect your Solana wallet using the <span className="font-medium text-purple-600 dark:text-purple-300">Connect Wallet</span> button.</li>
        <li>Navigate to the <span className="font-medium text-purple-600 dark:text-purple-300">Create Escrow</span> page to start a new escrow agreement.</li>
        <li>Fill in the required details and submit the form.</li>
        <li>Track the status of your escrows on the <span className="font-medium text-purple-600 dark:text-purple-300">Escrows</span> page.</li>
        <li>Release or cancel escrows as needed.</li>
      </ol>
    </section>
    <section>
      <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">Support</h2>
      <p className="text-base text-gray-700 dark:text-gray-300">
        For more help, visit our <a href="https://docs.solana.com/" className="text-purple-600 dark:text-purple-300 underline font-semibold" target="_blank" rel="noopener noreferrer">Solana Docs</a> or contact support.
      </p>
    </section>
  </div>
);

export default Documentation;
