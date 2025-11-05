const PLAID_ENVIRONMENTS: Record<string, string> = {
  sandbox: "https://sandbox.plaid.com",
  development: "https://development.plaid.com",
  production: "https://production.plaid.com",
};

export interface PlaidLinkTokenResponse {
  link_token: string;
  expiration: string;
}

export interface PlaidExchangeResponse {
  access_token: string;
  item_id: string;
  request_id: string;
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name?: string;
  merchant_name?: string | null;
  category?: string[];
  pending?: boolean;
  iso_currency_code?: string;
  unofficial_currency_code?: string;
  [key: string]: unknown;
}

export interface PlaidSyncResponse {
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: Array<{ transaction_id: string }>;
  next_cursor: string | null;
  has_more: boolean;
}

const getCredentials = () => {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = process.env.PLAID_ENV || "sandbox";

  if (!clientId || !secret) {
    throw new Error(
      "Plaid credentials are not configured. Set PLAID_CLIENT_ID and PLAID_SECRET."
    );
  }

  const baseUrl = PLAID_ENVIRONMENTS[env] ?? PLAID_ENVIRONMENTS.sandbox;

  return { clientId, secret, baseUrl };
};

const plaidRequest = async <T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> => {
  const { clientId, secret, baseUrl } = getCredentials();
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      secret,
      ...body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Plaid request failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as T;
};

// Hash email to create a safe user ID (Plaid doesn't allow emails)
const hashUserId = (email: string): string => {
  // Simple hash function to convert email to a safe ID
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `user_${Math.abs(hash).toString(36)}`;
};

export const createLinkToken = async (
  userId: string
): Promise<PlaidLinkTokenResponse> => {
  // Convert email to a safe user ID (Plaid rejects emails)
  const safeUserId = userId.includes("@") ? hashUserId(userId) : userId;

  return plaidRequest<PlaidLinkTokenResponse>("/link/token/create", {
    user: {
      client_user_id: safeUserId,
    },
    client_name: "Expenses Visualizer",
    language: "en",
    country_codes: ["US"],
    products: ["transactions"],
  });
};

export const exchangePublicToken = async (
  publicToken: string
): Promise<PlaidExchangeResponse> => {
  return plaidRequest<PlaidExchangeResponse>("/item/public_token/exchange", {
    public_token: publicToken,
  });
};

export interface TransactionsSyncOptions {
  accessToken: string;
  cursor?: string | null;
}

export const syncTransactions = async ({
  accessToken,
  cursor,
}: TransactionsSyncOptions): Promise<PlaidSyncResponse> => {
  return plaidRequest<PlaidSyncResponse>("/transactions/sync", {
    access_token: accessToken,
    cursor: cursor ?? undefined,
    count: 500,
  });
};

/**
 * Plaid Provider Implementation
 * Implements IBankProvider for unified bank provider interface
 */
import {
  IBankProvider,
  LinkTokenResponse,
  AccessTokenResponse,
  TransactionSyncResponse,
  BankTransaction,
  BankAccount,
} from './bankProvider';

const mapPlaidToBankTransaction = (txn: PlaidTransaction): BankTransaction => {
  return {
    transaction_id: txn.transaction_id,
    account_id: txn.account_id,
    name: txn.name || 'Transaction',
    amount: txn.amount,
    date: txn.date,
    pending: txn.pending ?? false,
    category: txn.category,
    merchant_name: txn.merchant_name,
    iso_currency_code: txn.iso_currency_code || txn.unofficial_currency_code,
  };
};

export class PlaidProvider implements IBankProvider {
  readonly provider = 'plaid' as const;

  async createLinkToken(userId: string): Promise<LinkTokenResponse> {
    const response = await createLinkToken(userId);
    return {
      link_token: response.link_token,
      provider: 'plaid',
    };
  }

  async exchangePublicToken(publicToken: string): Promise<AccessTokenResponse> {
    const response = await exchangePublicToken(publicToken);
    return {
      access_token: response.access_token,
      item_id: response.item_id,
      provider: 'plaid',
    };
  }

  async syncTransactions(params: {
    accessToken: string;
    cursor?: string | null;
  }): Promise<TransactionSyncResponse> {
    const response = await syncTransactions(params);
    return {
      added: response.added.map(mapPlaidToBankTransaction),
      modified: response.modified.map(mapPlaidToBankTransaction),
      removed: response.removed,
      has_more: response.has_more,
      next_cursor: response.next_cursor,
    };
  }

  async getAccounts(_accessToken: string): Promise<BankAccount[]> {
    // Plaid accounts are typically fetched differently
    // For now, return empty array - can be implemented later if needed
    return [];
  }
}

// Export singleton instance
export const plaidProvider = new PlaidProvider();
