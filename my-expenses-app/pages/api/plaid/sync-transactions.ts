import type { NextApiRequest, NextApiResponse } from "next";
import { syncTransactionsForItem } from "@/lib/transactionSync";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, itemId, month } = req.body ?? {};
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!itemId || typeof itemId !== "string") {
      return res.status(400).json({ error: "itemId is required" });
    }

    const result = await syncTransactionsForItem({ userId, itemId, month });
    return res.status(result.success ? 200 : 400).json({
      success: result.success,
      itemId: result.itemId,
      month: result.month,
      synced: result.syncedTransactions,
      message: result.message,
    });
  } catch (error) {
    console.error("Failed to sync transactions", error);
    return res.status(500).json({ error: "Unable to sync transactions" });
  }
};

export default handler;
