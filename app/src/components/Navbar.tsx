import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '../types/global.d';

export const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">DAPPR</div>
        <div className="flex items-center space-x-4">
          <a href="/" className="hover:text-gray-300">Home</a>
          {/* Add more navigation links as needed */}
          <div className="ml-4">
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !text-white !font-medium !py-2 !px-4 !rounded-lg" />
          </div>
        </div>
      </div>
    </nav>
  );
};
