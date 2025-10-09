import type { NextApiRequest, NextApiResponse } from "next";
import { createLinkToken } from "@/lib/plaidClient";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body ?? {};
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }

    const linkToken = await createLinkToken(userId);
    return res.status(200).json(linkToken);
  } catch (error) {
    console.error("Failed to create link token", error);
    return res.status(500).json({ error: "Unable to create link token" });
  }
};

export default handler;
