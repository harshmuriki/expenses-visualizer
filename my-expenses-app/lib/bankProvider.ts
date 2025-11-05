/**
 * Bank Provider Abstraction Layer
 *
 * This module provides a unified interface for different bank connection providers
 * (Plaid, local CSV/PDF uploads) to enable easy switching between providers.
 */

export type BankProviderType = 'plaid' | 'local';

export interface BankTransaction {
  transaction_id: string;
  account_id: string;
  name: string;
  amount: number;
  date: string;
  pending: boolean;
  category?: string[];
  merchant_name?: string | null;
  iso_currency_code?: string;
}

export interface BankAccount {
  account_id: string;
  name: string;
  type: string;
  subtype?: string;
  mask?: string;
}

export interface LinkTokenResponse {
  link_token?: string;  // For Plaid
  provider: BankProviderType;
}

export interface AccessTokenResponse {
  access_token: string;
  item_id: string;
  provider: BankProviderType;
}

export interface TransactionSyncResponse {
  added: BankTransaction[];
  modified: BankTransaction[];
  removed: Array<{ transaction_id: string }>;
  has_more: boolean;
  next_cursor?: string | null;
}

/**
 * Abstract interface for bank connection providers
 */
export interface IBankProvider {
  readonly provider: BankProviderType;

  /**
   * Create a link token for user to connect their bank
   */
  createLinkToken(userId: string): Promise<LinkTokenResponse>;

  /**
   * Exchange public token for access token after user connects
   */
  exchangePublicToken(publicToken: string): Promise<AccessTokenResponse>;

  /**
   * Sync transactions for a connected account
   */
  syncTransactions(params: {
    accessToken: string;
    cursor?: string | null;
  }): Promise<TransactionSyncResponse>;

  /**
   * Get accounts for a connected access token
   */
  getAccounts(accessToken: string): Promise<BankAccount[]>;
}

/**
 * Provider configuration stored in environment variables or user settings
 */
export interface ProviderConfig {
  provider: BankProviderType;
  // Plaid specific
  plaidClientId?: string;
  plaidSecret?: string;
  plaidEnv?: string;
}

/**
 * Get the current provider configuration from environment variables
 */
export const getProviderConfig = (): ProviderConfig => {
  // Check if user has explicitly set a provider
  const envProvider = process.env.BANK_PROVIDER as BankProviderType;

  // Default to 'local' if no provider is configured
  if (!envProvider || envProvider === 'local') {
    return { provider: 'local' };
  }

  // For Plaid
  if (envProvider === 'plaid') {
    return {
      provider: 'plaid',
      plaidClientId: process.env.PLAID_CLIENT_ID,
      plaidSecret: process.env.PLAID_SECRET,
      plaidEnv: process.env.PLAID_ENV || 'sandbox',
    };
  }

  // Fallback to local
  return { provider: 'local' };
};

/**
 * Check if a bank provider is available (has required configuration)
 */
export const isProviderAvailable = (provider: BankProviderType): boolean => {
  switch (provider) {
    case 'local':
      // Local CSV/PDF upload is always available
      return true;
    case 'plaid':
      return !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
    default:
      return false;
  }
};

/**
 * Get all available providers
 */
export const getAvailableProviders = (): BankProviderType[] => {
  const providers: BankProviderType[] = ['local'];

  if (isProviderAvailable('plaid')) {
    providers.push('plaid');
  }

  return providers;
};
