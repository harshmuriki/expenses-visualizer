import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { syncTransactionsForItem } from "@/lib/transactionSync";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Authenticate user
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { itemId, month } = req.body ?? {};
    if (!itemId || typeof itemId !== "string") {
      return res.status(400).json({ error: "itemId is required" });
    }

    const userId = session.user.email;
    const result = await syncTransactionsForItem({ userId, itemId, month });
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Failed to sync transactions", error);
    return res.status(500).json({ error: "Unable to sync transactions" });
  }
};

export default handler;
