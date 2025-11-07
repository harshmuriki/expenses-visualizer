import type { NextApiRequest, NextApiResponse } from "next";
import { listUserItems } from "@/lib/secureStore";

interface ConnectedAccount {
  itemId: string;
  institution?: string | null;
  createdAt: string;
  updatedAt: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }

    const items = await listUserItems(userId);
    const accounts: ConnectedAccount[] = items.map((item) => ({
      itemId: item.itemId,
      institution: item.institution,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      accounts,
    });
  } catch (error) {
    console.error("Failed to get connected accounts", error);
    return res.status(500).json({
      error: "Unable to get connected accounts",
    });
  }
};

export default handler;
