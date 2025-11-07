import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { createLinkToken } from "@/lib/plaidClient";

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

    const userId = session.user.email;
    const linkToken = await createLinkToken(userId);
    return res.status(200).json(linkToken);
  } catch (error) {
    console.error("Failed to create link token", error);
    return res.status(500).json({ error: "Unable to create link token" });
  }
};

export default handler;
