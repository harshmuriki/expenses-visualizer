/**
 * API Route: Universal Token Exchange
 *
 * Exchanges a public token for an access token for the configured bank provider.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getBankProvider } from '@/lib/providerFactory';
import { getProviderConfig, BankProviderType } from '@/lib/bankProvider';
import { storeAccessToken } from '@/lib/transactionSync';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { publicToken, provider: requestProvider, institution } = req.body;

    if (!publicToken) {
      return res.status(400).json({ error: 'Public token is required' });
    }

    const userId = session.user.email;
    const config = getProviderConfig();

    // Use provider from request or fall back to config
    const providerType: BankProviderType = requestProvider || config.provider;

    // Get the appropriate provider
    const provider = getBankProvider(providerType);

    // Exchange the token
    const tokenData = await provider.exchangePublicToken(publicToken);

    // Store the access token securely
    await storeAccessToken(
      userId,
      tokenData.item_id,
      tokenData.access_token,
      institution || providerType
    );

    return res.status(200).json({
      success: true,
      item_id: tokenData.item_id,
      provider: tokenData.provider,
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to exchange token',
    });
  }
}
