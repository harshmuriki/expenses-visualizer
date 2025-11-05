/**
 * Bank Provider Factory
 *
 * Factory pattern to instantiate the correct bank provider based on configuration
 */

import { IBankProvider, BankProviderType, getProviderConfig } from './bankProvider';
import { plaidProvider } from './plaidClient';

/**
 * Local Provider (CSV/PDF upload)
 * This is a no-op provider since local upload doesn't need API integration
 */
class LocalProvider implements IBankProvider {
  readonly provider = 'local' as const;

  async createLinkToken(): Promise<never> {
    throw new Error(
      'Local provider does not support link token creation. Use CSV/PDF upload instead.'
    );
  }

  async exchangePublicToken(): Promise<never> {
    throw new Error(
      'Local provider does not support token exchange. Use CSV/PDF upload instead.'
    );
  }

  async syncTransactions(): Promise<never> {
    throw new Error(
      'Local provider does not support transaction sync. Use CSV/PDF upload instead.'
    );
  }

  async getAccounts(): Promise<never> {
    throw new Error(
      'Local provider does not support account listing. Use CSV/PDF upload instead.'
    );
  }
}

const localProvider = new LocalProvider();

/**
 * Get the bank provider instance based on configuration
 */
export const getBankProvider = (
  providerType?: BankProviderType
): IBankProvider => {
  const provider = providerType || getProviderConfig().provider;

  switch (provider) {
    case 'plaid':
      return plaidProvider;
    case 'local':
      return localProvider;
    default:
      // Default to local if unknown provider
      return localProvider;
  }
};

/**
 * Get the current active provider type
 */
export const getActiveProvider = (): BankProviderType => {
  return getProviderConfig().provider;
};
