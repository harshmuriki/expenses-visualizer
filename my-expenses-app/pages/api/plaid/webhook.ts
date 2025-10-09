import type { NextApiRequest, NextApiResponse } from "next";
import { triggerSyncForItemId } from "@/lib/transactionSync";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { webhook_type: webhookType, webhook_code: webhookCode, item_id: itemId } = req.body ?? {};
    if (!itemId || typeof itemId !== "string") {
      return res.status(200).json({ received: true, ignored: true });
    }

    if (
      webhookType === "TRANSACTIONS" &&
      (webhookCode === "SYNC_UPDATES_AVAILABLE" || webhookCode === "INITIAL_UPDATE")
    ) {
      await triggerSyncForItemId(itemId);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Failed to process webhook", error);
    return res.status(500).json({ error: "Unable to process webhook" });
  }
};

export default handler;
