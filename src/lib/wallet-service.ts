import { ChargeInvoice, PaymentResult, WalletState, SpendingPolicy } from './chat-agent-types';

class WalletServiceMock {
  private state: WalletState = {
    balance: 1500, // starting mock balance
    dailySpent: 120, // some daily spent mock
    currency: 'USD'
  };

  private policy: SpendingPolicy = {
    maxPerTransaction: 500,
    dailyLimit: 1000,
    allowedCategories: ['*'] // wildcard allows everything in this mock
  };

  getWalletInfo(): WalletState {
    return { ...this.state };
  }

  getPolicy(): SpendingPolicy {
    return { ...this.policy };
  }

  generateInvoice(amount: number, description: string): ChargeInvoice {
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // 15 mins expiry
    return {
      id: `inv-${Math.random().toString(36).substring(2, 9)}`,
      amount,
      description,
      recipient: 'TrendAI Merchant',
      expiresAt: expires.toISOString()
    };
  }

  processPayment(invoice: ChargeInvoice, category: string = 'general'): PaymentResult {
    // 1. Policy checks (OWS Simulation)
    if (this.policy.allowedCategories[0] !== '*' && !this.policy.allowedCategories.includes(category)) {
       return { status: 'policy_rejected', reason: `Category '${category}' is not allowed by policy.`, invoiceId: invoice.id };
    }

    if (invoice.amount > this.policy.maxPerTransaction) {
       return { status: 'policy_rejected', reason: `Amount $${invoice.amount} exceeds per-transaction limit $${this.policy.maxPerTransaction}.`, invoiceId: invoice.id };
    }

    if (this.state.dailySpent + invoice.amount > this.policy.dailyLimit) {
       return { status: 'policy_rejected', reason: `Daily limit of $${this.policy.dailyLimit} would be exceeded.`, invoiceId: invoice.id };
    }

    // 2. Balance checks
    if (this.state.balance < invoice.amount) {
       return { status: 'failed', reason: 'Insufficient funds.', invoiceId: invoice.id };
    }

    // 3. Simulated execution (Success)
    // Simulating MPP (Multi-Path Payment) by just creating a hash
    const fakeTxHash = `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    
    this.state.balance -= invoice.amount;
    this.state.dailySpent += invoice.amount;

    return {
      status: 'success',
      invoiceId: invoice.id,
      txHash: fakeTxHash
    };
  }
}

export const walletService = new WalletServiceMock();
