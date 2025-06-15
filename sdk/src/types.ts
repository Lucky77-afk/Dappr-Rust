import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export type TokenType = 'DAPPR_GOV' | 'DAPPR_USD';

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  uri: string;
  mint?: PublicKey;
}

export interface TokenAccountInfo {
  address: PublicKey;
  mint: PublicKey;
  owner: PublicKey;
  amount: number;
  decimals: number;
}

export interface InitializeTokensParams {
  dapprGovMint: PublicKey;
  dapprUsdMint: PublicKey;
}

export interface MintTokensParams {
  mint: PublicKey;
  recipient: PublicKey;
  amount: number;
}

export interface BurnTokensParams {
  mint: PublicKey;
  amount: number;
}
// Error types
export class DapprError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'DapprError';
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DapprError);
    }
  }
}

export class TokenAccountNotFoundError extends DapprError {
  constructor(mint: PublicKey, owner: PublicKey) {
    super(`Token account not found for mint ${mint.toString()} and owner ${owner.toString()}`);
    this.name = 'TokenAccountNotFoundError';
  }
}

export class InsufficientFundsError extends DapprError {
  constructor(public readonly balance: number, public readonly required: number) {
    super(`Insufficient funds. Required: ${required}, Available: ${balance}`);
    this.name = 'InsufficientFundsError';
  }
}

// Event types
export enum DapprEventType {
  TokensMinted = 'TokensMinted',
  TokensBurned = 'TokensBurned',
  TokensTransferred = 'TokensTransferred',
}

export interface TokensMintedEvent {
  type: DapprEventType.TokensMinted;
  mint: PublicKey;
  recipient: PublicKey;
  amount: number;
}

export interface TokensBurnedEvent {
  type: DapprEventType.TokensBurned;
  mint: PublicKey;
  authority: PublicKey;
  amount: number;
}

export type DapprEvent = TokensMintedEvent | TokensBurnedEvent;

// Type guards
export function isTokensMintedEvent(event: DapprEvent): event is TokensMintedEvent {
  return event.type === DapprEventType.TokensMinted;
}

export function isTokensBurnedEvent(event: DapprEvent): event is TokensBurnedEvent {
  return event.type === DapprEventType.TokensBurned;
}

// Escrow Types
export enum EscrowStatus {
  Initialized = 'initialized',
  Funded = 'funded',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Disputed = 'disputed'
}

export enum MilestoneStatus {
  Pending = 'pending',
  Completed = 'completed',
  Paid = 'paid',
  Failed = 'failed'
}

export interface Milestone {
  index: number;
  amount: BN;
  deadline: BN;
  status: MilestoneStatus;
  completedAt: BN | null;
  paidAt: BN | null;
}

export interface Multisig {
  escrow: PublicKey;
  signers: PublicKey[];
  signatures: boolean[];
  threshold: number;
  createdAt: BN;
  executed: boolean;
}

export interface Escrow {
  creator: PublicKey;
  recipient: PublicKey;
  tokenMint: PublicKey;
  tokenAccount: PublicKey;
  totalAmount: BN;
  releasedAmount: BN;
  milestonesCount: number;
  status: EscrowStatus;
  createdAt: BN;
  updatedAt: BN;
}

// Escrow Events
export enum EscrowEventType {
  EscrowCreated = 'EscrowCreated',
  MilestoneAdded = 'MilestoneAdded',
  EscrowFunded = 'EscrowFunded',
  MilestoneCompleted = 'MilestoneCompleted',
  FundsReleased = 'FundsReleased',
  EmergencyWithdrawalInitiated = 'EmergencyWithdrawalInitiated',
  EmergencyWithdrawalSigned = 'EmergencyWithdrawalSigned',
  EmergencyWithdrawalExecuted = 'EmergencyWithdrawalExecuted',
}

export interface EscrowCreatedEvent {
  type: EscrowEventType.EscrowCreated;
  escrow: PublicKey;
  creator: PublicKey;
  recipient: PublicKey;
  tokenMint: PublicKey;
  totalAmount: BN;
}

export interface MilestoneAddedEvent {
  type: EscrowEventType.MilestoneAdded;
  escrow: PublicKey;
  milestoneIndex: number;
  amount: BN;
  deadline: BN;
}

export interface EscrowFundedEvent {
  type: EscrowEventType.EscrowFunded;
  escrow: PublicKey;
  funder: PublicKey;
  amount: BN;
}

