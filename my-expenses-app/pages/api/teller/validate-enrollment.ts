/**
 * API Route: Validate Teller enrollment
 *
 * Validates an access token received from Teller Connect and stores it securely.
 * Similar to Plaid's exchange-public-token but for Teller's enrollment flow.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { validateEnrollment } from '@/lib/tellerClient';
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
      console.error('[Teller] No session or user email');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { accessToken, institution } = req.body;

    console.log('[Teller] Validate enrollment request:', {
      hasAccessToken: !!accessToken,
      tokenLength: accessToken?.length,
      institution,
      user: session.user.email
    });

    if (!accessToken) {
      console.error('[Teller] No access token provided');
      return res.status(400).json({ error: 'Access token is required' });
    }

    const userId = session.user.email;

    // Validate the enrollment and get enrollment details
    console.log('[Teller] Calling validateEnrollment...');
    const enrollmentData = await validateEnrollment(accessToken);
    console.log('[Teller] Validation successful, item_id:', enrollmentData.item_id);

    // Store the access token securely in Firestore
    console.log('[Teller] Storing access token in Firestore...');
    await storeAccessToken(
      userId,
      enrollmentData.item_id,
      enrollmentData.access_token,
      institution || 'teller'
    );
    console.log('[Teller] Access token stored successfully');

    return res.status(200).json({
      success: true,
      item_id: enrollmentData.item_id,
    });
  } catch (error) {
    console.error('[Teller] Validation error:', error);
    if (error instanceof Error) {
      console.error('[Teller] Error message:', error.message);
      console.error('[Teller] Error stack:', error.stack);
    }
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to validate enrollment',
    });
  }
}
