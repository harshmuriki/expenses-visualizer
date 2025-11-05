/**
 * API Route: Universal Bank Connection
 *
 * Creates a connection token/URL for the configured bank provider.
 * This route automatically uses the provider specified in environment variables.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { getBankProvider } from '@/lib/providerFactory';
import { getProviderConfig } from '@/lib/bankProvider';

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

    const userId = session.user.email;
    const config = getProviderConfig();

    // Check if provider is 'local' (CSV/PDF upload)
    if (config.provider === 'local') {
      return res.status(200).json({
        provider: 'local',
        message: 'Using local CSV/PDF upload. No connection needed.',
      });
    }

    // Get the appropriate provider
    const provider = getBankProvider(config.provider);

    // Create link token/enrollment URL
    const linkData = await provider.createLinkToken(userId);

    return res.status(200).json(linkData);
  } catch (error) {
    console.error('Error creating bank connection:', error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to create connection',
    });
  }
}