export interface MilestoneCompletedEvent {
  type: EscrowEventType.MilestoneCompleted;
  escrow: PublicKey;
  milestoneIndex: number;
  completedBy: PublicKey;
}

export interface FundsReleasedEvent {
  type: EscrowEventType.FundsReleased;
  escrow: PublicKey;
  milestoneIndex: number;
  amount: BN;
  recipient: PublicKey;
}

export interface EmergencyWithdrawalInitiatedEvent {
  type: EscrowEventType.EmergencyWithdrawalInitiated;
  escrow: PublicKey;
  initiator: PublicKey;
  signers: PublicKey[];
  threshold: number;
}

export interface EmergencyWithdrawalSignedEvent {
  type: EscrowEventType.EmergencyWithdrawalSigned;
  escrow: PublicKey;
  signer: PublicKey;
  signatures: boolean[];
}

export interface EmergencyWithdrawalExecutedEvent {
  type: EscrowEventType.EmergencyWithdrawalExecuted;
  escrow: PublicKey;
  executor: PublicKey;
  amount: BN;
  recipient: PublicKey;
}

export type EscrowEvent = 
  | EscrowCreatedEvent
  | MilestoneAddedEvent
  | EscrowFundedEvent
  | MilestoneCompletedEvent
  | FundsReleasedEvent
  | EmergencyWithdrawalInitiatedEvent
  | EmergencyWithdrawalSignedEvent
  | EmergencyWithdrawalExecutedEvent;

// Escrow Error Types
export class EscrowError extends DapprError {
  constructor(message: string, public readonly originalError?: Error) {
    super(`EscrowError: ${message}`, originalError);
    this.name = 'EscrowError';
  }
}

export class EscrowNotFundedError extends EscrowError {
  constructor(publicKey: PublicKey) {
    super(`Escrow ${publicKey.toString()} is not funded`);
    this.name = 'EscrowNotFundedError';
  }
}

export class MilestoneNotCompletedError extends EscrowError {
  constructor(public escrow: PublicKey, public milestoneIndex: number) {
    super(`Milestone ${milestoneIndex} in escrow ${escrow.toString()} is not completed`);
    this.name = 'MilestoneNotCompletedError';
  }
}

export class DeadlineNotReachedError extends EscrowError {
  constructor(public deadline: BN) {
    super(`Deadline ${new Date(deadline.toNumber() * 1000).toISOString()} has not been reached`);
    this.name = 'DeadlineNotReachedError';
  }
}

export class InsufficientSignaturesError extends EscrowError {
  constructor(public current: number, public required: number) {
    super(`Insufficient signatures. Required: ${required}, Current: ${current}`);
    this.name = 'InsufficientSignaturesError';
  }
}

export class UnauthorizedSignerError extends EscrowError {
  constructor(public signer: PublicKey) {
    super(`Signer ${signer.toString()} is not authorized`);
    this.name = 'UnauthorizedSignerError';
  }
}

// Type guards for escrow events
export function isEscrowCreatedEvent(event: EscrowEvent): event is EscrowCreatedEvent {
  return event.type === EscrowEventType.EscrowCreated;
}

export function isMilestoneAddedEvent(event: EscrowEvent): event is MilestoneAddedEvent {
  return event.type === EscrowEventType.MilestoneAdded;
}

export function isEscrowFundedEvent(event: EscrowEvent): event is EscrowFundedEvent {
  return event.type === EscrowEventType.EscrowFunded;
}

export function isMilestoneCompletedEvent(event: EscrowEvent): event is MilestoneCompletedEvent {
  return event.type === EscrowEventType.MilestoneCompleted;
}

export function isFundsReleasedEvent(event: EscrowEvent): event is FundsReleasedEvent {
  return event.type === EscrowEventType.FundsReleased;
}

export function isEmergencyWithdrawalInitiatedEvent(event: EscrowEvent): event is EmergencyWithdrawalInitiatedEvent {
  return event.type === EscrowEventType.EmergencyWithdrawalInitiated;
}

export function isEmergencyWithdrawalSignedEvent(event: EscrowEvent): event is EmergencyWithdrawalSignedEvent {
  return event.type === EscrowEventType.EmergencyWithdrawalSigned;
}

export function isEmergencyWithdrawalExecutedEvent(event: EscrowEvent): event is EmergencyWithdrawalExecutedEvent {
  return event.type === EscrowEventType.EmergencyWithdrawalExecuted;
}
