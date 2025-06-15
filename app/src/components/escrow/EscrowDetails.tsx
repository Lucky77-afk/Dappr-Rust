import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useEscrow } from '../../hooks/useEscrow';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatDistanceToNow, format } from 'date-fns';

interface EscrowDetailsProps {
  escrowAddress: string;
  tokenMint: string;
  onBack: () => void;
}

export const EscrowDetails = ({ escrowAddress, tokenMint, onBack }: EscrowDetailsProps) => {
  const { publicKey } = useWallet();
  const { getEscrow, completeMilestone, releaseFunds, isLoading } = useEscrow();
  
  const [escrow, setEscrow] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'milestones' | 'withdraw'>('details');
  const [emergencySigners, setEmergencySigners] = useState(['', '', '']);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const fetchEscrowData = useCallback(async () => {
    if (!escrowAddress) return;
    
    try {
      setIsRefreshing(true);
      const escrowData = await getEscrow(escrowAddress);
      setEscrow(escrowData);
      
      // Fetch all milestones
      const milestonePromises = [];
      for (let i = 0; i < escrowData.milestonesCount; i++) {
        const [milestonePDA] = await window.dappr.escrow.getMilestonePDA(
          new PublicKey(escrowAddress),
          i
        );
        milestonePromises.push(milestonePDA);
      }
      
      const milestoneAddresses = await Promise.all(milestonePromises);
      const milestonesData = await Promise.all(
        milestoneAddresses.map(addr => getMilestone(addr.toString()))
      );
      
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Failed to fetch escrow data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [escrowAddress, getEscrow]);

  useEffect(() => {
    fetchEscrowData();
  }, [fetchEscrowData]);

  const handleCompleteMilestone = async (milestoneIndex: number) => {
    if (!confirm('Are you sure you want to mark this milestone as complete?')) return;
    
    try {
      await completeMilestone(escrowAddress, milestoneIndex);
      await fetchEscrowData();
    } catch (error) {
      console.error('Failed to complete milestone:', error);
    }
  };

  const handleReleaseFunds = async (milestoneIndex: number) => {
    if (!confirm('Are you sure you want to release funds for this milestone?')) return;
    
    try {
      await releaseFunds(
        escrowAddress,
        milestoneIndex,
        tokenMint,
        escrow.recipient
      );
      await fetchEscrowData();
    } catch (error) {
      console.error('Failed to release funds:', error);
    }
  };

  const handleInitiateEmergencyWithdrawal = async () => {
    if (!confirm('Are you sure you want to initiate emergency withdrawal? This requires multi-signature.')) return;
    
    try {
      const validSigners = emergencySigners
        .filter(s => s.trim() !== '' && PublicKey.isOnCurve(s.trim()))
        .map(s => new PublicKey(s.trim()));
      
      if (validSigners.length < 2) {
        alert('At least 2 valid signer addresses are required for emergency withdrawal');
        return;
      }
      
      await initiateEmergencyWithdrawal(
        escrowAddress,
        escrow.creator,
        validSigners.map(s => s.toString())
      );
      
      alert('Emergency withdrawal initiated. Signers need to approve the withdrawal.');
    } catch (error) {
      console.error('Failed to initiate emergency withdrawal:', error);
    }
  };

  const handleSignEmergencyWithdrawal = async () => {
    if (!confirm('Are you sure you want to sign this emergency withdrawal?')) return;
    
    try {
      await signEmergencyWithdrawal(escrowAddress);
      alert('Successfully signed the emergency withdrawal');
    } catch (error) {
      console.error('Failed to sign emergency withdrawal:', error);
    }
  };

  const isCreator = publicKey?.toString() === escrow?.creator;
  const isRecipient = publicKey?.toString() === escrow?.recipient;
  const isParticipant = isCreator || isRecipient;

  if (isRefreshing && !escrow) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Escrow not found</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Escrows
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold">Escrow Details</h2>
        <div className="ml-auto flex space-x-2">
          <button
            onClick={fetchEscrowData}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            title="Refresh"
          >
            ⟳
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {escrow.status}
          </div>
          <div className="text-sm text-gray-500">
            Created: {new Date(escrow.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Creator</h3>
            <p className="font-mono text-sm truncate" title={escrow.creator}>
              {escrow.creator}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Recipient</h3>
            <p className="font-mono text-sm truncate" title={escrow.recipient}>
              {escrow.recipient}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
            <p>{(escrow.totalAmount / 1_000_000).toFixed(6)} DAPPR</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Released</h3>
            <p>{(escrow.releasedAmount / 1_000_000).toFixed(6)} DAPPR</p>
          </div>
        </div>
      </div>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'milestones'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Milestones
          </button>
          {isCreator && (
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'withdraw'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Emergency Withdraw
            </button>
          )}
        </nav>
      </div>
      
      {activeTab === 'details' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Escrow Address</h3>
            <p className="font-mono text-sm break-all">{escrowAddress}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Token Mint</h3>
            <p className="font-mono text-sm break-all">{escrow.tokenMint}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Token Account</h3>
            <p className="font-mono text-sm break-all">{escrow.tokenAccount}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created At</h3>
            <p>{new Date(escrow.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <p>{formatDistanceToNow(new Date(escrow.updatedAt), { addSuffix: true })}</p>
          </div>
        </div>
      )}
      
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                milestone.completedAt
                  ? milestone.paidAt
                    ? 'border-green-200 bg-green-50'
                    : 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">Milestone {index + 1}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {(milestone.amount / 1_000_000).toFixed(6)} DAPPR • Due:{' '}
                    {format(new Date(milestone.deadline), 'MMM d, yyyy')}
                  </p>
                  {milestone.description && (
                    <p className="mt-2 text-sm text-gray-700">{milestone.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {milestone.completedAt ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                      Pending
                    </span>
                  )}
                  {milestone.paidAt && (
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      Paid on {format(new Date(milestone.paidAt), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                {isRecipient && !milestone.completedAt && (
                  <button
                    onClick={() => handleCompleteMilestone(index)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Mark as Complete
                  </button>
                )}
                
                {isCreator && milestone.completedAt && !milestone.paidAt && (
                  <button
                    onClick={() => handleReleaseFunds(index)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Release Funds
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'withdraw' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Emergency withdrawal allows the creator to recover funds in case of disputes or issues with the recipient. 
                  This requires approval from at least 2 out of 3 signers.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Emergency Signers</h3>
            <p className="text-sm text-gray-600">
              Enter at least 2 valid Solana addresses that will need to sign the emergency withdrawal.
            </p>
            
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Signer {i + 1}
                  </label>
                  <input
                    type="text"
                    value={emergencySigners[i]}
                    onChange={(e) => {
                      const newSigners = [...emergencySigners];
                      newSigners[i] = e.target.value;
                      setEmergencySigners(newSigners);
                    }}
                    placeholder="Enter Solana address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleInitiateEmergencyWithdrawal}
                disabled={isLoading || emergencySigners.filter(s => s.trim() !== '').length < 2}
                className={`px-4 py-2 rounded-md text-white font-medium ${
                  isLoading || emergencySigners.filter(s => s.trim() !== '').length < 2
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {isLoading ? 'Processing...' : 'Initiate Emergency Withdrawal'}
              </button>
              
              <button
                onClick={handleSignEmergencyWithdrawal}
                className="ml-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={isLoading}
              >
                Sign Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowDetails;
