/**
 * API Route: Sync transactions from Teller
 *
 * Fetches and processes transactions from a connected Teller account.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { syncTransactionsForItem } from '@/lib/transactionSync';

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

    const { itemId, month } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    const userId = session.user.email;

    // Sync transactions for this item
    const result = await syncTransactionsForItem({
      userId,
      itemId,
      month,
    });

    if (!result.success) {
      return res.status(400).json({
        error: result.message || 'Failed to sync transactions',
      });
    }

    return res.status(200).json({
      success: true,
      synced: result.syncedTransactions,
      month: result.month,
    });
  } catch (error) {
    console.error('Error syncing Teller transactions:', error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Failed to sync transactions',
    });
  }
}
