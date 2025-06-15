import { PublicKey } from '@solana/web3.js';
import { DapprClient } from '@dappr/sdk';

export interface MilestoneInput {
  amount: number;
  deadline: number; // Unix timestamp in seconds
  description: string;
}

export const createEscrowWithMilestones = async (
  client: DapprClient,
  recipient: string,
  milestones: MilestoneInput[],
  tokenMint: string
) => {
  try {
    // 1. Initialize the escrow
    const { escrow: escrowPubkey } = await client.escrow.initializeEscrow(
      new PublicKey(recipient),
      milestones.length
    );

    // 2. Add each milestone
    const milestonePDAs = [];
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      const { milestone: milestonePDA } = await client.escrow.addMilestone(
        escrowPubkey,
        i,
        milestone.amount,
        milestone.deadline
      );
      milestonePDAs.push(milestonePDA.toString());
    }

    // 3. Calculate total amount and fund the escrow
    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    const fundTx = await client.escrow.fundEscrow(
      escrowPubkey,
      new PublicKey(tokenMint),
      totalAmount
    );

    return {
      escrowAddress: escrowPubkey.toString(),
      milestoneAddresses: milestonePDAs,
      transaction: fundTx,
    };
  } catch (error) {
    console.error('Error in createEscrowWithMilestones:', error);
    throw error;
  }
};

export const completeAndReleaseMilestone = async (
  client: DapprClient,
  escrowAddress: string,
  milestoneIndex: number,
  tokenMint: string,
  recipient: string
) => {
  try {
    // 1. Mark milestone as complete
    await client.escrow.completeMilestone(
      new PublicKey(escrowAddress),
      milestoneIndex
    );

    // 2. Release funds for the milestone
    const releaseTx = await client.escrow.releaseFunds(
      new PublicKey(escrowAddress),
      milestoneIndex,
      new PublicKey(tokenMint),
      new PublicKey(recipient)
    );

    return {
      transaction: releaseTx,
    };
  } catch (error) {
    console.error('Error in completeAndReleaseMilestone:', error);
    throw error;
  }
};

export const initiateEmergencyWithdrawalProcess = async (
  client: DapprClient,
  escrowAddress: string,
  creator: string,
  signers: string[]
) => {
  try {
    const { multisig, tx } = await client.escrow.initiateEmergencyWithdrawal(
      new PublicKey(escrowAddress),
      new PublicKey(creator),
      signers.map(s => new PublicKey(s))
    );

    return {
      multisig: multisig.toString(),
      transaction: tx,
    };
  } catch (error) {
    console.error('Error in initiateEmergencyWithdrawalProcess:', error);
    throw error;
  }
};

export const signEmergencyWithdrawalProcess = async (
  client: DapprClient,
  escrowAddress: string
) => {
  try {
    const tx = await client.escrow.signEmergencyWithdrawal(
      new PublicKey(escrowAddress)
    );

    return { transaction: tx };
  } catch (error) {
    console.error('Error in signEmergencyWithdrawalProcess:', error);
    throw error;
  }
};
