/**
 * API Route: Get Bank Provider Status
 *
 * Returns information about the currently active bank provider
 * and which providers are available (configured).
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getProviderConfig,
  getAvailableProviders,
  BankProviderType,
} from '@/lib/bankProvider';

interface ProviderStatusResponse {
  active: BankProviderType;
  available: BankProviderType[];
  config: {
    provider: BankProviderType;
    hasPlaid: boolean;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProviderStatusResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = getProviderConfig();
    const available = getAvailableProviders();

    const response: ProviderStatusResponse = {
      active: config.provider,
      available,
      config: {
        provider: config.provider,
        hasPlaid: !!(config.plaidClientId && config.plaidSecret),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error getting provider status:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get provider status',
    });
  }
}
