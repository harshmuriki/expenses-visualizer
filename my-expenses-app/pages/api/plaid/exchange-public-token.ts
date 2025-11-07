import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { exchangePublicToken } from "@/lib/plaidClient";
import { storeAccessToken } from "@/lib/transactionSync";

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

    const { public_token: publicToken, institution } = req.body ?? {};
    if (!publicToken || typeof publicToken !== "string") {
      return res.status(400).json({ error: "public_token is required" });
    }

    const userId = session.user.email;
    const exchange = await exchangePublicToken(publicToken);
    await storeAccessToken(userId, exchange.item_id, exchange.access_token, institution);

    return res.status(200).json({
      success: true,
      itemId: exchange.item_id,
    });
  } catch (error) {
    console.error("Failed to exchange public token", error);
    return res.status(500).json({ error: "Unable to exchange public token" });
  }
};

export default handler;
