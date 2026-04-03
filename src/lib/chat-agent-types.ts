import { Product } from './types';

// OWS Spending Policy Limits
export interface SpendingPolicy {
  maxPerTransaction: number;
  dailyLimit: number;
  allowedCategories: string[]; // '*' for all
}

export interface WalletState {
  balance: number;
  dailySpent: number;
  currency: string;
}

export interface ChargeInvoice {
  id: string;
  amount: number;
  description: string;
  recipient: string;
  expiresAt: string;
}

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'policy_rejected';

export interface PaymentResult {
  status: PaymentStatus;
  reason?: string;
  invoiceId?: string;
  txHash?: string;
}

// Chat Messaging structures
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  // Custom payloads for assistant rendering UI
  suggestedProducts?: Product[];
  invoice?: ChargeInvoice;
  paymentResult?: PaymentResult;
  isProcessing?: boolean;
}

export interface IntentContext {
  intentType: 'greeting' | 'product_search' | 'payment_intent' | 'unknown';
  budgetLimit?: number;
  category?: string;
  queryTerm?: string;
}
