/**
 * API Route: Create Teller enrollment
 *
 * Returns the Teller App ID that the frontend needs to initialize Teller Connect.
 * Unlike Plaid, Teller doesn't require server-side link token creation.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { createTellerConnect } from '@/lib/tellerClient';

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

    // Create enrollment URL/info
    const enrollment = await createTellerConnect(userId);

    return res.status(200).json(enrollment);
  } catch (error) {
    console.error('Error creating Teller enrollment:', error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to create enrollment',
    });
  }
}
