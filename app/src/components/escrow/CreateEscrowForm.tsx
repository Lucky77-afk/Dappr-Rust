import { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useEscrow } from '../../hooks/useEscrow';
import { useWallet } from '@solana/wallet-adapter-react';

export const CreateEscrowForm = () => {
  const { publicKey } = useWallet();
  const { createEscrow, isLoading } = useEscrow();
  
  const [recipient, setRecipient] = useState('');
  const [tokenMint, setTokenMint] = useState('');
  const [milestones, setMilestones] = useState([
    { amount: '', deadline: '', description: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    if (!publicKey) return 'Wallet not connected';
    if (!recipient || !PublicKey.isOnCurve(recipient)) return 'Invalid recipient address';
    if (!tokenMint || !PublicKey.isOnCurve(tokenMint)) return 'Invalid token mint address';
    
    if (milestones.length === 0) return 'At least one milestone is required';
    
    for (let i = 0; i < milestones.length; i++) {
      const { amount, deadline, description } = milestones[i];
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return `Invalid amount for milestone ${i + 1}`;
      }
      if (!deadline) {
        return `Deadline is required for milestone ${i + 1}`;
      }
      if (!description.trim()) {
        return `Description is required for milestone ${i + 1}`;
      }
    }
    
    return null;
  }, [publicKey, recipient, tokenMint, milestones]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { amount: '', deadline: '', description: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    const updated = [...milestones];
    updated.splice(index, 1);
    setMilestones(updated);
  };

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const milestoneData = milestones.map(ms => ({
        amount: Math.floor(Number(ms.amount) * 1e6), // Convert to token decimals (6)
        deadline: Math.floor(new Date(ms.deadline).getTime() / 1000), // Convert to Unix timestamp
        description: ms.description,
      }));
      
      const result = await createEscrow(
        recipient,
        milestoneData,
        tokenMint
      );
      
      console.log('Escrow created:', result);
      alert('Escrow created successfully!');
      
      // Reset form
      setRecipient('');
      setTokenMint('');
      setMilestones([{ amount: '', deadline: '', description: '' }]);
    } catch (error) {
      console.error('Error creating escrow:', error);
      alert('Failed to create escrow. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Escrow</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient's wallet address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting || isLoading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token Mint Address
          </label>
          <input
            type="text"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            placeholder="Enter token mint address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting || isLoading}
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Milestones</h3>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isSubmitting || isLoading}
            >
              Add Milestone
            </button>
          </div>
          
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md relative">
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    disabled={isSubmitting || isLoading}
                  >
                    ✕
                  </button>
                )}
                
                <h4 className="font-medium mb-3">Milestone {index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Amount (in tokens)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      min="0"
                      value={milestone.amount}
                      onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting || isLoading}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={milestone.deadline}
                      onChange={(e) => handleMilestoneChange(index, 'deadline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting || isLoading}
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    value={milestone.description}
                    onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                    placeholder="Describe what needs to be completed for this milestone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    disabled={isSubmitting || isLoading}
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isLoading || !publicKey}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isSubmitting || isLoading || !publicKey
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {!publicKey
              ? 'Connect Wallet'
              : isSubmitting || isLoading
              ? 'Processing...'
              : 'Create Escrow'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEscrowForm;
