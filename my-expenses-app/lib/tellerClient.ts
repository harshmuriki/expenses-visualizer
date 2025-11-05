/**
 * Teller API Client
 *
 * Provides integration with Teller.io for bank account connections.
 * Teller offers 100 free live connections forever, making it a great
 * alternative to Plaid for small to medium applications.
 *
 * Docs: https://teller.io/docs/api
 */

import {
  BankTransaction,
  BankAccount,
  LinkTokenResponse,
  AccessTokenResponse,
  TransactionSyncResponse,
  IBankProvider,
} from './bankProvider';

const TELLER_ENVIRONMENTS: Record<string, string> = {
  sandbox: 'https://api.teller.io',
  production: 'https://api.teller.io',
};

export interface TellerAccount {
  id: string;
  enrollment_id: string;
  name: string;
  type: string;
  subtype: string;
  status: string;
  currency: string;
  institution: {
    name: string;
    id: string;
  };
  last_four?: string;
  links?: {
    balances?: string;
    self?: string;
    transactions?: string;
  };
}

export interface TellerTransaction {
  id: string;
  account_id: string;
  date: string;
  description: string;
  amount: string;
  type: string;
  status: string;
  details?: {
    category?: string;
    counterparty?: {
      name?: string;
      type?: string;
    };
  };
  running_balance?: string;
}

interface TellerCredentials {
  appId: string;
  certificate?: string;
  privateKey?: string;
  env: string;
  baseUrl: string;
}

const getCredentials = (): TellerCredentials => {
  const appId = process.env.TELLER_APP_ID;
  const env = process.env.TELLER_ENV || 'sandbox';

  if (!appId) {
    throw new Error(
      'Teller credentials are not configured. Set TELLER_APP_ID in your environment variables.'
    );
  }

  const baseUrl = TELLER_ENVIRONMENTS[env] ?? TELLER_ENVIRONMENTS.sandbox;

  return {
    appId,
    certificate: process.env.TELLER_CERTIFICATE,
    privateKey: process.env.TELLER_PRIVATE_KEY,
    env,
    baseUrl,
  };
};

/**
 * Make authenticated request to Teller API
 * Uses HTTP Basic Auth with access token as username
 */
const tellerRequest = async <T>(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> => {
  const { baseUrl } = getCredentials();

  // Teller uses Basic Auth with access token as username (password is empty)
  const auth = Buffer.from(`${accessToken}:`).toString('base64');

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Teller request failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as T;
};

/**
 * Convert Teller transaction to our standard format
 */
const mapTellerTransaction = (txn: TellerTransaction): BankTransaction => {
  return {
    transaction_id: txn.id,
    account_id: txn.account_id,
    name: txn.description,
    amount: Math.abs(parseFloat(txn.amount)),
    date: txn.date,
    pending: txn.status === 'pending',
    category: txn.details?.category ? [txn.details.category] : undefined,
    merchant_name: txn.details?.counterparty?.name || null,
    iso_currency_code: 'USD', // Teller returns amounts in USD by default
  };
};

/**
 * Convert Teller account to our standard format
 */
const mapTellerAccount = (account: TellerAccount): BankAccount => {
  return {
    account_id: account.id,
    name: account.name,
    type: account.type,
    subtype: account.subtype,
    mask: account.last_four,
  };
};

/**
 * Create a Teller Connect enrollment URL
 *
 * Note: Unlike Plaid, Teller doesn't require a server-side link token creation.
 * You can directly use Teller Connect in your frontend with your App ID.
 */
export const createTellerConnect = async (
  userId: string
): Promise<LinkTokenResponse> => {
  const { appId } = getCredentials();

  // Teller Connect doesn't require a server-side token creation
  // The frontend directly initializes with the App ID
  // We return the App ID here so the frontend knows what to use
  return {
    enrollment_url: `teller-connect://${appId}`,
    provider: 'teller',
  };
};

/**
 * Validate an enrollment (access token) from Teller Connect
 *
 * In Teller, the access token is provided directly after enrollment.
 * This function validates it by fetching accounts.
 */
export const validateEnrollment = async (
  accessToken: string
): Promise<AccessTokenResponse> => {
  try {
    // Test the access token by fetching accounts
    const accounts = await tellerRequest<TellerAccount[]>(
      '/accounts',
      accessToken
    );

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found for this enrollment');
    }

    // Use the first account's enrollment_id as the item_id
    const enrollmentId = accounts[0].enrollment_id;

    return {
      access_token: accessToken,
      item_id: enrollmentId,
      provider: 'teller',
    };
  } catch (error) {
    throw new Error(
      `Failed to validate Teller enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Get all accounts for an access token
 */
export const getAccounts = async (
  accessToken: string
): Promise<BankAccount[]> => {
  const accounts = await tellerRequest<TellerAccount[]>(
    '/accounts',
    accessToken
  );
  return accounts.map(mapTellerAccount);
};

/**
 * Get transactions for a specific account
 */
export const getTransactions = async (
  accessToken: string,
  accountId: string,
  options?: {
    from_date?: string;
    to_date?: string;
    count?: number;
  }
): Promise<BankTransaction[]> => {
  const queryParams = new URLSearchParams();
  if (options?.from_date) queryParams.append('from_date', options.from_date);
  if (options?.to_date) queryParams.append('to_date', options.to_date);
  if (options?.count) queryParams.append('count', options.count.toString());

  const query = queryParams.toString();
  const path = `/accounts/${accountId}/transactions${query ? `?${query}` : ''}`;

  const transactions = await tellerRequest<TellerTransaction[]>(
    path,
    accessToken
  );

  return transactions.map(mapTellerTransaction);
};

/**
 * Sync all transactions across all accounts for an access token
 *
 * Note: Teller doesn't have a cursor-based sync like Plaid.
 * This fetches all recent transactions.
 */
export const syncAllTransactions = async (
  accessToken: string,
  cursor?: string | null
): Promise<TransactionSyncResponse> => {
  // Get all accounts
  const accounts = await tellerRequest<TellerAccount[]>(
    '/accounts',
    accessToken
  );

  // Fetch transactions for each account
  const allTransactions: BankTransaction[] = [];

  for (const account of accounts) {
    const transactions = await getTransactions(accessToken, account.id, {
      count: 500,
    });
    allTransactions.push(...transactions);
  }

  // Teller doesn't support incremental sync with cursors
  // So we return all transactions as "added"
  return {
    added: allTransactions,
    modified: [],
    removed: [],
    has_more: false,
    next_cursor: null,
  };
};

/**
 * Teller Provider Implementation
 */
export class TellerProvider implements IBankProvider {
  readonly provider = 'teller' as const;

  async createLinkToken(userId: string): Promise<LinkTokenResponse> {
    return createTellerConnect(userId);
  }

  async exchangePublicToken(
    accessToken: string
  ): Promise<AccessTokenResponse> {
    return validateEnrollment(accessToken);
  }

  async syncTransactions(params: {
    accessToken: string;
    cursor?: string | null;
  }): Promise<TransactionSyncResponse> {
    return syncAllTransactions(params.accessToken, params.cursor);
  }

  async getAccounts(accessToken: string): Promise<BankAccount[]> {
    return getAccounts(accessToken);
  }
}

// Export singleton instance
export const tellerProvider = new TellerProvider();
