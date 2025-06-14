import { PublicKey } from '@solana/web3.js';

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
